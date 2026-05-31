import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { formatBelt } from '../../utils/format';
import { groupsForAthlete } from '../../domain';
import type { GroupsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: COLORS.text },
  row: { backgroundColor: COLORS.surface, padding: 12, marginBottom: 8, borderRadius: 8 },
  rowLabel: { fontSize: 12, color: COLORS.textMuted },
  rowValue: { fontSize: 16, color: COLORS.text, fontWeight: '500', marginTop: 4 },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonSecondary: { backgroundColor: COLORS.info },
  buttonDanger: { backgroundColor: COLORS.danger, marginTop: 12 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row', gap: 8, marginTop: 16 },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 24, marginBottom: 8, color: COLORS.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  chipMember: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipMemberText: { color: COLORS.surface, fontWeight: '600' },
  chipAdd: { backgroundColor: 'transparent', borderColor: COLORS.border, borderStyle: 'dashed' },
  chipAddText: { color: COLORS.text },
  hint: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
});

export default function AthleteDetailScreen({ route, navigation }: GroupsStackScreenProps<'AthleteDetail'>) {
  const { state, dispatch } = useData();
  const athleteId = route.params.athleteId;
  const athlete = state.athletes.find(a => a.id === athleteId);

  if (!athlete) return <View style={styles.container}><Text style={styles.rowValue}>Athlete not found</Text></View>;

  const memberGroups = groupsForAthlete(state.groups, athlete.id);
  const otherGroups = state.groups.filter(g => !g.athleteIds.includes(athlete.id));

  const removeFromGroup = (groupId: string) => {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    dispatch({ type: 'UPDATE_GROUP', payload: { ...group, athleteIds: group.athleteIds.filter(id => id !== athlete.id) } });
  };
  const addToGroup = (groupId: string) => {
    const group = state.groups.find(g => g.id === groupId);
    if (!group || group.athleteIds.includes(athlete.id)) return;
    dispatch({ type: 'UPDATE_GROUP', payload: { ...group, athleteIds: [...group.athleteIds, athlete.id] } });
  };
  const confirmDelete = () => {
    Alert.alert(
      `Delete ${athlete.name}?`,
      `This permanently deletes ${athlete.name} and everything linked to them — group memberships, all assessments, and attendance records (Teilnahme). This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_ATHLETE', payload: { id: athlete.id } });
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>{athlete.name}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Belt</Text>
          <Text style={styles.rowValue}>{formatBelt(athlete.belt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Birth Year</Text>
          <Text style={styles.rowValue}>{athlete.birthYear || 'N/A'}</Text>
        </View>
        {athlete.contact?.phone && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Phone</Text>
            <Text style={styles.rowValue}>{athlete.contact.phone}</Text>
          </View>
        )}
        {athlete.contact?.parentName && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Parent</Text>
            <Text style={styles.rowValue}>{athlete.contact.parentName}</Text>
          </View>
        )}

        <Text style={styles.section}>Groups</Text>
        {memberGroups.length === 0 && <Text style={styles.hint}>Not in any group yet — tap one below to add.</Text>}
        <View style={styles.chipRow}>
          {memberGroups.map(g => (
            <TouchableOpacity key={g.id} style={[styles.chip, styles.chipMember]} onPress={() => removeFromGroup(g.id)}>
              <Text style={styles.chipMemberText}>{g.name}  ✕</Text>
            </TouchableOpacity>
          ))}
        </View>
        {otherGroups.length > 0 && (
          <>
            <Text style={[styles.hint, { marginTop: 12 }]}>Add to:</Text>
            <View style={styles.chipRow}>
              {otherGroups.map(g => (
                <TouchableOpacity key={g.id} style={[styles.chip, styles.chipAdd]} onPress={() => addToGroup(g.id)}>
                  <Text style={styles.chipAddText}>+ {g.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditAthlete', { athleteId: athlete.id })}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.navigate('Assessment', { screen: 'Progress', params: { athleteId: athlete.id } })}>
            <Text style={styles.buttonText}>Progress</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={confirmDelete}>
          <Text style={styles.buttonText}>Delete Athlete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
