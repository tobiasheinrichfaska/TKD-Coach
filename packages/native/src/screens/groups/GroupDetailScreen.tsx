import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { athletesInGroup, sortedSlots, formatSlot } from '../../domain';
import { getBeltLabel } from '../../constants/belts';
import type { GroupsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  text: { fontSize: 16, color: COLORS.text },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  groupName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  editBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  editText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  athleteItem: { backgroundColor: COLORS.surface, padding: 12, marginBottom: 8, borderRadius: 8 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});

export default function GroupDetailScreen({ route, navigation }: GroupsStackScreenProps<'GroupDetail'>) {
  const { state } = useData();
  const groupId = route.params.groupId;
  const group = state.groups.find(g => g.id === groupId);
  const athletes = athletesInGroup(state.persons, group);

  if (!group) return <View style={styles.container}><Text>Group not found</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.groupName}>{group.name}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditGroup', { groupId: group.id })}>
          <Text style={styles.editText}>✎ Bearbeiten</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>
        {group.trainingTimes.length > 0 ? sortedSlots(group).map(formatSlot).join('   ·   ') : 'No training times set'}
      </Text>
      <FlatList
        data={athletes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.athleteItem} onPress={() => navigation.navigate('AthleteDetail', { athleteId: item.id })}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{getBeltLabel(item.belt)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.text}>No athletes in this group</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('EditAthlete', { groupId: group.id })}>
        <Text style={{ fontSize: 32, color: COLORS.surface }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
