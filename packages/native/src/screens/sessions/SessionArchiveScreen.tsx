import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { formatDateShort } from '../../utils/format';
import { archivedLogs, actualSeconds } from '../../domain';
import { useT } from '../../i18n';
import type { SessionsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  card: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  games: { fontSize: 12, color: COLORS.textLight, marginTop: 6 },
  button: { backgroundColor: COLORS.info, padding: 8, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 12 },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 24 },
});

export default function SessionArchiveScreen({ navigation }: SessionsStackScreenProps<'SessionArchive'>) {
  const { state, dispatch } = useData();
  const { t } = useT();

  const archived = archivedLogs(state.sessionLogs);

  const groupName = (id: string) => state.groups.find(g => g.id === id)?.name || t('Unknown group');
  const planName = (id: string) => state.sessionPlans.find(p => p.id === id)?.name;
  const gameNames = (ids: string[]) => ids.map(id => state.games.find(g => g.id === id)?.shortName || id).join(' · ');

  return (
    <View style={styles.container}>
      <FlatList
        data={archived}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const played = item.gameLogs.filter(g => g.durationSeconds != null);
          const totalSec = actualSeconds(item);
          return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SessionDetail', { logId: item.id })}>
              <Text style={styles.title}>{[planName(item.planId), groupName(item.groupId)].filter(Boolean).join(' · ')}</Text>
              <Text style={styles.meta}>{formatDateShort(item.startedAt)} · {played.length} {t('Exercises')} · {Math.round(totalSec / 60)} min</Text>
              <Text style={styles.games}>{gameNames(played.map(g => g.gameId))}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => dispatch({ type: 'UPDATE_SESSION_LOG', payload: { ...item, archived: false } })}
              >
                <Text style={styles.buttonText}>{t('Unarchive')}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>{t('No archived sessions.')}</Text>}
      />
    </View>
  );
}
