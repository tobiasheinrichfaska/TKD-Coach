import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import type { GroupsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  text: { fontSize: 16, color: COLORS.text },
  groupItem: { backgroundColor: COLORS.surface, padding: 16, marginBottom: 8, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});

export default function GroupsScreen({ navigation }: GroupsStackScreenProps<'GroupsList'>) {
  const { state } = useData();

  return (
    <View style={styles.container}>
      <FlatList
        data={state.groups}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.groupItem} onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{item.athleteIds.length} athletes</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.text}>No groups yet. Tap + to create one.</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('EditGroup')}>
        <Text style={{ fontSize: 32, color: COLORS.surface }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
