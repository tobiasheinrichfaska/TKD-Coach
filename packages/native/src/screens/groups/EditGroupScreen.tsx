import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { generateId } from '../../utils/ids';
import { WEEKDAY_LABELS } from '../../domain';
import type { TrainingSlot, Weekday } from '../../types';
import type { GroupsStackScreenProps } from '../../types/navigation';

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: COLORS.text },
  input: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 8, marginBottom: 8, color: COLORS.text },
  slotCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 10 },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  dayChip: { width: 38, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  dayChipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayText: { color: COLORS.text, fontSize: 13 },
  dayTextOn: { color: COLORS.surface, fontWeight: '700' },
  timeRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  smallInput: { backgroundColor: COLORS.background, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text, width: 90, textAlign: 'center' },
  fieldLabel: { fontSize: 12, color: COLORS.textMuted },
  remove: { marginLeft: 'auto' },
  removeText: { color: COLORS.danger, fontSize: 13 },
  addLink: { color: COLORS.info, fontWeight: '600', marginBottom: 8 },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 16 },
});

export default function EditGroupScreen({ route, navigation }: GroupsStackScreenProps<'EditGroup'>) {
  const { state, dispatch } = useData();
  const groupId = route.params?.groupId;
  const group = groupId ? state.groups.find(g => g.id === groupId) : null;

  const [name, setName] = useState(group?.name || '');
  const [slots, setSlots] = useState<TrainingSlot[]>(group?.trainingTimes ?? []);

  const updateSlot = (i: number, patch: Partial<TrainingSlot>) =>
    setSlots(s => s.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const removeSlot = (i: number) => setSlots(s => s.filter((_, idx) => idx !== i));
  const addSlot = () => setSlots(s => [...s, { weekday: 1, start: '17:00', durationMin: 90 }]);

  const handleSave = () => {
    if (!name.trim()) return;
    const trainingTimes = slots
      .filter(s => /^\d{1,2}:\d{2}$/.test(s.start) && s.durationMin > 0)
      .map(s => ({ ...s, start: s.start.padStart(5, '0') }));
    if (groupId && group) {
      dispatch({ type: 'UPDATE_GROUP', payload: { ...group, name, trainingTimes } });
    } else {
      dispatch({ type: 'ADD_GROUP', payload: { id: generateId(), name, trainingTimes, athleteIds: [] } });
    }
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{groupId ? 'Edit Group' : 'Create Group'}</Text>
        <TextInput style={styles.input} placeholder="Group name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />

        <Text style={styles.section}>Training times</Text>
        {slots.map((slot, i) => (
          <View key={i} style={styles.slotCard}>
            <View style={styles.dayRow}>
              {WEEKDAYS.map(w => (
                <TouchableOpacity key={w} style={[styles.dayChip, slot.weekday === w && styles.dayChipOn]} onPress={() => updateSlot(i, { weekday: w })}>
                  <Text style={slot.weekday === w ? styles.dayTextOn : styles.dayText}>{WEEKDAY_LABELS[w]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.timeRow}>
              <View>
                <Text style={styles.fieldLabel}>Start</Text>
                <TextInput style={styles.smallInput} value={slot.start} onChangeText={t => updateSlot(i, { start: t })} placeholder="17:00" placeholderTextColor={COLORS.textMuted} keyboardType="numbers-and-punctuation" maxLength={5} />
              </View>
              <View>
                <Text style={styles.fieldLabel}>Minutes</Text>
                <TextInput style={styles.smallInput} value={String(slot.durationMin)} onChangeText={t => updateSlot(i, { durationMin: Number(t.replace(/\D/g, '')) || 0 })} keyboardType="number-pad" maxLength={3} />
              </View>
              <TouchableOpacity style={styles.remove} onPress={() => removeSlot(i)}>
                <Text style={styles.removeText}>Entfernen</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={addSlot}>
          <Text style={styles.addLink}>+ Trainingszeit hinzufügen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
