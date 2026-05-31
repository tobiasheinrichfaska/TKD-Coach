import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { generateId } from '../../utils/ids';
import { getPerson } from '../../domain';
import type { GroupsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  text: { fontSize: 16, color: COLORS.text },
  muted: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  intro: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  toggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  switch: { width: 52, height: 30, borderRadius: 15, padding: 3, justifyContent: 'center' },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.surface },
  createBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 18 },
  createText: { color: COLORS.surface, fontWeight: 'bold' },
  section: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: COLORS.text },
  item: { backgroundColor: COLORS.surface, padding: 12, marginBottom: 8, borderRadius: 8 },
  tag: { fontSize: 11, color: COLORS.textMuted },
});

export default function AddContactScreen({ route, navigation }: GroupsStackScreenProps<'AddContact'>) {
  const { state, dispatch } = useData();
  const athleteId = route.params.athleteId;
  const [guardian, setGuardian] = useState(false);

  const athlete = getPerson(state.persons, athleteId);

  // Candidates: everyone except the athlete and anyone already a contact for them.
  const alreadyLinked = useMemo(
    () => new Set(state.contactLinks.filter(l => l.athleteId === athleteId).map(l => l.contactId)),
    [state.contactLinks, athleteId],
  );
  const candidates = useMemo(
    () => state.persons
      .filter(p => p.id !== athleteId && !alreadyLinked.has(p.id))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [state.persons, athleteId, alreadyLinked],
  );

  const roleTag = (p: typeof state.persons[number]) =>
    [p.athlete ? 'Athlet' : null, p.isCoach ? 'Coach' : null].filter(Boolean).join(' · ') || 'Kontakt';

  const linkExisting = (contactId: string) => {
    dispatch({ type: 'ADD_CONTACT_LINK', payload: { id: generateId(), contactId, athleteId, guardian } });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.intro}>Add an emergency contact for {athlete?.name ?? 'this athlete'} — create a new person or pick someone who already exists (e.g. a parent, or a sibling who is a guardian).</Text>

      <TouchableOpacity style={styles.toggle} onPress={() => setGuardian(v => !v)} activeOpacity={0.7}>
        <Text style={{ color: COLORS.text }}>Mark as guardian (Erziehungsberechtigt)</Text>
        <View style={[styles.switch, { backgroundColor: guardian ? COLORS.primary : COLORS.border, alignItems: guardian ? 'flex-end' : 'flex-start' }]}>
          <View style={styles.knob} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.replace('EditEmergencyContact', { athleteId })}
      >
        <Text style={styles.createText}>+ Create new contact</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Or choose an existing person</Text>
      <FlatList
        data={candidates}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => linkExisting(item.id)}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.tag}>{roleTag(item)}{item.phones[0] ? ` · ${item.phones[0]}` : ''}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.muted}>No other people yet — create a new contact above.</Text>}
      />
    </View>
  );
}
