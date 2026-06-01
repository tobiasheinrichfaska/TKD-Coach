import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { formatBelt } from '../../utils/format';
import { groupsForAthlete, contactsForAthlete, guardiansForAthlete, toAthleteView, getPerson, otherRolesBesidesAthlete, athleteAttendanceStats } from '../../domain';
import { callNumber, sendEmail } from '../../utils/linking';
import { useT } from '../../i18n';
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
  const { t } = useT();
  const athleteId = route.params.athleteId;
  const personRecord = getPerson(state.persons, athleteId);
  const athlete = toAthleteView(personRecord);

  if (!athlete || !personRecord) return <View style={styles.container}><Text style={styles.rowValue}>{t('Athlete not found')}</Text></View>;

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
    const others = otherRolesBesidesAthlete(personRecord, state.contactLinks);
    if (others.length > 0) {
      // Person also has other roles → don't nuke the whole human; offer role-only removal.
      Alert.alert(
        `${athlete.name} ${t('has other roles')}`,
        `${athlete.name} ${t('is also')} ${others.join(' & ')} ${t('for others. Remove only the athlete role (keep the person), or delete the entire person?')}`,
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Remove athlete role'),
            onPress: () => { dispatch({ type: 'REMOVE_ATHLETE_ROLE', payload: { id: athlete.id } }); navigation.goBack(); },
          },
          {
            text: t('Delete person'),
            style: 'destructive',
            onPress: () => { dispatch({ type: 'DELETE_PERSON', payload: { id: athlete.id } }); navigation.goBack(); },
          },
        ],
      );
      return;
    }
    Alert.alert(
      `${t('Delete')} ${athlete.name}?`,
      t('This permanently deletes the person and everything linked to them — group memberships and all assessments. This cannot be undone.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
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
          <Text style={styles.rowLabel}>{t('Belt')}</Text>
          <Text style={styles.rowValue}>{formatBelt(athlete.belt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('Birth year')}</Text>
          <Text style={styles.rowValue}>{athlete.birthYear || 'N/A'}</Text>
        </View>
        {athlete.phones[0] && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('Phone')}</Text>
            <Text style={[styles.rowValue, styles.link]} onPress={() => callNumber(athlete.phones[0])}>{athlete.phones[0]}</Text>
          </View>
        )}
        {(() => {
          const att = athleteAttendanceStats(state.sessionLogs, athlete.id);
          return (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('Attendance')}</Text>
              <Text style={styles.rowValue}>
                {att.total > 0 ? `${att.present} / ${att.total} ${t('sessions')}` : t('No sessions yet')}
              </Text>
            </View>
          );
        })()}

        <Text style={styles.section}>{t('Emergency contacts')}</Text>
        {needsGuardian && <Text style={styles.warnHint}>⚠ {t('No guardian on file (athlete may be under 18).')}</Text>}
        {contacts.length === 0 && <Text style={styles.hint}>{t('No contacts linked yet.')}</Text>}
        {contacts.map(c => (
          <View key={c.link.id} style={styles.contactCard}>
            <TouchableOpacity onPress={() => navigation.navigate('EditEmergencyContact', { contactId: c.person.id })}>
              <Text style={styles.contactName}>
                {c.person.name}{c.guardian ? <Text style={styles.guardianTag}>  {t('Guardian')}  </Text> : null}
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
          <Text style={[styles.link, { marginTop: 4 }]}>+ {t('Add contact')}</Text>
        </TouchableOpacity>

        <Text style={styles.section}>{t('Groups')}</Text>
        {memberGroups.length === 0 && <Text style={styles.hint}>{t('Not in any group yet — tap one below to add.')}</Text>}
        <View style={styles.chipRow}>
          {memberGroups.map(g => (
            <TouchableOpacity key={g.id} style={[styles.chip, styles.chipMember]} onPress={() => removeFromGroup(g.id)}>
              <Text style={styles.chipMemberText}>{g.name}  ✕</Text>
            </TouchableOpacity>
          ))}
        </View>
        {otherGroups.length > 0 && (
          <>
            <Text style={[styles.hint, { marginTop: 12 }]}>{t('Add to:')}</Text>
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
            <Text style={styles.buttonText}>{t('Edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.navigate('Assessment', { screen: 'Progress', params: { athleteId: athlete.id } })}>
            <Text style={styles.buttonText}>{t('Progress')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={confirmDelete}>
          <Text style={styles.buttonText}>{t('Delete athlete')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
