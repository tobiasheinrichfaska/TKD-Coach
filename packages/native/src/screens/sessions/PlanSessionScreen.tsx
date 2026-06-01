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
import { nextSession, slotsOnDay, formatSlot, primaryPhase, gameInPhase, phaseBand } from '../../domain';
import { SESSION_PHASE_LABELS, SessionPhase } from '../../types';
import type { Group } from '../../types';
import type { SessionsStackScreenProps } from '../../types/navigation';

type TemplateId = 'kids-2h' | 'youth-adult-1h30' | 'custom';
const PHASES: SessionPhase[] = [1, 2, 3, 4, 5];

// Chip-grouped template library (dive into a group → pick a template).
const TEMPLATE_GROUPS: { label: string; items: { name: string; t: TemplateId; ids: readonly string[] }[] }[] = [
  {
    label: 'Full session',
    items: [
      { name: 'Kids 2h', t: 'kids-2h', ids: SESSION_TEMPLATES.KIDS_2H },
      { name: 'Youth/Adult 1.5h', t: 'youth-adult-1h30', ids: SESSION_TEMPLATES.YOUTH_ADULT_1H30 },
    ],
  },
  { label: 'Warm-up', items: [{ name: 'Mobility', t: 'custom', ids: SESSION_TEMPLATES.MOBILITY_WARMUP }] },
  { label: 'Cool-down', items: [{ name: 'Static block', t: 'custom', ids: SESSION_TEMPLATES.STATIC_BLOCK }] },
  { label: 'Empty', items: [{ name: 'Clear', t: 'custom', ids: [] }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: COLORS.text },
  phaseHeading: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  picker: { backgroundColor: COLORS.surface, borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
  pickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pickerItemText: { fontSize: 14, color: COLORS.text },
  gameTitle: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  gameMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  tags: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  // chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.text },
  chipTextActive: { color: COLORS.surface, fontWeight: 'bold' },
  // game rows
  gameRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 6, borderLeftWidth: 3 },
  gameRowInfo: { flex: 1 },
  ctrl: { paddingHorizontal: 8, paddingVertical: 4 },
  ctrlText: { fontSize: 18, color: COLORS.textMuted },
  removeText: { fontSize: 18, color: COLORS.danger },
  addToggle: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  addToggleText: { color: COLORS.primary, fontWeight: 'bold' },
  addItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
});

