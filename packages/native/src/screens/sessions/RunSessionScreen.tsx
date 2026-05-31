import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { generateId } from '../../utils/ids';
import { generateSessionSummaryText } from '../../utils/format';
import type { SessionsStackScreenProps } from '../../types/navigation';

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
  gameCardInactive: { borderLeftColor: COLORS.border, opacity: 0.5 },
  gameName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  gameTime: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  timerText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginTop: 8, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  button: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  buttonStart: { backgroundColor: COLORS.success },
  buttonStop: { backgroundColor: COLORS.warning },
  buttonText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 12 },
  footer: { backgroundColor: COLORS.surface, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerButtons: { flexDirection: 'row', gap: 8 },
  completeButton: { flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  completeButtonText: { color: COLORS.surface, fontWeight: 'bold' },
  cancelButton: { flex: 1, backgroundColor: COLORS.danger, padding: 12, borderRadius: 8, alignItems: 'center' },
});

interface GameLogState {
  gameId: string;
  startedAt?: number;
  durationSeconds?: number;
  status: 'pending' | 'running' | 'completed';
}

export default function RunSessionScreen({ route, navigation }: SessionsStackScreenProps<'RunSession'>) {
  const { state, dispatch } = useData();
  const planId = route.params.planId;
  const plan = state.sessionPlans.find(p => p.id === planId);
  const group = plan ? state.groups.find(g => g.id === plan.groupId) : null;

  const [gameLogs, setGameLogs] = useState<GameLogState[]>(
    plan?.plannedGames.map(gid => ({ gameId: gid, status: 'pending' })) || []
  );
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [timerDisplay, setTimerDisplay] = useState('0:00');

  const currentGameLog = gameLogs[currentGameIndex];
  const currentGame = state.games.find(g => g.id === currentGameLog?.gameId);

  // Timer effect
  useEffect(() => {
    if (currentGameLog?.status !== 'running' || !currentGameLog.startedAt) {
      setTimerDisplay('0:00');
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - currentGameLog.startedAt!) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      setTimerDisplay(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 100);

    return () => clearInterval(interval);
  }, [currentGameLog]);

  const handleStartGame = () => {
    const newLogs = [...gameLogs];
    newLogs[currentGameIndex] = {
      ...newLogs[currentGameIndex],
      status: 'running',
      startedAt: Date.now(),
    };
    setGameLogs(newLogs);
  };

  const handleStopGame = () => {
    const newLogs = [...gameLogs];
    const log = newLogs[currentGameIndex];
    if (log.startedAt) {
      newLogs[currentGameIndex] = {
        ...log,
        status: 'completed',
        durationSeconds: Math.round((Date.now() - log.startedAt) / 1000),
      };
      setGameLogs(newLogs);

      // Auto-advance to next game
      if (currentGameIndex < gameLogs.length - 1) {
        setCurrentGameIndex(currentGameIndex + 1);
      }
    }
  };

  const handleComplete = async () => {
    if (!plan || !group) return;

    const convertedGameLogs = gameLogs.map(gl => ({
      gameId: gl.gameId,
      startedAt: gl.startedAt ? new Date(gl.startedAt).toISOString() : new Date().toISOString(),
      endedAt: gl.durationSeconds ? new Date(Date.now()).toISOString() : undefined,
      durationSeconds: gl.durationSeconds || 0,
    }));

    // Create session log
    dispatch({
      type: 'ADD_SESSION_LOG',
      payload: {
        id: generateId(),
        planId: plan.id,
        groupId: plan.groupId,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        gameLogs: convertedGameLogs,
        status: 'completed',
      },
    });

    // Share summary via Signal
    const summaryText = generateSessionSummaryText(
      group.name,
      plan.plannedDate,
      gameLogs.map(gl => ({
        name: state.games.find(g => g.id === gl.gameId)?.name || gl.gameId,
        plannedMinutes: state.games.find(g => g.id === gl.gameId)?.defaultMinutes || 0,
        actualSeconds: gl.durationSeconds,
      }))
    );

    try {
      await Share.share({
        message: summaryText,
        title: `TKD Coach - Session Summary`,
      });
    } catch (e) {
      console.log('Share cancelled or error:', e);
    }

    navigation.goBack();
  };

  const handleCancel = () => {
    Alert.alert('Cancel Session', 'Are you sure? Progress will not be saved.', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Discard',
        onPress: () => navigation.goBack(),
        style: 'destructive',
      },
    ]);
  };

  if (!plan || !group || !currentGame) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 16, color: COLORS.text }}>Session not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Running: {plan.name}</Text>
        <Text style={styles.headerMeta}>
          {group.name} · Game {currentGameIndex + 1}/{gameLogs.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {gameLogs.map((log, idx) => (
          <View
            key={idx}
            style={[
              styles.gameCard,
              idx === currentGameIndex ? styles.gameCardActive : styles.gameCardInactive,
            ]}
          >
            <Text style={styles.gameName}>
              {idx === currentGameIndex ? '▶ ' : ''} {state.games.find(g => g.id === log.gameId)?.name}
            </Text>
            <Text style={styles.gameTime}>
              {log.status === 'completed'
                ? `✓ ${log.durationSeconds}s`
                : `${state.games.find(g => g.id === log.gameId)?.defaultMinutes}min (planned)`}
            </Text>

            {idx === currentGameIndex && (
              <>
                <Text style={styles.timerText}>{timerDisplay}</Text>
                <View style={styles.buttons}>
                  {log.status === 'pending' && (
                    <TouchableOpacity style={[styles.button, styles.buttonStart]} onPress={handleStartGame}>
                      <Text style={styles.buttonText}>START</Text>
                    </TouchableOpacity>
                  )}
                  {log.status === 'running' && (
                    <TouchableOpacity style={[styles.button, styles.buttonStop]} onPress={handleStopGame}>
                      <Text style={styles.buttonText}>STOP</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>Session Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.completeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
