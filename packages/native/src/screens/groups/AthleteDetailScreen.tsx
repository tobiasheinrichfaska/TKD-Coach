import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { formatBelt } from '../../utils/format';
import { groupsForAthlete, contactsForAthlete, guardiansForAthlete, toAthleteView, getPerson } from '../../domain';
import { callNumber, sendEmail } from '../../utils/linking';
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
  link: { color: COLORS.info, fontWeight: '500' },
  contactCard: { backgroundColor: COLORS.surface, padding: 12, marginBottom: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  contactName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  guardianTag: { fontSize: 11, color: COLORS.surface, backgroundColor: COLORS.info, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden', marginLeft: 8 },
  contactLine: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  warnHint: { fontSize: 12, color: COLORS.danger, marginTop: 6, marginBottom: 8 },
});

export default function AthleteDetailScreen({ route, navigation }: GroupsStackScreenProps<'AthleteDetail'>) {
  const { state, dispatch } = useData();
  const athleteId = route.params.athleteId;
  const athlete = toAthleteView(getPerson(state.persons, athleteId));

  if (!athlete) return <View style={styles.container}><Text style={styles.rowValue}>Athlete not found</Text></View>;

  const memberGroups = groupsForAthlete(state.groups, athlete.id);
  const otherGroups = state.groups.filter(g => !g.athleteIds.includes(athlete.id));
  const contacts = contactsForAthlete(state.persons, state.contactLinks, athlete.id);
  const guardians = guardiansForAthlete(state.persons, state.contactLinks, athlete.id);
  const refYear = new Date().getFullYear();
  // "optional if 18+": warn about a missing guardian unless the athlete is definitely 18+.
  const definitely18 = !!athlete.birthYear && refYear - athlete.birthYear - 1 >= 18;
  const needsGuardian = guardians.length === 0 && !definitely18;

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
            dispatch({ type: 'DELETE_PERSON', payload: { id: athlete.id } });
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
        {athlete.phones[0] && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Phone</Text>
            <Text style={[styles.rowValue, styles.link]} onPress={() => callNumber(athlete.phones[0])}>{athlete.phones[0]}</Text>
          </View>
        )}

        <Text style={styles.section}>Emergency contacts</Text>
        {needsGuardian && <Text style={styles.warnHint}>⚠ Kein Erziehungsberechtigter hinterlegt (Athlet evtl. unter 18).</Text>}
        {contacts.length === 0 && <Text style={styles.hint}>No contacts linked yet.</Text>}
        {contacts.map(c => (
          <View key={c.link.id} style={styles.contactCard}>
            <TouchableOpacity onPress={() => navigation.navigate('EditEmergencyContact', { contactId: c.person.id })}>
              <Text style={styles.contactName}>
                {c.person.name}{c.guardian ? <Text style={styles.guardianTag}>  Erz.-ber.  </Text> : null}
              </Text>
            </TouchableOpacity>
            <View style={styles.contactLine}>
              {c.person.phones.map((p, i) => (
                <Text key={i} style={styles.link} onPress={() => callNumber(p)}>📞 {p}</Text>
              ))}
              {c.person.email ? <Text style={styles.link} onPress={() => sendEmail(c.person.email!)}>✉ {c.person.email}</Text> : null}
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={() => navigation.navigate('AddContact', { athleteId: athlete.id })}>
          <Text style={[styles.link, { marginTop: 4 }]}>+ Kontakt hinzufügen</Text>
        </TouchableOpacity>

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
