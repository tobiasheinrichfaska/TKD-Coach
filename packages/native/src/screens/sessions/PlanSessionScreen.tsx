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
import { useT } from '../../i18n';
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
  phaseHeading: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
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
  phaseEmpty: { fontSize: 12, color: COLORS.textLight, fontStyle: 'italic', paddingVertical: 4, paddingHorizontal: 2 },
  addPhase: { borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginBottom: 4 },
  addPhaseText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  addToggle: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  addToggleText: { color: COLORS.primary, fontWeight: 'bold' },
  addItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
});

export default function PlanSessionScreen({ route, navigation }: SessionsStackScreenProps<'PlanSession'>) {
  const { state, dispatch } = useData();
  const { t } = useT();
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
  // Per-game phase placement override (id → phase). Empty entries fall back to primaryPhase.
  const [phases, setPhases] = useState<Record<string, SessionPhase>>(plan?.gamePhases || {});
  const [openGroup, setOpenGroup] = useState<string | null>('Full session');
  // Which add-list is open: a phase number (per-phase add) or 'all' (central add).
  const [openAdd, setOpenAdd] = useState<SessionPhase | 'all' | null>(null);
  const [query, setQuery] = useState('');

  const phaseOf = (gid: string): SessionPhase => phases[gid] ?? primaryPhase(state.games.find(g => g.id === gid));

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
    setPhases({}); // template items use their natural (lowest) phase
    setTemplate(t);
  };
  const setGames = (next: string[]) => {
    setGameIds(next);
    setTemplate('custom');
  };
  const removeGame = (gid: string) => {
    setGames(gameIds.filter(x => x !== gid));
    setPhases(p => {
      const n = { ...p };
      delete n[gid];
      return n;
    });
  };
  // Reorder within a phase only (▲▼ swap with the same-phase neighbour).
  const move = (gid: string, dir: -1 | 1) => {
    const phase = phaseOf(gid);
    const inPhase = gameIds.filter(g => phaseOf(g) === phase);
    const pos = inPhase.indexOf(gid);
    const npos = pos + dir;
    if (npos < 0 || npos >= inPhase.length) return;
    const other = inPhase[npos];
    const next = [...gameIds];
    const i = next.indexOf(gid);
    const j = next.indexOf(other);
    [next[i], next[j]] = [next[j], next[i]];
    setGames(next);
  };
  // Add an Übung into a specific phase (placement = that phase, even if multi-phase).
  // The add list stays open so several exercises can be added in a row; the just-added
  // one drops out of the list automatically (it filters on !gameIds.includes).
  const addToPhase = (gid: string, phase: SessionPhase) => {
    if (gameIds.includes(gid)) return;
    setGames([...gameIds, gid]);
    setPhases(p => ({ ...p, [gid]: phase }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('Name required'), t('Enter a session name.'));
      return;
    }
    if (!groupId) {
      Alert.alert(
        t('Group required'),
        state.groups.length === 0
          ? t('You have no groups yet. Create one in the Humans tab first, then plan a session for it.')
          : t('Tap a group above to select it.')
      );
      return;
    }
    if (gameIds.length === 0) {
      Alert.alert(t('No exercises'), t('This plan has no exercises. Pick a template or add some.'));
      return;
    }
    // Persist in phase order so the run follows the phases; record placement for all games.
    const ordered = [...gameIds].sort((a, b) => phaseOf(a) - phaseOf(b));
    const gamePhases = Object.fromEntries(gameIds.map(g => [g, phaseOf(g)])) as Record<string, SessionPhase>;
    const payload = { name, groupId, plannedDate: date, template, plannedGames: ordered, gamePhases };
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

  // Add-list for a given phase ('all' = every phase, grouped). Reused by per-phase + central add.
  const renderAddList = (scope: SessionPhase | 'all') => (
    <View style={{ marginBottom: 8 }}>
      <TextInput
        style={styles.input}
        placeholder={t('Filter — e.g. ap-chagi, knee, balance')}
        placeholderTextColor={COLORS.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />
      <View style={styles.picker}>
        {(scope === 'all' ? PHASES : [scope]).map(phase => {
          const available = state.games.filter(g => gameInPhase(g, phase) && !gameIds.includes(g.id) && matches(g.id));
          if (available.length === 0) return null;
          return (
            <View key={phase}>
              {scope === 'all' && <Text style={[styles.phaseHeading, { paddingHorizontal: 10 }]}>{SESSION_PHASE_LABELS[phase]}</Text>}
              {available.map(g => (
                <TouchableOpacity key={g.id} style={styles.addItem} onPress={() => addToPhase(g.id, phase)}>
                  <Text style={styles.gameTitle}>{g.name} <Text style={styles.gameMeta}>· {g.defaultMinutes}min</Text></Text>
                  {!!tagLine(g.id) && <Text style={styles.tags}>{tagLine(g.id)}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        {(scope === 'all' ? PHASES : [scope]).every(
          phase => state.games.filter(g => gameInPhase(g, phase) && !gameIds.includes(g.id) && matches(g.id)).length === 0
        ) && <Text style={[styles.pickerItem, styles.pickerItemText, { color: COLORS.textMuted }]}>{t('No matching exercises.')}</Text>}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.section}>{t('Session name')}</Text>
        <TextInput style={styles.input} placeholder={t('e.g. Tuesday training')} placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />

        <Text style={styles.section}>{t('Group')}</Text>
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
            ListEmptyComponent={<Text style={[styles.pickerItem, styles.pickerItemText, { color: COLORS.textMuted }]}>{t('No groups yet — create one in the Humans tab first.')}</Text>}
          />
        </View>

        <Text style={styles.section}>{t('Date')}</Text>
        <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted} value={date} onChangeText={setDate} />
        {selectedGroup && (
          <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: -6, marginBottom: 8 }}>
            {targetSlot
              ? `${t('Training')}: ${formatSlot(targetSlot)}  ·  ${t('planned')} ${totalMinutes}/${targetSlot.durationMin} min`
              : `${selectedGroup.name} ${t('does not train on this day.')}`}
          </Text>
        )}

        <Text style={styles.section}>{t('Template')}</Text>
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

        <Text style={styles.section}>{t('Exercises')} ({gameIds.length} · {totalMinutes} min)</Text>
        {/* All phases always shown, even when empty, each with its own add button. */}
        {PHASES.map(phase => {
          const inPhase = gameIds.filter(g => phaseOf(g) === phase);
          const band = phaseBand(phase);
          const border = band === 'warmup' ? COLORS.warmup : band === 'cooldown' ? COLORS.cooldown : COLORS.main;
          return (
            <View key={phase}>
              <Text style={styles.phaseHeading}>{SESSION_PHASE_LABELS[phase]}</Text>
              {inPhase.map(gid => {
                const g = state.games.find(x => x.id === gid);
                const pos = inPhase.indexOf(gid);
                const last = pos === inPhase.length - 1;
                const tags = tagLine(gid);
                return (
                  <View key={gid} style={[styles.gameRow, { borderLeftColor: border }]}>
                    <View style={styles.gameRowInfo}>
                      <Text style={styles.gameTitle}>{g?.name || gid}</Text>
                      <Text style={styles.gameMeta}>{g?.defaultMinutes} min</Text>
                      {!!tags && <Text style={styles.tags}>{tags}</Text>}
                    </View>
                    <TouchableOpacity style={styles.ctrl} onPress={() => move(gid, -1)} disabled={pos === 0}>
                      <Text style={[styles.ctrlText, pos === 0 && { opacity: 0.25 }]}>▲</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ctrl} onPress={() => move(gid, 1)} disabled={last}>
                      <Text style={[styles.ctrlText, last && { opacity: 0.25 }]}>▼</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ctrl} onPress={() => removeGame(gid)}>
                      <Text style={styles.removeText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              {inPhase.length === 0 && <Text style={styles.phaseEmpty}>{t('— no exercise —')}</Text>}
              <TouchableOpacity style={styles.addPhase} onPress={() => { setOpenAdd(a => (a === phase ? null : phase)); setQuery(''); }}>
                <Text style={styles.addPhaseText}>{openAdd === phase ? t('Close') : t('+ Exercise in this phase')}</Text>
              </TouchableOpacity>
              {openAdd === phase && renderAddList(phase)}
            </View>
          );
        })}

        {/* Central add — choose from every phase at once. */}
        <TouchableOpacity style={styles.addToggle} onPress={() => { setOpenAdd(a => (a === 'all' ? null : 'all')); setQuery(''); }}>
          <Text style={styles.addToggleText}>{openAdd === 'all' ? t('Close') : t('+ Exercise (all phases)')}</Text>
        </TouchableOpacity>
        {openAdd === 'all' && renderAddList('all')}

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>{planId ? t('Update session plan') : t('Create session plan')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
