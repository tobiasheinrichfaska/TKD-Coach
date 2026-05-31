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
import { SESSION_TEMPLATES } from '../../constants/games';
import { generateId } from '../../utils/ids';
import type { SessionsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: COLORS.text },
  input: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  picker: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pickerItemText: { fontSize: 14, color: COLORS.text },
  gameCard: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  gameTitle: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  gameMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  templateButtons: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  templateButton: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  templateButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  templateButtonText: { fontSize: 12, color: COLORS.text },
  templateButtonTextActive: { color: COLORS.surface, fontWeight: 'bold' },
});

export default function PlanSessionScreen({ route, navigation }: SessionsStackScreenProps<'PlanSession'>) {
  const { state, dispatch } = useData();
  const planId = route.params?.planId;
  const plan = planId ? state.sessionPlans.find(p => p.id === planId) : null;

  const [name, setName] = useState(plan?.name || '');
  const [groupId, setGroupId] = useState(plan?.groupId || '');
  const [date, setDate] = useState(plan?.plannedDate || new Date().toISOString().split('T')[0]);
  const [template, setTemplate] = useState<'kids-2h' | 'youth-adult-1h30' | 'custom'>(plan?.template || 'kids-2h');
  const [gameIds, setGameIds] = useState<string[]>(plan?.plannedGames || [...SESSION_TEMPLATES.KIDS_2H]);

  const handleTemplateChange = (newTemplate: typeof template) => {
    setTemplate(newTemplate);
    if (newTemplate === 'kids-2h') {
      setGameIds([...SESSION_TEMPLATES.KIDS_2H]);
    } else if (newTemplate === 'youth-adult-1h30') {
      setGameIds([...SESSION_TEMPLATES.YOUTH_ADULT_1H30]);
    }
  };

  const handleSave = () => {
    // Visible validation instead of a silent no-op.
    if (!name.trim()) {
      Alert.alert('Name required', 'Enter a session name.');
      return;
    }
    if (!groupId) {
      Alert.alert(
        'Group required',
        state.groups.length === 0
          ? 'You have no groups yet. Create one in the Groups tab first, then plan a session for it.'
          : 'Tap a group above to select it.'
      );
      return;
    }
    if (gameIds.length === 0) {
      Alert.alert('No games', 'This plan has no games. Pick a template (or add games in Custom).');
      return;
    }

    if (planId && plan) {
      dispatch({
        type: 'UPDATE_SESSION_PLAN',
        payload: {
          ...plan,
          name,
          groupId,
          plannedDate: date,
          template,
          plannedGames: gameIds,
        },
      });
    } else {
      dispatch({
        type: 'ADD_SESSION_PLAN',
        payload: {
          id: generateId(),
          name,
          groupId,
          plannedDate: date,
          template,
          plannedGames: gameIds,
          createdAt: new Date().toISOString(),
        },
      });
    }

    navigation.goBack();
  };

  const getTotalMinutes = () =>
    gameIds.reduce((sum, gid) => {
      const game = state.games.find(g => g.id === gid);
      return sum + (game?.defaultMinutes || 0);
    }, 0);

  const gameDetails = gameIds.map(gid => state.games.find(g => g.id === gid)).filter(Boolean);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.section}>Session Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Tuesday Evening Training"
          placeholderTextColor={COLORS.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.section}>Group</Text>
        <View style={styles.picker}>
          <FlatList
            scrollEnabled={false}
            data={state.groups}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, groupId === item.id && { backgroundColor: COLORS.primary }]}
                onPress={() => setGroupId(item.id)}
              >
                <Text style={[styles.pickerItemText, groupId === item.id && { color: COLORS.surface }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={[styles.pickerItem, styles.pickerItemText, { color: COLORS.textMuted }]}>
                No groups yet — create one in the Groups tab first.
              </Text>
            }
          />
        </View>

        <Text style={styles.section}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textMuted}
          value={date}
          onChangeText={setDate}
        />

        <Text style={styles.section}>Template</Text>
        <View style={styles.templateButtons}>
          <TouchableOpacity
            style={[styles.templateButton, template === 'kids-2h' && styles.templateButtonActive]}
            onPress={() => handleTemplateChange('kids-2h')}
          >
            <Text style={[styles.templateButtonText, template === 'kids-2h' && styles.templateButtonTextActive]}>
              Kids 2h
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.templateButton, template === 'youth-adult-1h30' && styles.templateButtonActive]}
            onPress={() => handleTemplateChange('youth-adult-1h30')}
          >
            <Text style={[styles.templateButtonText, template === 'youth-adult-1h30' && styles.templateButtonTextActive]}>
              Youth/Adult 1.5h
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.templateButton, template === 'custom' && styles.templateButtonActive]}
            onPress={() => handleTemplateChange('custom')}
          >
            <Text style={[styles.templateButtonText, template === 'custom' && styles.templateButtonTextActive]}>
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>Games ({getTotalMinutes()} min)</Text>
        <FlatList
          scrollEnabled={false}
          data={gameDetails}
          keyExtractor={item => item?.id || ''}
          renderItem={({ item }) => (
            <View
              style={[
                styles.gameCard,
                {
                  borderLeftColor:
                    item?.phase === 'warmup' ? COLORS.warmup : item?.phase === 'cooldown' ? COLORS.cooldown : COLORS.main,
                },
              ]}
            >
              <Text style={styles.gameTitle}>{item?.name}</Text>
              <Text style={styles.gameMeta}>{item?.defaultMinutes} min</Text>
            </View>
          )}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>{planId ? 'Update' : 'Create'} Session Plan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
