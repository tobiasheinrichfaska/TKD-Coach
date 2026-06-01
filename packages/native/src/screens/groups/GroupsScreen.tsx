import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { ungroupedAthletes, athleteViews, sortedSlots, formatSlot } from '../../domain';
import { useT } from '../../i18n';
import type { GroupsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  text: { fontSize: 16, color: COLORS.text },
  groupItem: { backgroundColor: COLORS.surface, padding: 16, marginBottom: 8, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  allRow: { backgroundColor: COLORS.surface, padding: 16, marginBottom: 8, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: COLORS.info, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactsRow: { backgroundColor: COLORS.surface, padding: 16, marginBottom: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: COLORS.success, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});

export default function GroupsScreen({ navigation }: GroupsStackScreenProps<'GroupsList'>) {
  const { state } = useData();
  const { t } = useT();
  const athleteCount = athleteViews(state.persons).length;
  const ungroupedCount = ungroupedAthletes(state.persons, state.groups).length;
  const contactCount = new Set(state.contactLinks.map(l => l.contactId)).size;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.allRow} onPress={() => navigation.navigate('AllAthletes')}>
        <View>
          <Text style={styles.text}>{t('All Athletes')}</Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
            {athleteCount} {t('total')}{ungroupedCount > 0 ? ` · ${ungroupedCount} ${t('ungrouped')}` : ''}
          </Text>
        </View>
        <Text style={{ fontSize: 20, color: COLORS.textMuted }}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactsRow} onPress={() => navigation.navigate('EmergencyContacts')}>
        <View>
          <Text style={styles.text}>{t('Emergency contacts')}</Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{contactCount} {t('contacts')}</Text>
        </View>
        <Text style={{ fontSize: 20, color: COLORS.textMuted }}>›</Text>
      </TouchableOpacity>

      <FlatList
        data={state.groups}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.groupItem} onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
              {item.athleteIds.length} {t('athletes')}
              {item.trainingTimes.length > 0 ? ` · ${sortedSlots(item).map(formatSlot).join(', ')}` : ''}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.text}>{t('No groups yet. Tap + to create one.')}</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('EditGroup')}>
        <Text style={{ fontSize: 32, color: COLORS.surface }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
