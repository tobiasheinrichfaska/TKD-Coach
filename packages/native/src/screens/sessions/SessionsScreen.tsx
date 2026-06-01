import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { formatDateShort, toLocalDateISO } from '../../utils/format';
import { partitionPlans, recentCompletedLogs } from '../../domain';
import { useT } from '../../i18n';
import type { SessionPlan } from '../../types';
import type { SessionsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: COLORS.text },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { fontSize: 13, color: COLORS.info, fontWeight: '600' },
  card: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  cardToday: { borderLeftWidth: 4, borderLeftColor: COLORS.primary, backgroundColor: '#FFF3F3' },
  cardRunning: { borderLeftWidth: 4, borderLeftColor: COLORS.success, backgroundColor: '#F1F8F2' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  todayBadge: { fontSize: 10, fontWeight: '700', color: COLORS.surface, backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  runningBadge: { fontSize: 10, fontWeight: '700', color: COLORS.surface, backgroundColor: COLORS.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cardMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  button: { flex: 1, padding: 8, borderRadius: 6, alignItems: 'center' },
  buttonStart: { backgroundColor: COLORS.primary },
  buttonResume: { backgroundColor: COLORS.success },
  buttonEdit: { backgroundColor: COLORS.info },
  buttonText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 12 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 24 },
});

export default function SessionsScreen({ navigation }: SessionsStackScreenProps<'SessionsList'>) {
  const { state, dispatch } = useData();
  const { t } = useT();

  // Status classification lives in the pure domain layer (selectors); the screen only renders.
  const { inProgress, planned } = partitionPlans(state.sessionPlans, state.sessionLogs);
  const completedLogs = recentCompletedLogs(state.sessionLogs);
  const archivedCount = state.sessionLogs.filter(l => l.archived).length;

  const todayISO = toLocalDateISO();
  const getGroupName = (groupId: string) => state.groups.find(g => g.id === groupId)?.name || t('Unknown group');
  const getTotalMinutes = (gameIds: string[]) =>
    gameIds.reduce((sum, gid) => sum + (state.games.find(g => g.id === gid)?.defaultMinutes || 0), 0);

  const discardInProgress = (planId: string) => {
    Alert.alert(t('Discard running session?'), t('Puts the session back to Planned. Nothing is saved.'), [
      { text: t('Keep going'), style: 'cancel' },
      {
        text: t('Discard'),
        style: 'destructive',
        onPress: () =>
          state.sessionLogs
            .filter(l => l.planId === planId && l.status === 'running')
            .forEach(l => dispatch({ type: 'DELETE_SESSION_LOG', payload: { id: l.id } })),
      },
    ]);
  };

  const PlanMeta = ({ item }: { item: SessionPlan }) => (
    <>
      <Text style={styles.cardMeta}>{getGroupName(item.groupId)} · {formatDateShort(item.plannedDate)}</Text>
      <Text style={styles.cardMeta}>{item.plannedGames.length} {t('Exercises')} · {getTotalMinutes(item.plannedGames)} min</Text>
    </>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* In-progress sessions (resume or discard) */}
        {inProgress.length > 0 && (
          <>
            <Text style={styles.section}>▶ {t('In progress')}</Text>
            <FlatList
              scrollEnabled={false}
              data={inProgress}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={[styles.card, styles.cardRunning]}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.runningBadge}>{t('In progress')}</Text>
                  </View>
                  <PlanMeta item={item} />
                  <View style={styles.buttons}>
                    <TouchableOpacity style={[styles.button, styles.buttonResume]} onPress={() => navigation.navigate('RunSession', { planId: item.id })}>
                      <Text style={styles.buttonText}>{t('Resume')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.textMuted }]} onPress={() => discardInProgress(item.id)}>
                      <Text style={styles.buttonText}>{t('Discard')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </>
        )}

        {/* Planned sessions */}
        <Text style={styles.section}>📋 {t('Planned sessions')}</Text>
        {planned.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={planned}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isToday = item.plannedDate === todayISO;
              return (
                <View style={[styles.card, isToday && styles.cardToday]}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    {isToday && <Text style={styles.todayBadge}>HEUTE</Text>}
                  </View>
                  <PlanMeta item={item} />
                  <View style={styles.buttons}>
                    <TouchableOpacity style={[styles.button, styles.buttonStart]} onPress={() => navigation.navigate('RunSession', { planId: item.id })}>
                      <Text style={styles.buttonText}>{t('Start')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.buttonEdit]} onPress={() => navigation.navigate('PlanSession', { planId: item.id })}>
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
                <TouchableOpacity
                  style={[styles.card, isToday && styles.cardToday]}
                  onPress={() => navigation.navigate('SessionDetail', { logId: item.id })}
                >
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>
                      {[state.sessionPlans.find(p => p.id === item.planId)?.name, getGroupName(item.groupId)].filter(Boolean).join(' · ')}
                    </Text>
                    {isToday && <Text style={styles.todayBadge}>HEUTE</Text>}
                  </View>
                  <Text style={styles.cardMeta}>{formatDateShort(item.startedAt)}</Text>
                  <Text style={styles.cardMeta}>
                    {item.gameLogs.length} {t('Exercises')} ·{' '}
                    {item.gameLogs.reduce((sum, g) => sum + (g.durationSeconds || 0), 0)} {t('sec')}
                  </Text>
                  <View style={styles.buttons}>
                    <TouchableOpacity
                      style={[styles.button, styles.buttonEdit]}
                      onPress={() => navigation.navigate('PlanSession', { fromGroupId: item.groupId, fromGameIds: item.gameLogs.map(g => g.gameId) })}
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
                </TouchableOpacity>
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
