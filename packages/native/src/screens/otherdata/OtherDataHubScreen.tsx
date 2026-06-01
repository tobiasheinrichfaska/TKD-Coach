import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { BUILTIN_GAMES } from '../../constants/games';
import { BUILTIN_TEMPLATES, BUILTIN_BODY_PARTS, BUILTIN_TECHNIQUES, BUILTIN_METRIC_SCHEMAS } from '../../domain';
import type { OtherDataStackScreenProps, OtherDataStackParamList } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  row: { backgroundColor: COLORS.surface, padding: 16, marginBottom: 8, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  chevron: { fontSize: 22, color: COLORS.textMuted },
  resetBtn: { marginTop: 24, padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.danger },
  resetText: { color: COLORS.danger, fontWeight: 'bold' },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' },
});

export default function OtherDataHubScreen({ navigation }: OtherDataStackScreenProps<'OtherDataHub'>) {
  const { state, dispatch } = useData();

  const rows: { title: string; meta: string; route: keyof OtherDataStackParamList }[] = [
    { title: 'Übungen (Games)', meta: `${state.games.length}`, route: 'GamesList' },
    { title: 'Techniques', meta: `${state.techniques.length}`, route: 'TechniquesList' },
    { title: 'Body parts & neuro', meta: `${state.bodyParts.length}`, route: 'BodyPartsList' },
    { title: 'Session templates', meta: `${state.sessionTemplates.length}`, route: 'TemplatesList' },
    { title: 'Metric schemas', meta: `${state.metricSchemas.length}`, route: 'MetricSchemasList' },
  ];

  const resetFactory = () => {
    Alert.alert(
      'Werkseinstellung',
      'Setzt Übungen, Templates, Körperteile/Neuro, Techniken und Metrik-Schemata auf die Werksdaten zurück. ' +
        'Eigene Änderungen an diesen Katalogen gehen verloren. Athleten, Gruppen, Sessions und Kontakte bleiben erhalten.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: () => dispatch({
            type: 'LOAD_ALL',
            payload: {
              ...state,
              games: BUILTIN_GAMES,
              sessionTemplates: BUILTIN_TEMPLATES,
              bodyParts: BUILTIN_BODY_PARTS,
              techniques: BUILTIN_TECHNIQUES,
              metricSchemas: BUILTIN_METRIC_SCHEMAS,
            },
          }),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      {rows.map(r => (
        <TouchableOpacity key={r.route} style={styles.row} onPress={() => navigation.navigate(r.route)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{r.title}</Text>
            <Text style={styles.meta}>{r.meta} entries</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.resetBtn} onPress={resetFactory}>
        <Text style={styles.resetText}>↺ Werkseinstellung (Kataloge zurücksetzen)</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Catalogs are editable seed-once stores. This re-applies the factory data, keeping your people / groups / sessions.</Text>
    </ScrollView>
  );
}
