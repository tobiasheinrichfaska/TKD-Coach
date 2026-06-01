import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { athleteViews, coaches } from '../../domain';
import { useT } from '../../i18n';
import type { GroupsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  row: { backgroundColor: COLORS.surface, padding: 18, marginBottom: 10, borderRadius: 10, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  chevron: { fontSize: 22, color: COLORS.textMuted },
});

export default function HumansHubScreen({ navigation }: GroupsStackScreenProps<'HumansHub'>) {
  const { state } = useData();
  const { t } = useT();
  const athleteCount = athleteViews(state.persons).length;
  const coachCount = coaches(state.persons).length;
  const guardianCount = new Set(state.contactLinks.filter(l => l.guardian).map(l => l.contactId)).size;
  const contactCount = new Set(state.contactLinks.map(l => l.contactId)).size;

  const rows: { title: string; meta: string; color: string; go: () => void }[] = [
    { title: 'Athletes', meta: `${athleteCount} athlete${athleteCount === 1 ? '' : 's'}`, color: COLORS.primary, go: () => navigation.navigate('AllAthletes') },
    { title: 'Groups', meta: `${state.groups.length} group${state.groups.length === 1 ? '' : 's'}`, color: COLORS.info, go: () => navigation.navigate('GroupsList') },
    { title: 'Emergency contacts & guardians', meta: `${contactCount} contact${contactCount === 1 ? '' : 's'} · ${guardianCount} guardian${guardianCount === 1 ? '' : 's'}`, color: COLORS.success, go: () => navigation.navigate('EmergencyContacts') },
    { title: 'Assessment & progress', meta: `${coachCount} coach${coachCount === 1 ? '' : 'es'} · log + track metrics`, color: COLORS.warning, go: () => navigation.navigate('Assessment', { screen: 'AssessmentList' }) },
  ];

  return (
    <ScrollView style={styles.container}>
      {rows.map(r => (
        <TouchableOpacity key={r.title} style={[styles.row, { borderLeftColor: r.color }]} onPress={r.go}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t(r.title)}</Text>
            <Text style={styles.meta}>{r.meta}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
