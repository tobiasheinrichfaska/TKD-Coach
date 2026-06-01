import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { athletesInGroup, getMetricSchema, buildMetric } from '../../domain';
import { generateId } from '../../utils/ids';
import { useT } from '../../i18n';
import type { AssessmentStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: COLORS.text },
  picker: { backgroundColor: COLORS.surface, borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
  pickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pickerItemText: { fontSize: 14, color: COLORS.text },
  pickerItemActive: { backgroundColor: COLORS.primary },
  input: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 24 },
});

export default function AssessmentScreen(_props: AssessmentStackScreenProps<'AssessmentList'>) {
  const { state, dispatch } = useData();
  const { t } = useT();
  const [step, setStep] = useState<'group' | 'athlete' | 'game' | 'metric'>('group');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');
  // Raw text per schema field key — parsed to numbers + validated by buildMetric on save.
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  const selectedGroup = state.groups.find(g => g.id === selectedGroupId);
  const groupAthletes = athletesInGroup(state.persons, selectedGroup);
  const selectedGame = state.games.find(g => g.id === selectedGameId);
  const schema = getMetricSchema(state.metricSchemas, selectedGame?.logMetricType ?? '');

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    setValues({});
    setStep('metric');
  };

  const handleSaveMetric = () => {
    const numeric: Record<string, number | undefined> = {};
    for (const f of schema?.fields ?? []) {
      const raw = values[f.key]?.trim();
      numeric[f.key] = raw ? parseFloat(raw.replace(',', '.')) : undefined;
    }
    const metric = buildMetric(schema, numeric);
    if (!selectedAthleteId || !selectedGameId || !metric) {
      Alert.alert(t('Required fields'), t('Fill in all fields.'));
      return;
    }

    dispatch({
      type: 'ADD_ASSESSMENT',
      payload: {
        id: generateId(),
        athleteId: selectedAthleteId,
        gameId: selectedGameId,
        date: new Date().toISOString(),
        metric,
        notes: notes || undefined,
      },
    });

    // Reset and show success
    setStep('group');
    setSelectedGroupId('');
    setSelectedAthleteId('');
    setSelectedGameId('');
    setValues({});
    setNotes('');
  };

  // Render based on step
  if (step === 'group') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.section}>{t('Select group')}</Text>
          {state.groups.length > 0 ? (
            <View style={styles.picker}>
              <FlatList
                scrollEnabled={false}
                data={state.groups}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, selectedGroupId === item.id && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedGroupId(item.id);
                      setStep('athlete');
                    }}
                  >
                    <Text style={[styles.pickerItemText, selectedGroupId === item.id && { color: COLORS.surface }]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : (
            <Text style={styles.empty}>{t('No groups yet')}</Text>
          )}
        </View>
      </ScrollView>
    );
  }

  if (step === 'athlete') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.section}>{t('Select athlete')}</Text>
          <TouchableOpacity onPress={() => setStep('group')} style={{ marginBottom: 12 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '500' }}>← {t('Back to groups')}</Text>
          </TouchableOpacity>
          {groupAthletes.length > 0 ? (
            <View style={styles.picker}>
              <FlatList
                scrollEnabled={false}
                data={groupAthletes}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, selectedAthleteId === item.id && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedAthleteId(item.id);
                      setStep('game');
                    }}
                  >
                    <Text style={[styles.pickerItemText, selectedAthleteId === item.id && { color: COLORS.surface }]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : (
            <Text style={styles.empty}>{t('No athletes in this group')}</Text>
          )}
        </View>
      </ScrollView>
    );
  }

  if (step === 'game') {
    const gamesWithMetrics = state.games.filter(g => g.logMetricType);
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.section}>{t('Select exercise')}</Text>
          <TouchableOpacity onPress={() => setStep('athlete')} style={{ marginBottom: 12 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '500' }}>← {t('Back to athletes')}</Text>
          </TouchableOpacity>
          {gamesWithMetrics.length > 0 ? (
            <View style={styles.picker}>
              <FlatList
                scrollEnabled={false}
                data={gamesWithMetrics}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, selectedGameId === item.id && styles.pickerItemActive]}
                    onPress={() => handleGameSelect(item.id)}
                  >
                    <Text style={[styles.pickerItemText, selectedGameId === item.id && { color: COLORS.surface }]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : (
            <Text style={styles.empty}>{t('No trackable exercises')}</Text>
          )}
        </View>
      </ScrollView>
    );
  }

  // Metric form step — generated from the metric schema (one field loop, all types).
  const renderMetricForm = () => {
    if (!schema) return <Text style={styles.empty}>{t('No metric form for this exercise')}</Text>;
    return schema.fields.map(f => (
      <TextInput
        key={f.key}
        style={styles.input}
        placeholder={f.unit ? `${f.label} (${f.unit})` : f.label}
        placeholderTextColor={COLORS.textMuted}
        keyboardType={f.integer ? 'number-pad' : 'decimal-pad'}
        value={values[f.key] ?? ''}
        onChangeText={txt => setValues(v => ({ ...v, [f.key]: txt }))}
      />
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.section}>{selectedGame?.name || t('Log metric')}</Text>
        <TouchableOpacity onPress={() => setStep('game')} style={{ marginBottom: 12 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '500' }}>← {t('Back to exercises')}</Text>
        </TouchableOpacity>

        <Text style={styles.section}>{t('Metric value')}</Text>
        {renderMetricForm()}

        <Text style={styles.section}>{t('Notes (optional)')}</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder={t('Any observations...')}
          placeholderTextColor={COLORS.textMuted}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={styles.button} onPress={handleSaveMetric}>
          <Text style={styles.buttonText}>{t('Save assessment')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
