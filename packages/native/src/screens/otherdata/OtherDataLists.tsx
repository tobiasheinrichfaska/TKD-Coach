import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { SESSION_PHASE_LABELS } from '../../types';
import { useT } from '../../i18n';
import type { OtherDataStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  item: { backgroundColor: COLORS.surface, padding: 12, marginBottom: 8, borderRadius: 8 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 24 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});

const Row = ({ title, meta, onPress }: { title: string; meta?: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Text style={styles.title}>{title}</Text>
    {meta ? <Text style={styles.meta}>{meta}</Text> : null}
  </TouchableOpacity>
);

const Fab = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}><Text style={{ fontSize: 32, color: COLORS.surface }}>+</Text></TouchableOpacity>
);

export function GamesListScreen({ navigation }: OtherDataStackScreenProps<'GamesList'>) {
  const { state } = useData();
  const { t } = useT();
  const data = [...state.games].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <View style={styles.container}>
      <FlatList data={data} keyExtractor={g => g.id}
        renderItem={({ item }) => (
          <Row onPress={() => navigation.navigate('EditGame', { id: item.id })}
            title={`${item.name}${item.isBuiltIn ? '' : ` · ${t('custom')}`}`}
            meta={`${item.defaultMinutes} min · ${t('Phases')} ${item.sessionPhases.map(p => SESSION_PHASE_LABELS[p].split(' ')[1]).join('/')}` +
              `${item.techniques?.length ? ` · ${item.techniques.length} ${t('techniques')}` : ''}${item.bodyParts?.length ? ` · ${item.bodyParts.length} ${t('body/neuro')}` : ''}`} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('No exercises.')}</Text>} />
      <Fab onPress={() => navigation.navigate('EditGame', {})} />
    </View>
  );
}

export function TechniquesListScreen({ navigation }: OtherDataStackScreenProps<'TechniquesList'>) {
  const { state } = useData();
  const { t } = useT();
  const data = [...state.techniques].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return (
    <View style={styles.container}>
      <FlatList data={data} keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Row onPress={() => navigation.navigate('EditTechnique', { id: item.id })}
            title={`${item.name}${item.koreanName ? `  ${item.koreanName}` : ''}`} meta={`${item.category} · ${item.bodyPartIds.join(', ')}`} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('No techniques.')}</Text>} />
      <Fab onPress={() => navigation.navigate('EditTechnique', {})} />
    </View>
  );
}

export function BodyPartsListScreen({ navigation }: OtherDataStackScreenProps<'BodyPartsList'>) {
  const { state } = useData();
  const { t } = useT();
  return (
    <View style={styles.container}>
      <FlatList data={state.bodyParts} keyExtractor={b => b.id}
        renderItem={({ item }) => <Row onPress={() => navigation.navigate('EditBodyPart', { id: item.id })} title={item.name} meta={`${item.region} · ${item.kind}`} />}
        ListEmptyComponent={<Text style={styles.empty}>{t('No body parts.')}</Text>} />
      <Fab onPress={() => navigation.navigate('EditBodyPart', {})} />
    </View>
  );
}

export function TemplatesListScreen({ navigation }: OtherDataStackScreenProps<'TemplatesList'>) {
  const { state } = useData();
  const { t } = useT();
  return (
    <View style={styles.container}>
      <FlatList data={state.sessionTemplates} keyExtractor={item => item.id}
        renderItem={({ item }) => <Row onPress={() => navigation.navigate('EditTemplate', { id: item.id })} title={item.name} meta={`${item.ageGroup} · ${item.itemIds.length} ${t('exercises')}`} />}
        ListEmptyComponent={<Text style={styles.empty}>{t('No templates.')}</Text>} />
      <Fab onPress={() => navigation.navigate('EditTemplate', {})} />
    </View>
  );
}

export function MetricSchemasListScreen({ navigation }: OtherDataStackScreenProps<'MetricSchemasList'>) {
  const { state } = useData();
  const { t } = useT();
  return (
    <View style={styles.container}>
      <FlatList data={state.metricSchemas} keyExtractor={m => m.type}
        renderItem={({ item }) => <Row onPress={() => navigation.navigate('EditMetricSchema', { type: item.type })} title={item.label} meta={`${item.type} · ${item.fields.map(f => f.label).join(', ')}`} />}
        ListEmptyComponent={<Text style={styles.empty}>{t('No metric schemas.')}</Text>} />
      <Fab onPress={() => navigation.navigate('EditMetricSchema', {})} />
    </View>
  );
}
