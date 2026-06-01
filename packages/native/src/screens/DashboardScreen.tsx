import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';
import { COLORS } from '../constants/colors';
import { formatDateShort, toLocalDateISO } from '../utils/format';
import { slotsOnDay, formatSlot, plannedMinutes, actualSeconds, recentCompletedLogs, planStatus, todaysPlans } from '../domain';
import { APP_INFO } from '../constants/appInfo';
import { useT } from '../i18n';
import type { RootTabScreenProps } from '../types/navigation';

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

export default function DashboardScreen({ navigation }: RootTabScreenProps<'Dashboard'>) {
  const { state } = useData();
  const { t } = useT();

  const todayISO = toLocalDateISO();

  // Today's still-open sessions (to-start or in-progress). Status is derived in the domain
  // layer (planStatus); done-today sessions are "recent" and appear below, not here.
  const todaysOpen = todaysPlans(state.sessionPlans, todayISO).filter(p => planStatus(p.id, state.sessionLogs) !== 'done');
  const recentLogs = recentCompletedLogs(state.sessionLogs, 5);

  const now = new Date();
  const trainingToday = state.groups
    .map(g => ({ group: g, slots: slotsOnDay(g, now) }))
    .filter(x => x.slots.length > 0);

  const getGroupName = (groupId: string) => state.groups.find(g => g.id === groupId)?.name || t('Unknown group');
  const getGameNames = (gameIds: string[]) =>
    gameIds
      .map(id => state.games.find(g => g.id === id)?.shortName || id)
      .join(' · ');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Today's Sessions — tap a card to start / resume it */}
        <Text style={styles.section}>🗓 {t('Today\'s Sessions')}</Text>
        {todaysOpen.length > 0 ? (
          todaysOpen.map(plan => {
            const running = planStatus(plan.id, state.sessionLogs) === 'running';
            const status = running ? `▶ ${t('Resume')}` : `○ ${t('Start')}`;
            const totalMin = plannedMinutes(plan.plannedGames, state.games);
            return (
              <TouchableOpacity
                key={plan.id}
                style={styles.sessionCard}
                onPress={() => navigation.navigate('Sessions', { screen: 'RunSession', params: { planId: plan.id } })}
              >
                <Text style={styles.sessionTitle}>{status} · {plan.name}</Text>
                <Text style={styles.sessionMeta}>{getGroupName(plan.groupId)} · {totalMin} min</Text>
                <Text style={styles.gameList}>{getGameNames(plan.plannedGames)}</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.empty}>{t('No open sessions for today')}</Text>
        )}

        {/* Recent Sessions */}
        <Text style={styles.section}>📊 {t('Recent Sessions')}</Text>
        {recentLogs.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={recentLogs}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const planName = state.sessionPlans.find(p => p.id === item.planId)?.name;
              const played = item.gameLogs.filter(g => g.durationSeconds != null);
              const totalSec = actualSeconds(item);
              return (
                <TouchableOpacity
                  style={styles.sessionCard}
                  onPress={() => navigation.navigate('Sessions', { screen: 'SessionDetail', params: { logId: item.id } })}
                >
                  <Text style={styles.sessionTitle}>{[planName, getGroupName(item.groupId)].filter(Boolean).join(' · ')}</Text>
                  <Text style={styles.sessionMeta}>{formatDateShort(item.startedAt)} · {played.length} {t('Exercises')} · {Math.round(totalSec / 60)} min</Text>
                  <Text style={styles.gameList}>{getGameNames(played.map(g => g.gameId))}</Text>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <Text style={styles.empty}>{t('No sessions recorded yet')}</Text>
        )}

        {/* Trains today */}
        {trainingToday.length > 0 && (
          <>
            <Text style={styles.section}>🕒 {t('Training today')}</Text>
            {trainingToday.map(({ group, slots }) => (
              <View key={group.id} style={[styles.sessionCard, { borderLeftColor: COLORS.info }]}>
                <Text style={styles.sessionTitle}>{group.name}</Text>
                <Text style={styles.sessionMeta}>{slots.map(formatSlot).join('  ·  ')}</Text>
              </View>
            ))}
          </>
        )}

        {/* Quick Stats */}
        <Text style={styles.section}>📈 {t('Quick Stats')}</Text>
        <View style={styles.sessionCard}>
          <Text style={styles.sessionMeta}>{t('Groups')}: {state.groups.length}</Text>
          <Text style={styles.sessionMeta}>{t('Athletes')}: {state.persons.filter(p => p.athlete).length}</Text>
          <Text style={styles.sessionMeta}>{t('Sessions completed')}: {state.sessionLogs.filter(l => l.status === 'completed').length}</Text>
          <Text style={styles.sessionMeta}>{t('Assessments logged')}: {state.assessments.length}</Text>
        </View>

        {/* About */}
        <Text style={styles.section}>ℹ️ {t('About')}</Text>
        <View style={styles.sessionCard}>
          <Text style={styles.sessionTitle}>{APP_INFO.name} v{APP_INFO.version}</Text>
          <Text style={styles.sessionMeta}>{APP_INFO.tagline}</Text>
          <Text style={styles.sessionMeta}>{t('by')} {APP_INFO.author}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
