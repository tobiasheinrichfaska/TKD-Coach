import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { groupsForAthlete, ungroupedAthletes } from '../../domain';
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
  const [filter, setFilter] = useState<'all' | 'ungrouped'>('all');

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      `Delete ${name}?`,
      `This permanently deletes ${name} and everything linked to them — group memberships, all assessments, and attendance records (Teilnahme). This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_ATHLETE', payload: { id } }) },
      ],
    );
  };

  const ungrouped = useMemo(() => ungroupedAthletes(state.athletes, state.groups), [state.athletes, state.groups]);
  const data = useMemo(() => {
    const list = filter === 'ungrouped' ? ungrouped : state.athletes;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [filter, ungrouped, state.athletes]);

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.tab, filter === 'all' && styles.tabActive]} onPress={() => setFilter('all')}>
          <Text style={filter === 'all' ? styles.tabActiveText : styles.tabText}>All ({state.athletes.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, filter === 'ungrouped' && styles.tabActive]} onPress={() => setFilter('ungrouped')}>
          <Text style={filter === 'ungrouped' ? styles.tabActiveText : styles.tabText}>Ungrouped ({ungrouped.length})</Text>
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
                {groups.length > 0 ? `${groups.length} group${groups.length > 1 ? 's' : ''}` : 'Ungrouped'}
              </Text>
              <TouchableOpacity style={styles.trash} onPress={() => confirmDelete(item.id, item.name)}>
                <Text style={styles.trashText}>🗑</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.text}>{filter === 'ungrouped' ? 'Every athlete is in a group.' : 'No athletes yet. Tap + to add one.'}</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('EditAthlete', {})}>
        <Text style={{ fontSize: 32, color: COLORS.surface }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
