import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { groupsForAthlete, ungroupedAthletes, athleteViews, getPerson, otherRolesBesidesAthlete } from '../../domain';
import { useT } from '../../i18n';
import type { GroupsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  text: { fontSize: 16, color: COLORS.text },
  muted: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  item: { backgroundColor: COLORS.surface, padding: 12, marginBottom: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, fontSize: 11, overflow: 'hidden', color: COLORS.surface, fontWeight: '600' },
  badgeGrouped: { backgroundColor: COLORS.primary },
  badgeUngrouped: { backgroundColor: COLORS.warning },
  trash: { marginLeft: 12, padding: 4 },
  trashText: { fontSize: 18, color: COLORS.danger },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.text },
  tabActiveText: { color: COLORS.surface, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});

export default function AllAthletesScreen({ navigation }: GroupsStackScreenProps<'AllAthletes'>) {
  const { state, dispatch } = useData();
  const { t } = useT();
  const [filter, setFilter] = useState<'all' | 'ungrouped'>('all');

  const confirmDelete = (id: string, name: string) => {
    const person = getPerson(state.persons, id);
    const others = person ? otherRolesBesidesAthlete(person, state.contactLinks) : [];
    if (others.length > 0) {
      Alert.alert(
        `${name} ${t('has other roles')}`,
        `${name} ${t('is also')} ${others.join(' & ')} ${t('for others. Remove only the athlete role (keep the person), or delete the entire person?')}`,
        [
          { text: t('Cancel'), style: 'cancel' },
          { text: t('Remove athlete role'), onPress: () => dispatch({ type: 'REMOVE_ATHLETE_ROLE', payload: { id } }) },
          { text: t('Delete person'), style: 'destructive', onPress: () => dispatch({ type: 'DELETE_PERSON', payload: { id } }) },
        ],
      );
      return;
    }
    Alert.alert(
      `${t('Delete')} ${name}?`,
      t('This permanently deletes the person and everything linked to them — group memberships and all assessments. This cannot be undone.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Delete'), style: 'destructive', onPress: () => dispatch({ type: 'DELETE_PERSON', payload: { id } }) },
      ],
    );
  };

  const allAthletes = useMemo(() => athleteViews(state.persons), [state.persons]);
  const ungrouped = useMemo(() => ungroupedAthletes(state.persons, state.groups), [state.persons, state.groups]);
  const data = useMemo(() => {
    const list = filter === 'ungrouped' ? ungrouped : allAthletes;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [filter, ungrouped, allAthletes]);

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.tab, filter === 'all' && styles.tabActive]} onPress={() => setFilter('all')}>
          <Text style={filter === 'all' ? styles.tabActiveText : styles.tabText}>{t('All')} ({allAthletes.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, filter === 'ungrouped' && styles.tabActive]} onPress={() => setFilter('ungrouped')}>
          <Text style={filter === 'ungrouped' ? styles.tabActiveText : styles.tabText}>{t('Ungrouped')} ({ungrouped.length})</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const groups = groupsForAthlete(state.groups, item.id);
          return (
            <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AthleteDetail', { athleteId: item.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.text}>{item.name}</Text>
                <Text style={styles.muted}>
                  {item.belt}{groups.length > 0 ? ` · ${groups.map(g => g.name).join(', ')}` : ''}
                </Text>
              </View>
              <Text style={[styles.badge, groups.length > 0 ? styles.badgeGrouped : styles.badgeUngrouped]}>
                {groups.length > 0 ? `${groups.length} ${groups.length > 1 ? t('groups') : t('group')}` : t('Ungrouped')}
              </Text>
              <TouchableOpacity style={styles.trash} onPress={() => confirmDelete(item.id, item.name)}>
                <Text style={styles.trashText}>🗑</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.text}>{filter === 'ungrouped' ? t('Every athlete is in a group.') : t('No athletes yet. Tap + to add one.')}</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('EditAthlete', {})}>
        <Text style={{ fontSize: 32, color: COLORS.surface }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
