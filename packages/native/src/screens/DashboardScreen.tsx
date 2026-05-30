import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';
import { COLORS } from '../constants/colors';
import { formatDateShort } from '../utils/format';
import type { ScreenNavigationProp } from '../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  section: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 20, color: COLORS.text },
  sessionCard: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  sessionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  sessionMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  gameList: { fontSize: 12, color: COLORS.textLight, marginTop: 8 },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 14 },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 24 },
});

export default function DashboardScreen({ navigation }: { navigation: ScreenNavigationProp }) {
  const { state } = useData();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().split('T')[0];

  const todaysPlans = state.sessionPlans.filter(p => p.plannedDate === todayISO);
  // Copy before sort: Array.prototype.sort mutates in place — sorting state.sessionLogs
  // directly would corrupt the reducer's source of truth and silently break reference equality.
  const recentLogs = [...state.sessionLogs]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 5);

  const getGroupName = (groupId: string) => state.groups.find(g => g.id === groupId)?.name || 'Unknown';
  const getGameNames = (gameIds: string[]) =>
    gameIds
      .map(id => state.games.find(g => g.id === id)?.shortName || id)
      .join(' · ');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Today's Sessions */}
        <Text style={styles.section}>🗓 Today's Sessions</Text>
        {todaysPlans.length > 0 ? (
          <>
            {todaysPlans.map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={styles.sessionCard}
                onPress={() => navigation.navigate('SessionsTab', { screen: 'SessionsList', params: { planId: plan.id } })}
              >
                <Text style={styles.sessionTitle}>{plan.name}</Text>
                <Text style={styles.sessionMeta}>{getGroupName(plan.groupId)}</Text>
                <Text style={styles.gameList}>{getGameNames(plan.plannedGames)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SessionsTab')}>
              <Text style={styles.buttonText}>Start Session</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.empty}>No sessions planned for today</Text>
        )}

        {/* Recent Sessions */}
        <Text style={styles.section}>📊 Recent Sessions</Text>
        {recentLogs.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={recentLogs}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.sessionCard}>
                <Text style={styles.sessionTitle}>{getGroupName(item.groupId)}</Text>
                <Text style={styles.sessionMeta}>{formatDateShort(item.startedAt)}</Text>
                <Text style={styles.gameList}>{item.gameLogs.length} games</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.empty}>No sessions recorded yet</Text>
        )}

        {/* Quick Stats */}
        <Text style={styles.section}>📈 Quick Stats</Text>
        <View style={styles.sessionCard}>
          <Text style={styles.sessionMeta}>Total Groups: {state.groups.length}</Text>
          <Text style={styles.sessionMeta}>Total Athletes: {state.athletes.length}</Text>
          <Text style={styles.sessionMeta}>Sessions Completed: {state.sessionLogs.filter(l => l.status === 'completed').length}</Text>
          <Text style={styles.sessionMeta}>Assessments Logged: {state.assessments.length}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
