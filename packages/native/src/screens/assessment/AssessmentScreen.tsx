import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { AssessmentMetric } from '../../types';
import { athletesInGroup } from '../../domain';
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

/**
 * Draft shape used during metric entry — a flat optional bag covering all metric variants.
 * Cast to AssessmentMetric at save boundary (guarded by `Object.keys(metric).length === 0` check).
 */
type MetricDraft = {
  type?: AssessmentMetric['type'];
  dominant?: number;
  nonDominant?: number;
  errorsPerTen?: number;
  correct?: number;
  total?: number;
  stable?: number;
  stumble?: number;
  fall?: number;
  holdSeconds?: number;
  armErrors?: number;
  errors?: number;
  baseline?: number;
};

export default function AssessmentScreen(_props: AssessmentStackScreenProps<'AssessmentList'>) {
  const { state, dispatch } = useData();
  const { t } = useT();
  const [step, setStep] = useState<'group' | 'athlete' | 'game' | 'metric'>('group');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [metric, setMetric] = useState<MetricDraft>({});
  const [notes, setNotes] = useState('');

  const selectedGroup = state.groups.find(g => g.id === selectedGroupId);
  const groupAthletes = athletesInGroup(state.persons, selectedGroup);
  const selectedGame = state.games.find(g => g.id === selectedGameId);

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    setMetric({});
    setStep('metric');
  };

  const handleSaveMetric = () => {
    if (!selectedAthleteId || !selectedGameId || Object.keys(metric).length === 0) return;

    dispatch({
      type: 'ADD_ASSESSMENT',
      payload: {
        id: generateId(),
        athleteId: selectedAthleteId,
        gameId: selectedGameId,
        date: new Date().toISOString(),
        metric: metric as AssessmentMetric,
        notes: notes || undefined,
      },
    });

    // Reset and show success
    setStep('group');
    setSelectedGroupId('');
    setSelectedAthleteId('');
    setSelectedGameId('');
    setMetric({});
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

  // Metric form step
  const renderMetricForm = () => {
    switch (selectedGame?.logMetricType) {
      case 'balance_hold':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder={t('Dominant leg (seconds)')}
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              onChangeText={text =>
                setMetric({ ...metric, type: 'balance_hold', dominant: parseFloat(text) || 0, nonDominant: metric.nonDominant || 0 })
              }
            />
            <TextInput
              style={styles.input}
              placeholder={t('Non-dominant leg (seconds)')}
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              onChangeText={text =>
                setMetric({ ...metric, type: 'balance_hold', nonDominant: parseFloat(text) || 0, dominant: metric.dominant || 0 })
              }
            />
          </>
        );
      case 'reaction_errors':
        return (
          <TextInput
            style={styles.input}
            placeholder={t('Errors per 10 cues')}
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            onChangeText={text => setMetric({ type: 'reaction_errors', errorsPerTen: parseFloat(text) || 0 })}
          />
        );
      case 'combo_accuracy':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder={t('Correct combos')}
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              onChangeText={text => setMetric({ ...metric, correct: parseInt(text) || 0 })}
            />
            <TextInput
              style={styles.input}
              placeholder={t('Total attempts')}
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              onChangeText={text => setMetric({ type: 'combo_accuracy', correct: metric.correct || 0, total: parseInt(text) || 0 })}
            />
          </>
        );
      default:
        return <Text style={styles.empty}>{t('No metric form for this exercise')}</Text>;
    }
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
