import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { generateId } from '../../utils/ids';
import { getBeltLabel } from '../../constants/belts';
import { promote, demote, canConvertToDan, convertToDan, getPerson, contactsForAthlete } from '../../domain';
import { callNumber } from '../../utils/linking';
import type { Belt, Person } from '../../types';
import type { GroupsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  input: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 20, marginBottom: 8, color: COLORS.text },
  gradeBox: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 14, alignItems: 'center' },
  gradeLabel: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  gradeBtnRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  gradeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  gradeBtnText: { color: COLORS.text, fontWeight: '600' },
  gradeBtnDisabled: { opacity: 0.4 },
  convertBtn: { marginTop: 8, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.info },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },
  contactCard: { backgroundColor: COLORS.surface, padding: 12, marginBottom: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  contactName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  contactLine: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6, alignItems: 'center' },
  link: { color: COLORS.info, fontWeight: '500' },
  remove: { color: COLORS.danger, fontSize: 13 },
});

export default function EditAthleteScreen({ route, navigation }: GroupsStackScreenProps<'EditAthlete'>) {
  const { state, dispatch } = useData();
  const athleteId = route.params?.athleteId;
  const groupId = route.params?.groupId;
  const existing = athleteId ? getPerson(state.persons, athleteId) : null;

  // Stable id for the whole edit session — lets us link contacts during *create* too
  // (the athlete is persisted on first contact-add, so the link always has a real target).
  const [personId] = useState(existing?.id ?? generateId());
  const profile = existing?.athlete;

  const [name, setName] = useState(existing?.name || '');
  const [belt, setBelt] = useState<Belt>(profile?.belt || 'none');
  const [birthYear, setBirthYear] = useState(profile?.birthYear ? String(profile.birthYear) : '');
  const [phone, setPhone] = useState(existing?.phones?.[0] || '');

  const refYear = new Date().getFullYear();
  const by = birthYear.trim() ? Number(birthYear) : undefined;
  const birthYearNum = by !== undefined && Number.isFinite(by) ? by : undefined;
  const nextUp = promote(belt, birthYearNum, refYear);
  const nextDown = demote(belt);
  const showConvert = canConvertToDan(belt, birthYearNum, refYear);

  // Live person row (may appear after the first persist in create mode) + its contacts.
  const personNow = getPerson(state.persons, personId);
  const contacts = contactsForAthlete(state.persons, state.contactLinks, personId);

  const buildPerson = (): Person => ({
    id: personId,
    name: name.trim(),
    email: personNow?.email,
    phones: phone.trim() ? [phone.trim()] : [],
    isCoach: personNow?.isCoach ?? false,
    athlete: {
      ...(personNow?.athlete ?? { neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 }, poomsae: [], techniques: [] }),
      belt,
      birthYear: birthYearNum,
    },
  });

  /** Save the athlete (create or update). Returns false if name is missing. */
  const persist = (): boolean => {
    if (!name.trim()) return false;
    if (personNow) {
      dispatch({ type: 'UPDATE_PERSON', payload: buildPerson() });
    } else {
      dispatch({ type: 'ADD_PERSON', payload: buildPerson() });
      const group = groupId ? state.groups.find(g => g.id === groupId) : undefined;
      if (group && !group.athleteIds.includes(personId)) {
        dispatch({ type: 'UPDATE_GROUP', payload: { ...group, athleteIds: [...group.athleteIds, personId] } });
      }
    }
    return true;
  };

  const handleSave = () => { if (persist()) navigation.goBack(); };

  const handleAddContact = () => {
    if (!persist()) {
      Alert.alert('Name required', 'Enter the athlete’s name first — the athlete is saved before a contact is linked.');
      return;
    }
    navigation.navigate('AddContact', { athleteId: personId });
  };

  const removeContact = (linkId: string) => dispatch({ type: 'DELETE_CONTACT_LINK', payload: { id: linkId } });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: COLORS.text }}>
          {athleteId ? 'Edit Athlete' : 'Create Athlete'}
        </Text>
        <TextInput style={styles.input} placeholder="Name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
        <TextInput
          style={styles.input}
          placeholder="Birth year (e.g. 2014)"
          placeholderTextColor={COLORS.textMuted}
          value={birthYear}
          onChangeText={setBirthYear}
          keyboardType="number-pad"
          maxLength={4}
        />

        <Text style={styles.section}>Graduierung</Text>
        <View style={styles.gradeBox}>
          <Text style={styles.gradeLabel}>{getBeltLabel(belt)}</Text>
          <View style={styles.gradeBtnRow}>
            <TouchableOpacity
              style={[styles.gradeBtn, !nextDown && styles.gradeBtnDisabled]}
              disabled={!nextDown}
              onPress={() => nextDown && setBelt(nextDown)}
            >
              <Text style={styles.gradeBtnText}>↓ Zurückstufen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.gradeBtn, !nextUp && styles.gradeBtnDisabled]}
              disabled={!nextUp}
              onPress={() => nextUp && setBelt(nextUp)}
            >
              <Text style={styles.gradeBtnText}>↑ Graduieren</Text>
            </TouchableOpacity>
          </View>
          {showConvert && (
            <TouchableOpacity style={styles.convertBtn} onPress={() => { const d = convertToDan(belt); if (d) setBelt(d); }}>
              <Text style={styles.buttonText}>Zu Dan umwandeln</Text>
            </TouchableOpacity>
          )}
          {!nextUp && !showConvert && belt !== 'dan-9' && (
            <Text style={styles.hint}>
              {belt.startsWith('poom-')
                ? 'Höhere Graduierung erst ab nachweislich 14 J. (zu Dan umwandeln) bzw. 15 J.'
                : 'Höchste verfügbare Stufe für dieses Alter.'}
            </Text>
          )}
        </View>

        <Text style={styles.section}>Contact (own)</Text>
        <TextInput style={styles.input} placeholder="Phone (own)" placeholderTextColor={COLORS.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={styles.section}>Emergency contacts</Text>
        {contacts.map(c => (
          <View key={c.link.id} style={styles.contactCard}>
            <Text style={styles.contactName}>{c.person.name}{c.guardian ? '  · Erz.-ber.' : ''}</Text>
            <View style={styles.contactLine}>
              {c.person.phones.map((p, i) => (
                <Text key={i} style={styles.link} onPress={() => callNumber(p)}>📞 {p}</Text>
              ))}
              <Text style={styles.remove} onPress={() => removeContact(c.link.id)}>Entfernen</Text>
            </View>
          </View>
        ))}
        {!personNow && <Text style={[styles.hint, { textAlign: 'left' }]}>Adding a contact saves the athlete first.</Text>}
        <TouchableOpacity onPress={handleAddContact}>
          <Text style={[styles.link, { marginTop: 4 }]}>+ Kontakt hinzufügen / auswählen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
