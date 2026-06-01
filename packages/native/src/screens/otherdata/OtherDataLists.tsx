import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { SESSION_PHASE_LABELS } from '../../types';
import type { OtherDataStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  item: { backgroundColor: COLORS.surface, padding: 12, marginBottom: 8, borderRadius: 8 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 24 },
});

const Row = ({ title, meta }: { title: string; meta?: string }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
    {meta ? <Text style={styles.meta}>{meta}</Text> : null}
  </View>
);

export function GamesListScreen(_p: OtherDataStackScreenProps<'GamesList'>) {
  const { state } = useData();
  const data = [...state.games].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <View style={styles.container}>
      <FlatList data={data} keyExtractor={g => g.id}
        renderItem={({ item }) => (
          <Row title={`${item.name}${item.isBuiltIn ? '' : ' ·​ custom'}`}
            meta={`${item.defaultMinutes} min · Phasen ${item.sessionPhases.map(p => SESSION_PHASE_LABELS[p].split(' ')[1]).join('/')}` +
              `${item.techniques?.length ? ` · ${item.techniques.length} Techniken` : ''}` +
              `${item.bodyParts?.length ? ` · ${item.bodyParts.length} Körper/Neuro` : ''}`} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No Übungen.</Text>} />
    </View>
  );
}

export function TechniquesListScreen(_p: OtherDataStackScreenProps<'TechniquesList'>) {
  const { state } = useData();
  const data = [...state.techniques].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return (
    <View style={styles.container}>
      <FlatList data={data} keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <Row title={`${item.name}${item.koreanName ? `  ${item.koreanName}` : ''}`}
            meta={`${item.category} · ${item.bodyPartIds.join(', ')}`} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No techniques.</Text>} />
    </View>
  );
}

export function BodyPartsListScreen(_p: OtherDataStackScreenProps<'BodyPartsList'>) {
  const { state } = useData();
  const data = [...state.bodyParts];
  return (
    <View style={styles.container}>
      <FlatList data={data} keyExtractor={b => b.id}
        renderItem={({ item }) => <Row title={item.name} meta={`${item.region} · ${item.kind}`} />}
        ListEmptyComponent={<Text style={styles.empty}>No body parts.</Text>} />
    </View>
  );
}

export function TemplatesListScreen(_p: OtherDataStackScreenProps<'TemplatesList'>) {
  const { state } = useData();
  const data = [...state.sessionTemplates];
  return (
    <View style={styles.container}>
      <FlatList data={data} keyExtractor={t => t.id}
        renderItem={({ item }) => <Row title={item.name} meta={`${item.ageGroup} · ${item.itemIds.length} Übungen`} />}
        ListEmptyComponent={<Text style={styles.empty}>No session templates.</Text>} />
    </View>
  );
}

export function MetricSchemasListScreen(_p: OtherDataStackScreenProps<'MetricSchemasList'>) {
  const { state } = useData();
  const data = [...state.metricSchemas];
  return (
    <View style={styles.container}>
      <FlatList data={data} keyExtractor={m => m.type}
        renderItem={({ item }) => <Row title={item.label} meta={`${item.type} · ${item.fields.map(f => f.label).join(', ')}`} />}
        ListEmptyComponent={<Text style={styles.empty}>No metric schemas.</Text>} />
    </View>
  );
}
