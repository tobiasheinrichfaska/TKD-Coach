import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { generateId } from '../../utils/ids';
import { athleteViews } from '../../domain';
import type { GroupsStackScreenProps } from '../../types/navigation';

const MAX_PHONES = 5;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: COLORS.text },
  input: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: COLORS.text },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  phoneInput: { flex: 1, backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  remove: { padding: 8 },
  removeText: { color: COLORS.danger, fontSize: 18 },
  addLink: { color: COLORS.info, fontWeight: '600', marginTop: 2 },
  toggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  switch: { width: 52, height: 30, borderRadius: 15, padding: 3, justifyContent: 'center' },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.surface },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipOnText: { color: COLORS.surface, fontWeight: '600' },
  chipOff: { backgroundColor: 'transparent', borderColor: COLORS.border, borderStyle: 'dashed' },
  chipOffText: { color: COLORS.text },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonDanger: { backgroundColor: COLORS.danger, marginTop: 10 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
});

export default function EditEmergencyContactScreen({ route, navigation }: GroupsStackScreenProps<'EditEmergencyContact'>) {
  const { state, dispatch } = useData();
  const contactId = route.params?.contactId;
  const prelinkAthleteId = route.params?.athleteId;
  const contact = contactId ? state.persons.find(p => p.id === contactId) : null;
  const existingLinks = state.contactLinks.filter(l => l.contactId === contactId);

  const [name, setName] = useState(contact?.name || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [phones, setPhones] = useState<string[]>(contact?.phones?.length ? contact.phones : ['']);
  // Single guardian flag applied to all of this contact's links (data model supports per-edge).
  const [isGuardian, setIsGuardian] = useState(existingLinks.length ? existingLinks.every(l => l.guardian) : true);
  const [athleteIds, setAthleteIds] = useState<string[]>(
    existingLinks.length ? existingLinks.map(l => l.athleteId) : (prelinkAthleteId ? [prelinkAthleteId] : []),
  );

  const setPhoneAt = (i: number, v: string) => setPhones(p => p.map((x, idx) => (idx === i ? v : x)));
  const removePhoneAt = (i: number) => setPhones(p => p.filter((_, idx) => idx !== i));
  const addPhone = () => setPhones(p => (p.length < MAX_PHONES ? [...p, ''] : p));
  const toggleAthlete = (id: string) =>
    setAthleteIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]));

  const handleSave = () => {
    if (!name.trim()) return;
    const cleanedPhones = phones.map(p => p.trim()).filter(Boolean).slice(0, MAX_PHONES);
    const personId = contact?.id || generateId();

    // Upsert the contact Person — preserve any athlete role / coach flag they already hold.
    dispatch({
      type: contact ? 'UPDATE_PERSON' : 'ADD_PERSON',
      payload: {
        id: personId,
        name: name.trim(),
        email: email.trim() || undefined,
        phones: cleanedPhones,
        isCoach: contact?.isCoach ?? false,
        athlete: contact?.athlete,
      },
    });

    // Reconcile contact edges to the selected athletes.
    const desired = new Set(athleteIds);
    existingLinks.filter(l => !desired.has(l.athleteId)).forEach(l => dispatch({ type: 'DELETE_CONTACT_LINK', payload: { id: l.id } }));
    for (const aid of athleteIds) {
      const ex = existingLinks.find(l => l.athleteId === aid);
      if (ex) {
        if (ex.guardian !== isGuardian) dispatch({ type: 'UPDATE_CONTACT_LINK', payload: { ...ex, guardian: isGuardian } });
      } else {
        dispatch({ type: 'ADD_CONTACT_LINK', payload: { id: generateId(), contactId: personId, athleteId: aid, guardian: isGuardian } });
      }
    }
    navigation.goBack();
  };

  const confirmDelete = () => {
    if (!contact) return;
    Alert.alert(
      `Delete ${contact.name}?`,
      'This removes the contact and unlinks it from all athletes. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            existingLinks.forEach(l => dispatch({ type: 'DELETE_CONTACT_LINK', payload: { id: l.id } }));
            // If this person only ever served as a contact, remove the dangling Person too.
            if (!contact.athlete && !contact.isCoach) dispatch({ type: 'DELETE_PERSON', payload: { id: contact.id } });
            navigation.goBack();
          },
        },
      ],
    );
  };

  const athletes = athleteViews(state.persons).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{contact ? 'Edit Contact' : 'New Contact'}</Text>

        <TextInput style={styles.input} placeholder="Name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.section}>Phone numbers</Text>
        {phones.map((p, i) => (
          <View key={i} style={styles.phoneRow}>
            <TextInput style={styles.phoneInput} placeholder={`Phone ${i + 1}`} placeholderTextColor={COLORS.textMuted} value={p} onChangeText={t => setPhoneAt(i, t)} keyboardType="phone-pad" />
            {phones.length > 1 && (
              <TouchableOpacity style={styles.remove} onPress={() => removePhoneAt(i)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        {phones.length < MAX_PHONES && (
          <TouchableOpacity onPress={addPhone}>
            <Text style={styles.addLink}>+ Add phone (max {MAX_PHONES})</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.section}>Guardian</Text>
        <TouchableOpacity style={styles.toggle} onPress={() => setIsGuardian(v => !v)} activeOpacity={0.7}>
          <Text style={{ color: COLORS.text }}>Legal guardian (Erziehungsberechtigt)</Text>
          <View style={[styles.switch, { backgroundColor: isGuardian ? COLORS.primary : COLORS.border, alignItems: isGuardian ? 'flex-end' : 'flex-start' }]}>
            <View style={styles.knob} />
          </View>
        </TouchableOpacity>

        <Text style={styles.section}>Linked athletes</Text>
        {athletes.length === 0 && <Text style={styles.hint}>No athletes yet.</Text>}
        <View style={styles.chipRow}>
          {athletes.map(a => {
            const on = athleteIds.includes(a.id);
            return (
              <TouchableOpacity key={a.id} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => toggleAthlete(a.id)}>
                <Text style={on ? styles.chipOnText : styles.chipOffText}>{on ? `${a.name}  ✕` : `+ ${a.name}`}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        {contact && (
          <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={confirmDelete}>
            <Text style={styles.buttonText}>Delete Contact</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
