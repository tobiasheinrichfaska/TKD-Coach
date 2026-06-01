import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { formatDateShort, formatTime, formatDuration } from '../../utils/format';
import { primaryPhase, phaseBand } from '../../domain';
import { SESSION_PHASE_LABELS, SessionPhase } from '../../types';
import { useT } from '../../i18n';
import type { SessionsStackScreenProps } from '../../types/navigation';

const PHASES: SessionPhase[] = [1, 2, 3, 4, 5];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  badge: { fontSize: 11, fontWeight: '700', color: COLORS.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  phaseHeading: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 16, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 6, borderLeftWidth: 3 },
  rowInfo: { flex: 1 },
  gameTitle: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  gameMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  dur: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  durSkipped: { fontSize: 12, color: COLORS.textLight, fontStyle: 'italic' },
  totals: { backgroundColor: COLORS.surface, borderRadius: 8, padding: 12, marginTop: 16 },
  totalsText: { fontSize: 14, color: COLORS.text },
  notes: { fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface, borderRadius: 8, padding: 12, marginTop: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginTop: 16, marginBottom: 4 },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 20 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 13 },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 40 },
});

export default function SessionDetailScreen({ route, navigation }: SessionsStackScreenProps<'SessionDetail'>) {
  const { state, dispatch } = useData();
  const { t } = useT();
  const log = state.sessionLogs.find(l => l.id === route.params.logId);

  if (!log) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>{t('This session no longer exists.')}</Text>
      </View>
    );
  }

  const plan = state.sessionPlans.find(p => p.id === log.planId);
  const groupName = state.groups.find(g => g.id === log.groupId)?.name || t('Unknown group');
  const planName = plan?.name;
  const game = (id: string) => state.games.find(g => g.id === id);
  const phaseOf = (gid: string): SessionPhase => plan?.gamePhases?.[gid] ?? primaryPhase(game(gid));

  const played = log.gameLogs.filter(g => g.durationSeconds != null);
  const totalSec = log.gameLogs.reduce((s, g) => s + (g.durationSeconds || 0), 0);

  const statusColor =
    log.status === 'completed' ? COLORS.success : log.status === 'running' ? COLORS.primary : COLORS.textMuted;
  const statusLabel =
    log.status === 'completed' ? t('Completed') : log.status === 'running' ? t('Running') : t('Cancelled');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{planName || groupName}</Text>
        <Text style={styles.meta}>
          {[planName && groupName, formatDateShort(log.startedAt)].filter(Boolean).join(' · ')}
        </Text>
        <Text style={styles.meta}>
          {formatTime(log.startedAt)}
          {log.endedAt ? ` – ${formatTime(log.endedAt)}` : ''}
        </Text>
        <View style={styles.statusRow}>
          <Text style={[styles.badge, { backgroundColor: statusColor }]}>{statusLabel}</Text>
          {log.archived && <Text style={[styles.badge, { backgroundColor: COLORS.textMuted }]}>{t('Archive')}</Text>}
        </View>

        {/* Per-phase breakdown of what was trained */}
        {PHASES.map(phase => {
          const inPhase = log.gameLogs.filter(gl => phaseOf(gl.gameId) === phase);
          if (inPhase.length === 0) return null;
          const band = phaseBand(phase);
          const border = band === 'warmup' ? COLORS.warmup : band === 'cooldown' ? COLORS.cooldown : COLORS.main;
          return (
            <View key={phase}>
              <Text style={styles.phaseHeading}>{SESSION_PHASE_LABELS[phase]}</Text>
              {inPhase.map((gl, i) => {
                const g = game(gl.gameId);
                return (
                  <View key={`${gl.gameId}-${i}`} style={[styles.row, { borderLeftColor: border }]}>
                    <View style={styles.rowInfo}>
                      <Text style={styles.gameTitle}>{g?.name || gl.gameId}</Text>
                      <Text style={styles.gameMeta}>
                        {g?.defaultMinutes != null ? `${g.defaultMinutes} min ${t('planned')}` : ''}
                      </Text>
                    </View>
                    {gl.durationSeconds != null ? (
                      <Text style={styles.dur}>{formatDuration(gl.durationSeconds)}</Text>
                    ) : (
                      <Text style={styles.durSkipped}>{t('not played')}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={styles.totals}>
          <Text style={styles.totalsText}>
            {played.length} {t('of')} {log.gameLogs.length} {t('Übungen')} · {formatDuration(totalSec)} {t('total')}
          </Text>
        </View>

        {!!log.notes && (
          <>
            <Text style={styles.sectionLabel}>{t('Notes')}</Text>
            <Text style={styles.notes}>{log.notes}</Text>
          </>
        )}

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.info }]}
            onPress={() =>
              navigation.navigate('PlanSession', { fromGroupId: log.groupId, fromGameIds: log.gameLogs.map(g => g.gameId) })
            }
          >
            <Text style={styles.buttonText}>{t('Plan again')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.textMuted }]}
            onPress={() => {
              dispatch({ type: 'UPDATE_SESSION_LOG', payload: { ...log, archived: !log.archived } });
              navigation.goBack();
            }}
          >
            <Text style={styles.buttonText}>{log.archived ? t('Unarchive') : t('Archive')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
