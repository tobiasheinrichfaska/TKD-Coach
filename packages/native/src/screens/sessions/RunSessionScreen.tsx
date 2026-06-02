import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { generateId } from '../../utils/ids';
import { generateSessionSummaryText } from '../../utils/format';
import { primaryPhase, gameInPhase, bodyPartName, athletesInGroup, defaultAttendance, toggleAttendance, presentCount } from '../../domain';
import { SESSION_PHASE_LABELS } from '../../types';
import { useT } from '../../i18n';
import type { GameLog, SessionPhase, AttendanceEntry } from '../../types';
import type { SessionsStackScreenProps } from '../../types/navigation';

const beepAsset = require('../../../assets/beep.wav');

/** seconds -> M:SS (clamped at 0) */
const fmt = (sec: number): string => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
};

interface GameLogState {
  gameId: string;
  startedAt?: number;
  endedAt?: number;
  durationSeconds?: number;
  status: 'pending' | 'running' | 'completed';
}

// --- persistence mapping (so a running session survives navigation / app restart) ---
const fromPersisted = (gl: GameLog): GameLogState => ({
  gameId: gl.gameId,
  startedAt: gl.startedAt ? Date.parse(gl.startedAt) : undefined,
  endedAt: gl.endedAt ? Date.parse(gl.endedAt) : undefined,
  durationSeconds: gl.durationSeconds,
  status:
    gl.durationSeconds != null ? 'completed' : gl.startedAt && !gl.endedAt ? 'running' : 'pending',
});
const toPersisted = (gl: GameLogState): GameLog => ({
  gameId: gl.gameId,
  startedAt: gl.startedAt ? new Date(gl.startedAt).toISOString() : undefined,
  endedAt: gl.endedAt ? new Date(gl.endedAt).toISOString() : undefined,
  durationSeconds: gl.durationSeconds,
});
const firstUnfinished = (logs: GameLogState[]): number => {
  const i = logs.findIndex(l => l.status !== 'completed');
  return i === -1 ? Math.max(0, logs.length - 1) : i;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  headerMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  content: { padding: 16, flex: 1 },
  gameCard: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  gameCardActive: { borderLeftColor: COLORS.primary, backgroundColor: '#FFF9E6' },
  gameCardOverrun: { borderLeftColor: COLORS.warning, backgroundColor: '#FFF3E0' },
  gameCardInactive: { borderLeftColor: COLORS.border, opacity: 0.5 },
  phaseHeading: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 12, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  gameName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  gameTime: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  timerText: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginTop: 8, textAlign: 'center' },
  timerTextOverrun: { color: COLORS.warning },
  remaining: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 },
  remainingOverrun: { color: COLORS.warning, fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  button: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  buttonStart: { backgroundColor: COLORS.success },
  buttonStop: { backgroundColor: COLORS.warning },
  buttonSwap: { backgroundColor: COLORS.info },
  swapList: { marginTop: 8, backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  swapItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  swapItemText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  swapItemMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 12 },
  footer: { backgroundColor: COLORS.surface, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerButtons: { flexDirection: 'row', gap: 8 },
  completeButton: { flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  completeButtonText: { color: COLORS.surface, fontWeight: 'bold' },
  cancelButton: { flex: 1, backgroundColor: COLORS.danger, padding: 12, borderRadius: 8, alignItems: 'center' },
  attCard: { backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 12 },
  attHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  attMeta: { fontSize: 12, color: COLORS.textMuted },
  attChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  attChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: COLORS.success, backgroundColor: COLORS.success },
  attChipAbsent: { borderColor: COLORS.border, backgroundColor: 'transparent' },
  attChipText: { fontSize: 13, color: COLORS.surface, fontWeight: '600' },
  attChipTextAbsent: { color: COLORS.textMuted, fontWeight: '400', textDecorationLine: 'line-through' },
});

