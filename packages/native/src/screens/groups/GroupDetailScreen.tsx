import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { athletesInGroup } from '../../domain';
import type { GroupsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  text: { fontSize: 16, color: COLORS.text },
  athleteItem: { backgroundColor: COLORS.surface, padding: 12, marginBottom: 8, borderRadius: 8 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});

export default function GroupDetailScreen({ route, navigation }: GroupsStackScreenProps<'GroupDetail'>) {
  const { state } = useData();
  const groupId = route.params.groupId;
  const group = state.groups.find(g => g.id === groupId);
  const athletes = athletesInGroup(state.athletes, group);

  if (!group) return <View style={styles.container}><Text>Group not found</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: COLORS.text }}>{group.name}</Text>
      <FlatList
        data={athletes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.athleteItem} onPress={() => navigation.navigate('AthleteDetail', { athleteId: item.id })}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{item.belt}</Text>
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
