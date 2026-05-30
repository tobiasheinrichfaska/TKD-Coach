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
import { generateId } from '../../utils/ids';

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

export default function AssessmentScreen({ navigation }: any) {
  const { state, dispatch } = useData();
  const [step, setStep] = useState<'group' | 'athlete' | 'game' | 'metric'>('group');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [metric, setMetric] = useState<Partial<AssessmentMetric>>({});
  const [notes, setNotes] = useState('');

  const selectedGroup = state.groups.find(g => g.id === selectedGroupId);
  const athletesInGroup = state.athletes.filter(a => selectedGroup?.athleteIds.includes(a.id));
  const selectedAthlete = state.athletes.find(a => a.id === selectedAthleteId);
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
          <Text style={styles.section}>Select Group</Text>
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
            <Text style={styles.empty}>No groups yet</Text>
          )}
        </View>
      </ScrollView>
    );
  }

  if (step === 'athlete') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.section}>Select Athlete</Text>
          <TouchableOpacity onPress={() => setStep('group')} style={{ marginBottom: 12 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '500' }}>← Back to Groups</Text>
          </TouchableOpacity>
          {athletesInGroup.length > 0 ? (
            <View style={styles.picker}>
              <FlatList
                scrollEnabled={false}
                data={athletesInGroup}
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
            <Text style={styles.empty}>No athletes in this group</Text>
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
          <Text style={styles.section}>Select Game</Text>
          <TouchableOpacity onPress={() => setStep('athlete')} style={{ marginBottom: 12 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '500' }}>← Back to Athletes</Text>
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
            <Text style={styles.empty}>No trackable games</Text>
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
              placeholder="Dominant leg (seconds)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              onChangeText={text =>
                setMetric({ ...metric, type: 'balance_hold', dominant: parseFloat(text) || 0, nonDominant: (metric as any).nonDominant || 0 })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Non-dominant leg (seconds)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              onChangeText={text =>
                setMetric({ ...metric, type: 'balance_hold', nonDominant: parseFloat(text) || 0, dominant: (metric as any).dominant || 0 })
              }
            />
          </>
        );
      case 'reaction_errors':
        return (
          <TextInput
            style={styles.input}
            placeholder="Errors per 10 cues"
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
              placeholder="Correct combos"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              onChangeText={text => setMetric({ ...metric, correct: parseInt(text) || 0 })}
            />
            <TextInput
              style={styles.input}
              placeholder="Total attempts"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              onChangeText={text => setMetric({ type: 'combo_accuracy', correct: (metric as any).correct || 0, total: parseInt(text) || 0 })}
            />
          </>
        );
      default:
        return <Text style={styles.empty}>No metric form for this game</Text>;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.section}>{selectedGame?.name || 'Log Metric'}</Text>
        <TouchableOpacity onPress={() => setStep('game')} style={{ marginBottom: 12 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '500' }}>← Back to Games</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Metric Value</Text>
        {renderMetricForm()}

        <Text style={styles.section}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Any observations..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={styles.button} onPress={handleSaveMetric}>
          <Text style={styles.buttonText}>Save Assessment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