export default function PlanSessionScreen({ route, navigation }: SessionsStackScreenProps<'PlanSession'>) {
  const { state, dispatch } = useData();
  const planId = route.params?.planId;
  const plan = planId ? state.sessionPlans.find(p => p.id === planId) : null;
  const fromGroupId = route.params?.fromGroupId;
  const fromGameIds = route.params?.fromGameIds;

  const [name, setName] = useState(plan?.name || '');
  const [groupId, setGroupId] = useState(plan?.groupId || fromGroupId || '');
  const [date, setDate] = useState(plan?.plannedDate || toLocalDateISO());
  const [template, setTemplate] = useState<TemplateId>(
    plan?.template || (fromGameIds && fromGameIds.length > 0 ? 'custom' : 'kids-2h')
  );
  const [gameIds, setGameIds] = useState<string[]>(
    plan?.plannedGames || fromGameIds || [...SESSION_TEMPLATES.KIDS_2H]
  );
  const [openGroup, setOpenGroup] = useState<string | null>('Full session');
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');

  const phaseOf = (gid: string): SessionPhase => primaryPhase(state.games.find(g => g.id === gid));

  // Selecting a group prefills the date from its next training slot (new plans only).
  const chooseGroup = (g: Group) => {
    setGroupId(g.id);
    if (!planId) {
      const ns = nextSession(g, new Date());
      if (ns) setDate(toLocalDateISO(ns.date));
    }
  };

  const applyTemplate = (t: TemplateId, ids: readonly string[]) => {
    setGameIds([...ids]);
    setTemplate(t);
  };
  const setGames = (next: string[]) => {
    setGameIds(next);
    setTemplate('custom');
  };
  const removeGame = (idx: number) => setGames(gameIds.filter((_, i) => i !== idx));
  const moveGame = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= gameIds.length) return;
    const next = [...gameIds];
    [next[idx], next[j]] = [next[j], next[idx]];
    setGames(next);
  };
  // Insert a new Übung at the end of its phase section (then freely movable).
  const addGame = (gid: string) => {
    const p = phaseOf(gid);
    let insertAt = gameIds.length;
    for (let i = gameIds.length - 1; i >= 0; i--) {
      if (phaseOf(gameIds[i]) <= p) {
        insertAt = i + 1;
        break;
      }
      if (i === 0) insertAt = 0;
    }
    const next = [...gameIds.slice(0, insertAt), gid, ...gameIds.slice(insertAt)];
    setGames(next);
  };

  const handleSave = () => {
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
      Alert.alert('No Übungen', 'This plan has no Übungen. Pick a template or add some.');
      return;
    }
    const payload = { name, groupId, plannedDate: date, template, plannedGames: gameIds };
    if (planId && plan) {
      dispatch({ type: 'UPDATE_SESSION_PLAN', payload: { ...plan, ...payload } });
    } else {
      dispatch({ type: 'ADD_SESSION_PLAN', payload: { id: generateId(), ...payload, createdAt: new Date().toISOString() } });
    }
    navigation.goBack();
  };

  const totalMinutes = gameIds.reduce((sum, gid) => sum + (state.games.find(g => g.id === gid)?.defaultMinutes || 0), 0);
  const selectedGroup = state.groups.find(g => g.id === groupId);
  const targetSlot = selectedGroup ? slotsOnDay(selectedGroup, new Date(`${date}T12:00:00`))[0] : undefined;
  const tagLine = (gid: string): string => {
    const g = state.games.find(x => x.id === gid);
    const parts: string[] = [];
    if (g?.bodyParts?.length) parts.push(`🦵 ${g.bodyParts.join(', ')}`);
    if (g?.techniques?.length) parts.push(`🥋 ${g.techniques.join(', ')}`);
    return parts.join('  ');
  };

  const q = query.trim().toLowerCase();
  const matches = (gid: string): boolean => {
    if (!q) return true;
    const g = state.games.find(x => x.id === gid);
    if (!g) return false;
    return [g.name, g.shortName, ...(g.techniques || []), ...(g.bodyParts || [])]
      .join(' ')
      .toLowerCase()
      .includes(q);
  };

  // Render the selected list with a heading whenever the phase changes.
  let lastPhase: SessionPhase | null = null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.section}>Session Name</Text>
        <TextInput style={styles.input} placeholder="e.g., Tuesday Evening Training" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />

        <Text style={styles.section}>Group</Text>
        <View style={styles.picker}>
          <FlatList
            scrollEnabled={false}
            data={state.groups}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.pickerItem, groupId === item.id && { backgroundColor: COLORS.primary }]} onPress={() => chooseGroup(item)}>
                <Text style={[styles.pickerItemText, groupId === item.id && { color: COLORS.surface }]}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={[styles.pickerItem, styles.pickerItemText, { color: COLORS.textMuted }]}>No groups yet — create one in the Groups tab first.</Text>}
          />
        </View>

        <Text style={styles.section}>Date</Text>
        <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted} value={date} onChangeText={setDate} />
        {selectedGroup && (
          <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: -6, marginBottom: 8 }}>
            {targetSlot
              ? `Training: ${formatSlot(targetSlot)}  ·  geplant ${totalMinutes}/${targetSlot.durationMin} min`
              : `${selectedGroup.name} trainiert an diesem Tag nicht.`}
          </Text>
        )}

        <Text style={styles.section}>Template</Text>
        <View style={styles.chipRow}>
          {TEMPLATE_GROUPS.map(grp => {
            // Single-item groups (Empty/Warm-up/Cool-down) apply in one tap; multi-item groups open.
            const single = grp.items.length === 1 ? grp.items[0] : null;
            const onPress = single
              ? () => applyTemplate(single.t, single.ids)
              : () => setOpenGroup(g => (g === grp.label ? null : grp.label));
            return (
              <TouchableOpacity key={grp.label} style={[styles.chip, openGroup === grp.label && styles.chipActive]} onPress={onPress}>
                <Text style={[styles.chipText, openGroup === grp.label && styles.chipTextActive]}>{grp.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {openGroup && (
          <View style={styles.chipRow}>
            {TEMPLATE_GROUPS.find(g => g.label === openGroup)!.items.map(it => {
              const active = it.t === template && it.t !== 'custom';
              return (
                <TouchableOpacity key={it.name} style={[styles.chip, active && styles.chipActive]} onPress={() => applyTemplate(it.t, it.ids)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{it.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.section}>Übungen ({gameIds.length} · {totalMinutes} min) · {template}</Text>
        {gameIds.map((gid, idx) => {
          const g = state.games.find(x => x.id === gid);
          const p = phaseOf(gid);
          const heading = p !== lastPhase ? SESSION_PHASE_LABELS[p] : null;
          lastPhase = p;
          const band = phaseBand(p);
          const border = band === 'warmup' ? COLORS.warmup : band === 'cooldown' ? COLORS.cooldown : COLORS.main;
          const last = idx === gameIds.length - 1;
          const tags = tagLine(gid);
          return (
            <View key={`${gid}-${idx}`}>
              {heading && <Text style={styles.phaseHeading}>{heading}</Text>}
              <View style={[styles.gameRow, { borderLeftColor: border }]}>
                <View style={styles.gameRowInfo}>
                  <Text style={styles.gameTitle}>{g?.name || gid}</Text>
                  <Text style={styles.gameMeta}>{g?.defaultMinutes} min</Text>
                  {!!tags && <Text style={styles.tags}>{tags}</Text>}
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
            </View>
          );
        })}
        {gameIds.length === 0 && <Text style={styles.gameMeta}>No Übungen yet — add some below.</Text>}

        <TouchableOpacity style={styles.addToggle} onPress={() => setShowAdd(s => !s)}>
          <Text style={styles.addToggleText}>{showAdd ? 'Close' : '+ Add Übung'}</Text>
        </TouchableOpacity>
        {showAdd && (
          <View style={{ marginTop: 6 }}>
            <TextInput
              style={styles.input}
              placeholder="Filter — e.g. ap-chagi, knee, balance"
              placeholderTextColor={COLORS.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
            />
            <View style={styles.picker}>
              {PHASES.map(phase => {
                const available = state.games.filter(g => gameInPhase(g, phase) && !gameIds.includes(g.id) && matches(g.id));
                if (available.length === 0) return null;
                return (
                  <View key={phase}>
                    <Text style={[styles.phaseHeading, { paddingHorizontal: 10 }]}>{SESSION_PHASE_LABELS[phase]}</Text>
                    {available.map(g => (
                      <TouchableOpacity key={g.id} style={styles.addItem} onPress={() => addGame(g.id)}>
                        <Text style={styles.gameTitle}>{g.name} <Text style={styles.gameMeta}>· {g.defaultMinutes}min</Text></Text>
                        {!!tagLine(g.id) && <Text style={styles.tags}>{tagLine(g.id)}</Text>}
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>{planId ? 'Update' : 'Create'} Session Plan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