export default function RunSessionScreen({ route, navigation }: SessionsStackScreenProps<'RunSession'>) {
  const { state, dispatch } = useData();
  const { t } = useT();
  // Lookup map built once per games change — avoids O(n·m) state.games.find in render loops/ticks.
  const gamesById = useMemo(() => new Map(state.games.map(g => [g.id, g])), [state.games]);
  const planId = route.params.planId;
  const plan = state.sessionPlans.find(p => p.id === planId);
  const group = plan ? state.groups.find(g => g.id === plan.groupId) : null;

  // Resume an in-progress run for this plan if one was persisted.
  const runningLog = plan
    ? state.sessionLogs.find(l => l.planId === plan.id && l.status === 'running')
    : undefined;

  const [gameLogs, setGameLogs] = useState<GameLogState[]>(() =>
    runningLog
      ? runningLog.gameLogs.map(fromPersisted)
      : plan?.plannedGames.map(gid => ({ gameId: gid, status: 'pending' as const })) || []
  );
  const [currentGameIndex, setCurrentGameIndex] = useState(() =>
    runningLog ? firstUnfinished(runningLog.gameLogs.map(fromPersisted)) : 0
  );
  // Ref (not state) is the source of truth for the running log id: persistRunning may be
  // called several times in the same tick (e.g. rapid attendance check-ins) before a state
  // update commits — a ref keeps them all writing to ONE log instead of creating duplicates.
  const runningLogIdRef = useRef<string | null>(runningLog?.id ?? null);
  const sessionStartedAtRef = useRef<string>(runningLog?.startedAt ?? new Date().toISOString());

  // Attendance: roster snapshot (all present by default), preserving marks when resuming.
  const roster = athletesInGroup(state.persons, group ?? undefined);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>(() =>
    defaultAttendance(roster.map(a => a.id), runningLog?.attendance)
  );
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  const [timerDisplay, setTimerDisplay] = useState('0:00');
  const [remainingDisplay, setRemainingDisplay] = useState('');
  const [isOverrun, setIsOverrun] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [sessionElapsedSec, setSessionElapsedSec] = useState(0);

  const totalPlannedMin = gameLogs.reduce(
    (s, l) => s + (gamesById.get(l.gameId)?.defaultMinutes || 0),
    0
  );

  // Game indices whose planned-time signal has already fired (so it fires once).
  const signaledRef = useRef<Set<number>>(new Set());
  const beep = useAudioPlayer(beepAsset);

  const currentGameLog = gameLogs[currentGameIndex];
  const currentGame = gamesById.get(currentGameLog?.gameId ?? '');
  const phaseOf = (gid: string): SessionPhase =>
    plan?.gamePhases?.[gid] ?? primaryPhase(gamesById.get(gid));

  /**
   * Strong, repeated signal that the planned duration was reached — meant to cut
   * through a noisy dojo. Loud 3-pulse beep + a Warning buzz + 3 heavy taps.
   */
  const fireSignal = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    [180, 420, 660].forEach(ms =>
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}), ms)
    );
    try {
      beep.volume = 1;
      beep.seekTo(0);
      beep.play();
    } catch {
      // audio unavailable (e.g. web) — haptics still fired
    }
  }, [beep]);

  /** Persist the in-progress run so it survives navigation away and app restart. */
  const persistRunning = (logs: GameLogState[], att: AttendanceEntry[] = attendance) => {
    if (!plan) return;
    const existing = runningLogIdRef.current;
    const id = existing ?? generateId();
    if (!existing) runningLogIdRef.current = id; // claim the id synchronously (no duplicates)
    const payload = {
      id,
      planId: plan.id,
      groupId: plan.groupId,
      startedAt: sessionStartedAtRef.current,
      gameLogs: logs.map(toPersisted),
      attendance: att,
      status: 'running' as const,
    };
    dispatch({ type: existing ? 'UPDATE_SESSION_LOG' : 'ADD_SESSION_LOG', payload });
  };

  // Toggle one athlete present/absent and persist immediately. This creates the running
  // SessionLog if none exists yet, so check-ins are saved even before the first game is
  // started (Cancel/Abbrechen can still discard the whole run back to Planned).
  const togglePresent = (athleteId: string) => {
    const next = toggleAttendance(attendance, athleteId);
    setAttendance(next);
    persistRunning(gameLogs, next);
  };

  // Timer: counts up; at planned duration fires the signal once and flips to overrun.
  // Depends only on primitives (+ memoised completedSec) so per-tick state updates don't
  // churn the interval — it re-arms only on a real transition (start/stop/swap/complete).
  const status = currentGameLog?.status;
  const startedAt = currentGameLog?.startedAt;
  const plannedMinutes = currentGame?.defaultMinutes ?? 0;
  const completedSec = useMemo(() => gameLogs.reduce((s, l) => s + (l.durationSeconds || 0), 0), [gameLogs]);
  useEffect(() => {
    if (status !== 'running' || !startedAt) {
      setTimerDisplay('0:00');
      setRemainingDisplay('');
      setIsOverrun(false);
      setSessionElapsedSec(completedSec);
      return;
    }
    const plannedSec = plannedMinutes * 60;
    const idx = currentGameIndex;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setTimerDisplay(fmt(elapsed));
      setSessionElapsedSec(completedSec + elapsed);
      if (plannedSec > 0) {
        const remaining = plannedSec - elapsed;
        const over = remaining <= 0;
        setIsOverrun(over);
        setRemainingDisplay(
          over
            ? `▲ ${t('planned time reached')} · +${fmt(-remaining)} ${t('over')}`
            : `${plannedMinutes} ${t('min planned')} · ${fmt(remaining)} ${t('left')}`
        );
        if (over && !signaledRef.current.has(idx)) {
          signaledRef.current.add(idx);
          fireSignal();
        }
      } else {
        setRemainingDisplay('');
        setIsOverrun(false);
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [status, startedAt, currentGameIndex, plannedMinutes, fireSignal, completedSec, t]);

  const handleStartGame = () => {
    signaledRef.current.delete(currentGameIndex); // allow the signal to fire for this run
    const newLogs = [...gameLogs];
    newLogs[currentGameIndex] = {
      ...newLogs[currentGameIndex],
      status: 'running',
      startedAt: Date.now(),
      endedAt: undefined,
    };
    setGameLogs(newLogs);
    persistRunning(newLogs);
  };

  /** Reconfigure mid-session: replace the current (not-yet-started) Übung with another. */
  const swapCurrent = (gid: string) => {
    const newLogs = [...gameLogs];
    newLogs[currentGameIndex] = { gameId: gid, status: 'pending' };
    setGameLogs(newLogs);
    signaledRef.current.delete(currentGameIndex);
    persistRunning(newLogs);
    setSwapOpen(false);
  };

  const handleStopGame = () => {
    const now = Date.now(); // capture the real stop time, not session-complete time
    const newLogs = [...gameLogs];
    const log = newLogs[currentGameIndex];
    if (log.startedAt) {
      newLogs[currentGameIndex] = {
        ...log,
        status: 'completed',
        endedAt: now,
        durationSeconds: Math.round((now - log.startedAt) / 1000),
      };
      setGameLogs(newLogs);
      persistRunning(newLogs);
      setIsOverrun(false);
      if (currentGameIndex < gameLogs.length - 1) {
        setCurrentGameIndex(currentGameIndex + 1);
      }
    }
  };

  const handleComplete = () => {
    if (!plan || !group) return;

    // Finalize a still-running current drill so its time isn't lost on complete.
    const now = Date.now();
    const finalizedLogs = gameLogs.map(l =>
      l.status === 'running' && l.startedAt
        ? { ...l, status: 'completed' as const, endedAt: now, durationSeconds: Math.round((now - l.startedAt) / 1000) }
        : l
    );

    const existing = runningLogIdRef.current;
    const id = existing ?? generateId();
    const payload = {
      id,
      planId: plan.id,
      groupId: plan.groupId,
      startedAt: sessionStartedAtRef.current,
      endedAt: new Date().toISOString(),
      gameLogs: finalizedLogs.map(toPersisted),
      attendance,
      status: 'completed' as const,
    };
    // Finalize this run (or create one if nothing was started)...
    dispatch({ type: existing ? 'UPDATE_SESSION_LOG' : 'ADD_SESSION_LOG', payload });
    // ...and clear any other running logs for this plan (dedupe stray starts).
    state.sessionLogs
      .filter(l => l.planId === plan.id && l.status === 'running' && l.id !== id)
      .forEach(l => dispatch({ type: 'DELETE_SESSION_LOG', payload: { id: l.id } }));

    const summaryText = generateSessionSummaryText(
      group.name,
      plan.plannedDate,
      finalizedLogs.map(gl => ({
        name: gamesById.get(gl.gameId)?.name || gl.gameId,
        plannedMinutes: gamesById.get(gl.gameId)?.defaultMinutes || 0,
        actualSeconds: gl.durationSeconds,
      }))
    );

    // Best-effort share — must NOT block closing the screen (the share sheet can hang).
    Share.share({ message: summaryText, title: 'TKD Coach - Session Summary' }).catch(() => {});
    navigation.goBack();
  };

  const handleCancel = () => {
    Alert.alert(t('Cancel session'), t('Discards this run and puts the session back to Planned.'), [
      { text: t('Keep going'), onPress: () => {} },
      {
        text: t('Discard'),
        style: 'destructive',
        onPress: () => {
          // Delete EVERY running log for this plan (handles stray duplicates) so an
          // accidentally-started session reliably returns to the Planned list.
          const ids = new Set(
            plan ? state.sessionLogs.filter(l => l.planId === plan.id && l.status === 'running').map(l => l.id) : []
          );
          if (runningLogIdRef.current) ids.add(runningLogIdRef.current);
          ids.forEach(id => dispatch({ type: 'DELETE_SESSION_LOG', payload: { id } }));
          runningLogIdRef.current = null;
          navigation.goBack();
        },
      },
    ]);
  };

  if (!plan || !group || !currentGame) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 16, color: COLORS.text }}>{t('Session not found')}</Text>
      </View>
    );
  }

  let lastPhase: SessionPhase | null = null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Running')}: {plan.name}</Text>
        <Text style={styles.headerMeta}>
          {group.name} · {t('Exercise')} {currentGameIndex + 1}/{gameLogs.length} · {Math.round(sessionElapsedSec / 60)}/{totalPlannedMin} min
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Attendance — tap a name to toggle present/absent */}
        {roster.length > 0 && (
          <View style={styles.attCard}>
            <TouchableOpacity style={styles.attHeader} onPress={() => setAttendanceOpen(o => !o)} activeOpacity={0.7}>
              <Text style={styles.attTitle}>👥 {t('Attendance')}</Text>
              <Text style={styles.attMeta}>{presentCount(attendance)}/{roster.length} {t('present')} {attendanceOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {attendanceOpen && (
              <View style={styles.attChipRow}>
                {roster.map(a => {
                  const present = attendance.find(e => e.athleteId === a.id)?.present ?? false;
                  return (
                    <TouchableOpacity key={a.id} style={[styles.attChip, !present && styles.attChipAbsent]} onPress={() => togglePresent(a.id)}>
                      <Text style={[styles.attChipText, !present && styles.attChipTextAbsent]}>{present ? '✓ ' : ''}{a.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {gameLogs.map((log, idx) => {
          const active = idx === currentGameIndex;
          const overrunHere = active && isOverrun;
          const p = phaseOf(log.gameId);
          const heading = p !== lastPhase ? t(SESSION_PHASE_LABELS[p]) : null;
          lastPhase = p;
          return (
            <React.Fragment key={idx}>
              {heading && <Text style={styles.phaseHeading}>{heading}</Text>}
              <View
                style={[
                  styles.gameCard,
                  overrunHere
                    ? styles.gameCardOverrun
                    : active
                    ? styles.gameCardActive
                    : styles.gameCardInactive,
                ]}
              >
              <Text style={styles.gameName}>
                {active ? '▶ ' : ''}{gamesById.get(log.gameId)?.name}
              </Text>
              <Text style={styles.gameTime}>
                {log.status === 'completed'
                  ? `✓ ${fmt(log.durationSeconds || 0)} (${gamesById.get(log.gameId)?.defaultMinutes}min ${t('planned')})`
                  : `${gamesById.get(log.gameId)?.defaultMinutes}min (${t('planned')})`}
              </Text>

              {active && (
                <>
                  <Text style={[styles.timerText, isOverrun && styles.timerTextOverrun]}>{timerDisplay}</Text>
                  {!!remainingDisplay && (
                    <Text style={[styles.remaining, isOverrun && styles.remainingOverrun]}>{remainingDisplay}</Text>
                  )}
                  <View style={styles.buttons}>
                    {log.status === 'pending' && (
                      <>
                        <TouchableOpacity style={[styles.button, styles.buttonStart]} onPress={handleStartGame}>
                          <Text style={styles.buttonText}>{t('START')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonSwap]} onPress={() => setSwapOpen(o => !o)}>
                          <Text style={styles.buttonText}>{swapOpen ? t('CLOSE') : t('⇄ SWAP')}</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {log.status === 'running' && (
                      <TouchableOpacity style={[styles.button, styles.buttonStop]} onPress={handleStopGame}>
                        <Text style={styles.buttonText}>{t('STOP')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {log.status === 'pending' && swapOpen && (
                    <View style={styles.swapList}>
                      {([1, 2, 3, 4, 5] as SessionPhase[]).map(ph => {
                        const opts = state.games.filter(g => gameInPhase(g, ph) && g.id !== log.gameId);
                        if (opts.length === 0) return null;
                        return (
                          <View key={ph}>
                            <Text style={[styles.phaseHeading, { paddingHorizontal: 10 }]}>{t(SESSION_PHASE_LABELS[ph])}</Text>
                            {opts.map(g => (
                              <TouchableOpacity key={g.id} style={styles.swapItem} onPress={() => swapCurrent(g.id)}>
                                <Text style={styles.swapItemText}>{g.name}</Text>
                                <Text style={styles.swapItemMeta}>
                                  {g.defaultMinutes}min
                                  {g.bodyParts && g.bodyParts.length ? ` · ${g.bodyParts.map(bp => bodyPartName(state.bodyParts, bp)).join(', ')}` : ''}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </>
              )}
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>{t('Session complete')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.completeButtonText}>{t('Cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
