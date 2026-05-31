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
import { toLocalDateISO } from '../../utils/format';
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
  gameRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 6, borderLeftWidth: 3 },
  gameRowInfo: { flex: 1 },
  ctrl: { paddingHorizontal: 8, paddingVertical: 4 },
  ctrlText: { fontSize: 18, color: COLORS.textMuted },
  removeText: { fontSize: 18, color: COLORS.danger },
  addToggle: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  addToggleText: { color: COLORS.primary, fontWeight: 'bold' },
  addItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  addItemText: { fontSize: 13, color: COLORS.text },
  addItemMeta: { fontSize: 11, color: COLORS.textMuted },
});

export default function PlanSessionScreen({ route, navigation }: SessionsStackScreenProps<'PlanSession'>) {
  const { state, dispatch } = useData();
  const planId = route.params?.planId;
  const plan = planId ? state.sessionPlans.find(p => p.id === planId) : null;
  // Prefill from a completed session ("use as template"), when not editing an existing plan.
  const fromGroupId = route.params?.fromGroupId;
  const fromGameIds = route.params?.fromGameIds;

  const [name, setName] = useState(plan?.name || '');
  const [groupId, setGroupId] = useState(plan?.groupId || fromGroupId || '');
  const [date, setDate] = useState(plan?.plannedDate || toLocalDateISO());
  const [template, setTemplate] = useState<'kids-2h' | 'youth-adult-1h30' | 'custom'>(
    plan?.template || (fromGameIds && fromGameIds.length > 0 ? 'custom' : 'kids-2h')
  );
  const [gameIds, setGameIds] = useState<string[]>(
    plan?.plannedGames || fromGameIds || [...SESSION_TEMPLATES.KIDS_2H]
  );
  const [showAdd, setShowAdd] = useState(false);

  const handleTemplateChange = (newTemplate: typeof template) => {
    setTemplate(newTemplate);
    if (newTemplate === 'kids-2h') {
      setGameIds([...SESSION_TEMPLATES.KIDS_2H]);
    } else if (newTemplate === 'youth-adult-1h30') {
      setGameIds([...SESSION_TEMPLATES.YOUTH_ADULT_1H30]);
    }
  };

  // Editing the game list makes it a custom plan (no longer a named template).
  const setGames = (next: string[]) => {
    setGameIds(next);
    setTemplate('custom');
  };
  const removeGame = (idx: number) => setGames(gameIds.filter((_, i) => i !== idx));
  const addGame = (gid: string) => setGames([...gameIds, gid]);
  const moveGame = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= gameIds.length) return;
    const next = [...gameIds];
    [next[idx], next[j]] = [next[j], next[idx]];
    setGames(next);
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

        <Text style={styles.section}>Übungen ({gameIds.length} · {getTotalMinutes()} min)</Text>
        {gameIds.map((gid, idx) => {
          const g = state.games.find(x => x.id === gid);
          const border = g?.phase === 'warmup' ? COLORS.warmup : g?.phase === 'cooldown' ? COLORS.cooldown : COLORS.main;
          const last = idx === gameIds.length - 1;
          return (
            <View key={`${gid}-${idx}`} style={[styles.gameRow, { borderLeftColor: border }]}>
              <View style={styles.gameRowInfo}>
                <Text style={styles.gameTitle}>{g?.name || gid}</Text>
                <Text style={styles.gameMeta}>{g?.phase} · {g?.defaultMinutes} min</Text>
              </View>
              <TouchableOpacity style={styles.ctrl} onPress={() => moveGame(idx, -1)} disabled={idx === 0}>
                <Text style={[styles.ctrlText, idx === 0 && { opacity: 0.25 }]}>▲</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ctrl} onPress={() => moveGame(idx, 1)} disabled={last}>
                <Text style={[styles.ctrlText, last && { opacity: 0.25 }]}>▼</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ctrl} onPress={() => removeGame(idx)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        {gameIds.length === 0 && <Text style={styles.gameMeta}>No Übungen yet — add some below.</Text>}

        <TouchableOpacity style={styles.addToggle} onPress={() => setShowAdd(s => !s)}>
          <Text style={styles.addToggleText}>{showAdd ? 'Close' : '+ Add Übung'}</Text>
        </TouchableOpacity>
        {showAdd && (
          <View style={[styles.picker, { marginTop: 6 }]}>
            {(['warmup', 'main', 'cooldown'] as const).map(phase =>
              state.games
                .filter(g => g.phase === phase)
                .map(g => (
                  <TouchableOpacity key={g.id} style={styles.addItem} onPress={() => addGame(g.id)}>
                    <Text style={styles.addItemText}>{g.name}</Text>
                    <Text style={styles.addItemMeta}>{phase} · {g.defaultMinutes}min</Text>
                  </TouchableOpacity>
                ))
            )}
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>{planId ? 'Update' : 'Create'} Session Plan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
