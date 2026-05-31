import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { generateId } from '../../utils/ids';
import { BELT_INFOS } from '../../constants/belts';
import type { Belt } from '../../types';
import type { GroupsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  input: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 20, marginBottom: 8, color: COLORS.text },
  beltRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  beltChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  beltChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  beltChipText: { color: COLORS.text, fontSize: 13 },
  beltChipTextActive: { color: COLORS.surface, fontWeight: '600' },
});

export default function EditAthleteScreen({ route, navigation }: GroupsStackScreenProps<'EditAthlete'>) {
  const { state, dispatch } = useData();
  const athleteId = route.params?.athleteId;
  const groupId = route.params?.groupId;
  const athlete = athleteId ? state.athletes.find(a => a.id === athleteId) : null;

  const [name, setName] = useState(athlete?.name || '');
  const [belt, setBelt] = useState<Belt>(athlete?.belt || 'kup-10');
  const [phone, setPhone] = useState(athlete?.contact?.phone || '');
  const [parentName, setParentName] = useState(athlete?.contact?.parentName || '');

  const handleSave = () => {
    // Name is always required.
    if (!name.trim()) return;

    if (athleteId && athlete) {
      dispatch({
        type: 'UPDATE_ATHLETE',
        payload: {
          ...athlete,
          name,
          belt,
          contact: { phone, parentName, email: athlete.contact?.email },
        },
      });
    } else {
      // Athletes exist independently of groups (M:N). If we arrived from a group context,
      // file the new athlete into that group; otherwise create them ungrouped.
      const newId = generateId();
      dispatch({
        type: 'ADD_ATHLETE',
        payload: {
          id: newId,
          name,
          belt,
          neuroProfile: { vestibular: 3, visual: 3, proprioceptive: 3 },
          poomsae: [],
          techniques: [],
          contact: { phone, parentName },
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

        <Text style={styles.section}>Belt</Text>
        <View style={styles.beltRow}>
          {BELT_INFOS.map(b => (
            <TouchableOpacity
              key={b.value}
              style={[styles.beltChip, belt === b.value && styles.beltChipActive]}
              onPress={() => setBelt(b.value)}
            >
              <Text style={belt === b.value ? styles.beltChipTextActive : styles.beltChipText}>{b.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.section}>Contact</Text>
        <TextInput style={styles.input} placeholder="Phone" placeholderTextColor={COLORS.textMuted} value={phone} onChangeText={setPhone} />
        <TextInput style={styles.input} placeholder="Parent Name" placeholderTextColor={COLORS.textMuted} value={parentName} onChangeText={setParentName} />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
