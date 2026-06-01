import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { formatDateShort, toLocalDateISO } from '../../utils/format';
import { useT } from '../../i18n';
import type { SessionsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: COLORS.text },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { fontSize: 13, color: COLORS.info, fontWeight: '600' },
  card: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  cardToday: { borderLeftWidth: 4, borderLeftColor: COLORS.primary, backgroundColor: '#FFF3F3' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  todayBadge: { fontSize: 10, fontWeight: '700', color: COLORS.surface, backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
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
  const { state, dispatch } = useData();
  const { t } = useT();

  // A plan with a completed session is history (shown under Completed below), not an
  // active plan. Plans with only a running log stay active so they can be resumed.
  const completedPlanIds = new Set(
    state.sessionLogs.filter(l => l.status === 'completed').map(l => l.planId)
  );
  // Copy before sort: sort() mutates; sorting state arrays directly corrupts reducer state.
  const upcomingPlans = [...state.sessionPlans]
    .filter(p => !completedPlanIds.has(p.id))
    .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());
  const completedLogs = state.sessionLogs
    .filter(l => l.status === 'completed' && !l.archived)
    .sort((a, b) => new Date(b.endedAt || b.startedAt).getTime() - new Date(a.endedAt || a.startedAt).getTime())
    .slice(0, 10);
  const archivedCount = state.sessionLogs.filter(l => l.archived).length;

  const todayISO = toLocalDateISO();
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
        {/* Planned sessions */}
        <Text style={styles.section}>📋 {t('Planned sessions')}</Text>
        {upcomingPlans.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={upcomingPlans}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isToday = item.plannedDate === todayISO;
              return (
              <View style={[styles.card, isToday && styles.cardToday]}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {isToday && <Text style={styles.todayBadge}>HEUTE</Text>}
                </View>
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
                    <Text style={styles.buttonText}>{t('Start')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonEdit]}
                    onPress={() => navigation.navigate('PlanSession', { planId: item.id })}
                  >
                    <Text style={styles.buttonText}>{t('Edit')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              );
            }}
          />
        ) : (
          <Text style={styles.empty}>{t('No planned sessions. Tap + to create one.')}</Text>
        )}

        {/* Recent sessions */}
        <TouchableOpacity style={styles.sectionRow} onPress={() => navigation.navigate('RecentSessions')}>
          <Text style={styles.section}>🕒 {t('Recent sessions')}</Text>
          <Text style={styles.seeAll}>{t('Alle →')}</Text>
        </TouchableOpacity>
        {archivedCount > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('SessionArchive')}>
            <Text style={[styles.cardMeta, { color: COLORS.info, marginBottom: 6 }]}>📦 {t('Archive')} ({archivedCount}) →</Text>
          </TouchableOpacity>
        )}
        {completedLogs.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={completedLogs}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isToday = toLocalDateISO(new Date(item.endedAt || item.startedAt)) === todayISO;
              return (
              <View style={[styles.card, isToday && styles.cardToday]}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>
                    {[state.sessionPlans.find(p => p.id === item.planId)?.name, getGroupName(item.groupId)]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                  {isToday && <Text style={styles.todayBadge}>HEUTE</Text>}
                </View>
                <Text style={styles.cardMeta}>{formatDateShort(item.startedAt)}</Text>
                <Text style={styles.cardMeta}>
                  {item.gameLogs.length} games ·{' '}
                  {item.gameLogs.reduce((sum, g) => sum + (g.durationSeconds || 0), 0)} sec
                </Text>
                <View style={styles.buttons}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonEdit]}
                    onPress={() =>
                      navigation.navigate('PlanSession', {
                        fromGroupId: item.groupId,
                        fromGameIds: item.gameLogs.map(g => g.gameId),
                      })
                    }
                  >
                    <Text style={styles.buttonText}>{t('Plan again')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: COLORS.textMuted }]}
                    onPress={() => dispatch({ type: 'UPDATE_SESSION_LOG', payload: { ...item, archived: true } })}
                  >
                    <Text style={styles.buttonText}>{t('Archive')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              );
            }}
          />
        ) : (
          <Text style={styles.empty}>{t('No recent sessions yet')}</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PlanSession')}>
        <Text style={{ fontSize: 32, color: COLORS.surface }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
