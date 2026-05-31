import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { formatDateShort } from '../../utils/format';
import type { SessionsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: COLORS.text },
  card: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cardMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  button: { flex: 1, padding: 8, borderRadius: 6, alignItems: 'center' },
  buttonStart: { backgroundColor: COLORS.primary },
  buttonEdit: { backgroundColor: COLORS.info },
  buttonText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 12 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 24 },
});

export default function SessionsScreen({ navigation }: SessionsStackScreenProps<'SessionsList'>) {
  const { state } = useData();

  // Copy before sort: sort() mutates; sorting state arrays directly corrupts reducer state.
  const upcomingPlans = [...state.sessionPlans].sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());
  const completedLogs = state.sessionLogs
    .filter(l => l.status === 'completed')
    .sort((a, b) => new Date(b.endedAt || b.startedAt).getTime() - new Date(a.endedAt || a.startedAt).getTime())
    .slice(0, 10);

  const getGroupName = (groupId: string) => state.groups.find(g => g.id === groupId)?.name || 'Unknown';
  const getGameCount = (gameIds: string[]) => gameIds.length;
  const getTotalMinutes = (gameIds: string[]) =>
    gameIds.reduce((sum, gid) => {
      const game = state.games.find(g => g.id === gid);
      return sum + (game?.defaultMinutes || 0);
    }, 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Upcoming Plans */}
        <Text style={styles.section}>📋 Session Plans</Text>
        {upcomingPlans.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={upcomingPlans}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardMeta}>
                  {getGroupName(item.groupId)} · {formatDateShort(item.plannedDate)}
                </Text>
                <Text style={styles.cardMeta}>
                  {getGameCount(item.plannedGames)} games · {getTotalMinutes(item.plannedGames)} min
                </Text>
                <View style={styles.buttons}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonStart]}
                    onPress={() => navigation.navigate('RunSession', { planId: item.id })}
                  >
                    <Text style={styles.buttonText}>Start</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonEdit]}
                    onPress={() => navigation.navigate('PlanSession', { planId: item.id })}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={styles.empty}>No session plans yet. Tap + to create one.</Text>
        )}

        {/* Recent Sessions */}
        <Text style={styles.section}>✓ Completed Sessions</Text>
        {completedLogs.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={completedLogs}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{getGroupName(item.groupId)}</Text>
                <Text style={styles.cardMeta}>{formatDateShort(item.startedAt)}</Text>
                <Text style={styles.cardMeta}>
                  {item.gameLogs.length} games ·{' '}
                  {item.gameLogs.reduce((sum, g) => sum + (g.durationSeconds || 0), 0)} sec
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.buttonEdit, { marginTop: 8 }]}
                  onPress={() =>
                    navigation.navigate('PlanSession', {
                      fromGroupId: item.groupId,
                      fromGameIds: item.gameLogs.map(g => g.gameId),
                    })
                  }
                >
                  <Text style={styles.buttonText}>Use as template → plan again</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <Text style={styles.empty}>No completed sessions yet</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PlanSession')}>
        <Text style={{ fontSize: 32, color: COLORS.surface }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
