import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { formatBelt } from '../../utils/format';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: COLORS.text },
  row: { backgroundColor: COLORS.surface, padding: 12, marginBottom: 8, borderRadius: 8 },
  rowLabel: { fontSize: 12, color: COLORS.textMuted },
  rowValue: { fontSize: 16, color: COLORS.text, fontWeight: '500', marginTop: 4 },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonSecondary: { backgroundColor: COLORS.info },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row', gap: 8, marginTop: 16 },
});

export default function AthleteDetailScreen({ route, navigation }: any) {
  const { state } = useData();
  const athlete = state.athletes.find(a => a.id === route.params?.athleteId);

  if (!athlete) return <View style={styles.container}><Text>Athlete not found</Text></View>;

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

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditAthlete', { athleteId: athlete.id })}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.navigate('AssessmentTab', { screen: 'Progress', params: { athleteId: athlete.id } })}>
            <Text style={styles.buttonText}>Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
