import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { generateId } from '../../utils/ids';
import { getBeltLabel } from '../../constants/belts';
import { promote, demote, canConvertToDan, convertToDan } from '../../domain';
import type { Belt } from '../../types';
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
});

export default function EditAthleteScreen({ route, navigation }: GroupsStackScreenProps<'EditAthlete'>) {
  const { state, dispatch } = useData();
  const athleteId = route.params?.athleteId;
  const groupId = route.params?.groupId;
  const person = athleteId ? state.persons.find(p => p.id === athleteId) : null;
  const profile = person?.athlete;

  const [name, setName] = useState(person?.name || '');
  const [belt, setBelt] = useState<Belt>(profile?.belt || 'none');
  const [birthYear, setBirthYear] = useState(profile?.birthYear ? String(profile.birthYear) : '');
  const [phone, setPhone] = useState(person?.phones?.[0] || '');

  const refYear = new Date().getFullYear();
  const by = birthYear.trim() ? Number(birthYear) : undefined;
  const birthYearNum = by !== undefined && Number.isFinite(by) ? by : undefined;
  const nextUp = promote(belt, birthYearNum, refYear);
  const nextDown = demote(belt);
  const showConvert = canConvertToDan(belt, birthYearNum, refYear);

  const handleSave = () => {
    // Name is always required.
    if (!name.trim()) return;

    const phones = phone.trim() ? [phone.trim()] : [];

    if (person) {
      // Preserve the rest of the person (coach role, email, neuroProfile, poomsae, …).
      dispatch({
        type: 'UPDATE_PERSON',
        payload: {
          ...person,
          name,
          phones,
          athlete: {
            ...(person.athlete ?? { neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 }, poomsae: [], techniques: [] }),
            belt,
            birthYear: birthYearNum,
          },
        },
      });
    } else {
      // Athletes exist independently of groups (M:N). If we arrived from a group context,
      // file the new athlete into that group; otherwise create them ungrouped.
      const newId = generateId();
      dispatch({
        type: 'ADD_PERSON',
        payload: {
          id: newId,
          name,
          phones,
          isCoach: false,
          athlete: {
            belt,
            birthYear: birthYearNum,
            neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 },
            poomsae: [],
            techniques: [],
          },
        },
      });
      const group = groupId ? state.groups.find(g => g.id === groupId) : undefined;
      if (group) {
        dispatch({
          type: 'UPDATE_GROUP',
          payload: { ...group, athleteIds: [...group.athleteIds, newId] },
        });
      }
    }
    navigation.goBack();
  };

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

        <Text style={styles.section}>Contact</Text>
        <TextInput style={styles.input} placeholder="Phone (own)" placeholderTextColor={COLORS.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Text style={styles.hint}>Parents/guardians are managed as Emergency Contacts on the athlete's detail page.</Text>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
