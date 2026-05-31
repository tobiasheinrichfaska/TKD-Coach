import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { callNumber } from '../../utils/linking';
import type { GroupsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  text: { fontSize: 16, color: COLORS.text },
  muted: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  item: { backgroundColor: COLORS.surface, padding: 12, marginBottom: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, fontSize: 11, color: COLORS.surface, fontWeight: '600', overflow: 'hidden', backgroundColor: COLORS.info },
  call: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.success, marginLeft: 8 },
  callText: { color: COLORS.surface, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});

export default function EmergencyContactsScreen({ navigation }: GroupsStackScreenProps<'EmergencyContacts'>) {
  const { state } = useData();
  // A "contact" is any person referenced as a contact in ≥1 link.
  const contactIds = [...new Set(state.contactLinks.map(l => l.contactId))];
  const contacts = contactIds
    .map(id => {
      const person = state.persons.find(p => p.id === id);
      if (!person) return null;
      const links = state.contactLinks.filter(l => l.contactId === id);
      return { person, count: links.length, anyGuardian: links.some(l => l.guardian) };
    })
    .filter((c): c is { person: NonNullable<typeof c>['person']; count: number; anyGuardian: boolean } => c !== null)
    .sort((a, b) => a.person.name.localeCompare(b.person.name));

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        keyExtractor={item => item.person.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('EditEmergencyContact', { contactId: item.person.id })}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.text}>{item.person.name}</Text>
                {item.anyGuardian && <Text style={styles.badge}>Erz.-berechtigt</Text>}
              </View>
              <Text style={styles.muted}>
                {item.count} athlete{item.count === 1 ? '' : 's'}
                {item.person.phones[0] ? ` · ${item.person.phones[0]}` : ''}
                {item.person.email ? ` · ${item.person.email}` : ''}
              </Text>
            </View>
            {item.person.phones[0] && (
              <TouchableOpacity style={styles.call} onPress={() => callNumber(item.person.phones[0])}>
                <Text style={styles.callText}>Anrufen</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.text}>No contacts yet. Tap + to add one.</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('EditEmergencyContact', {})}>
        <Text style={{ fontSize: 32, color: COLORS.surface }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
