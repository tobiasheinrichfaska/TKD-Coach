import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { formatDateShort, toLocalDateISO } from '../../utils/format';
import { recentCompletedLogs, actualSeconds } from '../../domain';
import { useT } from '../../i18n';
import type { SessionsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  card: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  cardToday: { borderLeftWidth: 4, borderLeftColor: COLORS.primary, backgroundColor: '#FFF3F3' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  todayBadge: { fontSize: 10, fontWeight: '700', color: COLORS.surface, backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  meta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  games: { fontSize: 12, color: COLORS.textLight, marginTop: 6 },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  button: { flex: 1, padding: 8, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 12 },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 24 },
});

export default function RecentSessionsScreen({ navigation }: SessionsStackScreenProps<'RecentSessions'>) {
  const { state, dispatch } = useData();
  const { t } = useT();
  const todayISO = toLocalDateISO();

  const recent = recentCompletedLogs(state.sessionLogs);

  const groupName = (id: string) => state.groups.find(g => g.id === id)?.name || t('Unknown group');
  const planName = (id: string) => state.sessionPlans.find(p => p.id === id)?.name;
  const gameNames = (ids: string[]) => ids.map(id => state.games.find(g => g.id === id)?.shortName || id).join(' · ');

  return (
    <View style={styles.container}>
      <FlatList
        data={recent}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isToday = toLocalDateISO(new Date(item.endedAt || item.startedAt)) === todayISO;
          const played = item.gameLogs.filter(g => g.durationSeconds != null);
          const totalSec = actualSeconds(item);
          return (
            <TouchableOpacity
              style={[styles.card, isToday && styles.cardToday]}
              onPress={() => navigation.navigate('SessionDetail', { logId: item.id })}
            >
              <View style={styles.titleRow}>
                <Text style={styles.title}>{[planName(item.planId), groupName(item.groupId)].filter(Boolean).join(' · ')}</Text>
                {isToday && <Text style={styles.todayBadge}>{t('Today')}</Text>}
              </View>
              <Text style={styles.meta}>{formatDateShort(item.startedAt)} · {played.length} {t('Exercises')} · {Math.round(totalSec / 60)} min</Text>
              <Text style={styles.games}>{gameNames(played.map(g => g.gameId))}</Text>
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: COLORS.info }]}
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
        ListEmptyComponent={<Text style={styles.empty}>{t('No recent sessions yet')}</Text>}
      />
    </View>
  );
}
