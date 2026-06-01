import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { generateId } from '../../utils/ids';
import { metricTypes } from '../../domain';
import type {
  BodyPart, BodyRegion, Technique, TechniqueCategory, SessionTemplate, GameDefinition, MetricTypeDef, MetricFieldDef, SessionPhase,
} from '../../types';
import type { OtherDataStackScreenProps } from '../../types/navigation';

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.background },
  pad: { padding: 16 },
  label: { fontSize: 13, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 14, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipTxt: { color: COLORS.text, fontSize: 13 },
  chipTxtOn: { color: COLORS.surface, fontWeight: '600' },
  save: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  del: { backgroundColor: COLORS.danger, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnTxt: { color: COLORS.surface, fontWeight: 'bold' },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  fieldCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, marginBottom: 8 },
});

function Field({ label, value, onChange, placeholder, keyboardType }: { label: string; value: string; onChange: (t: string) => void; placeholder?: string; keyboardType?: 'default' | 'number-pad' }) {
  return (
    <>
      <Text style={s.label}>{label}</Text>
      <TextInput style={s.input} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={COLORS.textMuted} keyboardType={keyboardType} />
    </>
  );
}

function Chips<T extends string | number>({ label, options, selected, onToggle, labelOf }: { label: string; options: readonly T[]; selected: T[]; onToggle: (v: T) => void; labelOf?: (v: T) => string }) {
  return (
    <>
      <Text style={s.label}>{label}</Text>
      <View style={s.chips}>
        {options.map(o => {
          const on = selected.includes(o);
          return (
            <TouchableOpacity key={String(o)} style={[s.chip, on && s.chipOn]} onPress={() => onToggle(o)}>
              <Text style={on ? s.chipTxtOn : s.chipTxt}>{labelOf ? labelOf(o) : String(o)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const toggle = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

const REGIONS: BodyRegion[] = ['lower-leg', 'upper-leg', 'hips', 'core', 'spine', 'shoulders', 'arms', 'neck', 'full-body', 'neuro'];
const KINDS: BodyPart['kind'][] = ['joint', 'muscle', 'region', 'neuro'];
const CATEGORIES: TechniqueCategory[] = ['kick', 'block', 'stance', 'strike', 'poomsae', 'footwork'];
const PHASES: SessionPhase[] = [1, 2, 3, 4, 5];

// ===== Body part =====
export function EditBodyPartScreen({ route, navigation }: OtherDataStackScreenProps<'EditBodyPart'>) {
  const { state, dispatch } = useData();
  const existing = route.params?.id ? state.bodyParts.find(b => b.id === route.params!.id) : null;
  const [id] = useState(existing?.id ?? generateId());
  const [name, setName] = useState(existing?.name ?? '');
  const [region, setRegion] = useState<BodyRegion>(existing?.region ?? 'core');
  const [kind, setKind] = useState<BodyPart['kind']>(existing?.kind ?? 'muscle');

  const save = () => {
    if (!name.trim()) return;
    const payload: BodyPart = { id, name: name.trim(), region, kind };
    dispatch({ type: existing ? 'UPDATE_BODY_PART' : 'ADD_BODY_PART', payload });
    navigation.goBack();
  };
  return (
    <ScrollView style={s.c} contentContainerStyle={s.pad}>
      <Field label="Name" value={name} onChange={setName} />
      <Chips label="Region" options={REGIONS} selected={[region]} onToggle={setRegion} />
      <Chips label="Kind" options={KINDS} selected={[kind]} onToggle={setKind} />
      <TouchableOpacity style={s.save} onPress={save}><Text style={s.btnTxt}>Speichern</Text></TouchableOpacity>
      {existing && <DeleteButton onPress={() => { dispatch({ type: 'DELETE_BODY_PART', payload: { id } }); navigation.goBack(); }} name={existing.name} />}
    </ScrollView>
  );
}

// ===== Technique =====
export function EditTechniqueScreen({ route, navigation }: OtherDataStackScreenProps<'EditTechnique'>) {
  const { state, dispatch } = useData();
  const existing = route.params?.id ? state.techniques.find(t => t.id === route.params!.id) : null;
  const [id] = useState(existing?.id ?? generateId());
  const [name, setName] = useState(existing?.name ?? '');
  const [korean, setKorean] = useState(existing?.koreanName ?? '');
  const [category, setCategory] = useState<TechniqueCategory>(existing?.category ?? 'kick');
  const [bodyPartIds, setBodyPartIds] = useState<string[]>(existing?.bodyPartIds ?? []);

  const save = () => {
    if (!name.trim()) return;
    const payload: Technique = { id, name: name.trim(), koreanName: korean.trim() || undefined, category, bodyPartIds };
    dispatch({ type: existing ? 'UPDATE_TECHNIQUE' : 'ADD_TECHNIQUE', payload });
    navigation.goBack();
  };
  return (
    <ScrollView style={s.c} contentContainerStyle={s.pad}>
      <Field label="Name" value={name} onChange={setName} />
      <Field label="Korean (한글)" value={korean} onChange={setKorean} placeholder="optional" />
      <Chips label="Category" options={CATEGORIES} selected={[category]} onToggle={setCategory} />
      <Chips label="Body parts / neuro" options={state.bodyParts.map(b => b.id)} selected={bodyPartIds}
        onToggle={v => setBodyPartIds(p => toggle(p, v))} labelOf={bid => state.bodyParts.find(b => b.id === bid)?.name ?? bid} />
      <TouchableOpacity style={s.save} onPress={save}><Text style={s.btnTxt}>Speichern</Text></TouchableOpacity>
      {existing && <DeleteButton onPress={() => { dispatch({ type: 'DELETE_TECHNIQUE', payload: { id } }); navigation.goBack(); }} name={existing.name} />}
    </ScrollView>
  );
}

// ===== Session template =====
export function EditTemplateScreen({ route, navigation }: OtherDataStackScreenProps<'EditTemplate'>) {
  const { state, dispatch } = useData();
  const existing = route.params?.id ? state.sessionTemplates.find(t => t.id === route.params!.id) : null;
  const [id] = useState(existing?.id ?? generateId());
  const [name, setName] = useState(existing?.name ?? '');
  const [ageGroup, setAgeGroup] = useState<SessionTemplate['ageGroup']>(existing?.ageGroup ?? 'all');
  const [itemIds, setItemIds] = useState<string[]>(existing?.itemIds ?? []);

  const save = () => {
    if (!name.trim()) return;
    const payload: SessionTemplate = { id, name: name.trim(), ageGroup, itemIds, isBuiltIn: existing?.isBuiltIn ?? false, description: existing?.description };
    dispatch({ type: existing ? 'UPDATE_SESSION_TEMPLATE' : 'ADD_SESSION_TEMPLATE', payload });
    navigation.goBack();
  };
  return (
    <ScrollView style={s.c} contentContainerStyle={s.pad}>
      <Field label="Name" value={name} onChange={setName} />
      <Chips label="Age group" options={['kids', 'youth-adults', 'all'] as const} selected={[ageGroup]} onToggle={setAgeGroup} />
      <Chips label="Übungen (tap to add/remove, order = tap order)" options={state.games.map(g => g.id)} selected={itemIds}
        onToggle={v => setItemIds(p => toggle(p, v))} labelOf={gid => state.games.find(g => g.id === gid)?.shortName ?? gid} />
      <Text style={s.hint}>{itemIds.length} Übungen</Text>
      <TouchableOpacity style={s.save} onPress={save}><Text style={s.btnTxt}>Speichern</Text></TouchableOpacity>
      {existing && <DeleteButton onPress={() => { dispatch({ type: 'DELETE_SESSION_TEMPLATE', payload: { id } }); navigation.goBack(); }} name={existing.name} />}
    </ScrollView>
  );
}

// ===== Game (Übung) =====
export function EditGameScreen({ route, navigation }: OtherDataStackScreenProps<'EditGame'>) {
  const { state, dispatch } = useData();
  const existing = route.params?.id ? state.games.find(g => g.id === route.params!.id) : null;
  const [id] = useState(existing?.id ?? generateId());
  const [name, setName] = useState(existing?.name ?? '');
  const [shortName, setShortName] = useState(existing?.shortName ?? '');
  const [minutes, setMinutes] = useState(String(existing?.defaultMinutes ?? 5));
  const [ageGroup, setAgeGroup] = useState<GameDefinition['ageGroup']>(existing?.ageGroup ?? 'all');
  const [phases, setPhases] = useState<SessionPhase[]>(existing?.sessionPhases ?? [3]);
  const [techniques, setTechniques] = useState<string[]>(existing?.techniques ?? []);
  const [bodyParts, setBodyParts] = useState<string[]>(existing?.bodyParts ?? []);
  const [metric, setMetric] = useState<string>(existing?.logMetricType ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');

  const save = () => {
    if (!name.trim() || phases.length === 0) { Alert.alert('Pflichtfelder', 'Name und mindestens eine Phase erforderlich.'); return; }
    const payload: GameDefinition = {
      id, name: name.trim(), shortName: shortName.trim() || name.trim().slice(0, 8),
      sessionPhases: phases, defaultMinutes: Number(minutes) || 0, ageGroup,
      logMetricType: metric ? (metric as GameDefinition['logMetricType']) : undefined,
      techniques, bodyParts, isBuiltIn: existing?.isBuiltIn ?? false, description: description.trim() || undefined,
    };
    dispatch({ type: existing ? 'UPDATE_GAME' : 'ADD_GAME', payload });
    navigation.goBack();
  };
  return (
    <ScrollView style={s.c} contentContainerStyle={s.pad}>
      <Field label="Name" value={name} onChange={setName} />
      <Field label="Short name" value={shortName} onChange={setShortName} placeholder="abbr." />
      <Field label="Minutes" value={minutes} onChange={setMinutes} keyboardType="number-pad" />
      <Chips label="Phases (1–5)" options={PHASES} selected={phases} onToggle={v => setPhases(p => toggle(p, v))} />
      <Chips label="Age group" options={['all', 'youth-adults'] as const} selected={[ageGroup]} onToggle={setAgeGroup} />
      <Chips label="Log metric (optional)" options={['', ...metricTypes(state.metricSchemas)]} selected={[metric]}
        onToggle={v => setMetric(m => (m === v ? '' : v))} labelOf={t => (t === '' ? '— none —' : state.metricSchemas.find(x => x.type === t)?.label ?? t)} />
      <Chips label="Techniques" options={state.techniques.map(t => t.id)} selected={techniques}
        onToggle={v => setTechniques(p => toggle(p, v))} labelOf={tid => state.techniques.find(t => t.id === tid)?.name ?? tid} />
      <Chips label="Body parts / neuro" options={state.bodyParts.map(b => b.id)} selected={bodyParts}
        onToggle={v => setBodyParts(p => toggle(p, v))} labelOf={bid => state.bodyParts.find(b => b.id === bid)?.name ?? bid} />
      <Text style={s.label}>Description</Text>
      <TextInput style={[s.input, { minHeight: 70 }]} value={description} onChangeText={setDescription} multiline placeholderTextColor={COLORS.textMuted} />
      <TouchableOpacity style={s.save} onPress={save}><Text style={s.btnTxt}>Speichern</Text></TouchableOpacity>
      {existing && <DeleteButton onPress={() => { dispatch({ type: 'DELETE_GAME', payload: { id } }); navigation.goBack(); }} name={existing.name} />}
    </ScrollView>
  );
}

// ===== Metric schema =====
export function EditMetricSchemaScreen({ route, navigation }: OtherDataStackScreenProps<'EditMetricSchema'>) {
  const { state, dispatch } = useData();
  const existing = route.params?.type ? state.metricSchemas.find(m => m.type === route.params!.type) : null;
  const [type, setType] = useState(existing?.type ?? '');
  const [label, setLabel] = useState(existing?.label ?? '');
  const [fields, setFields] = useState<MetricFieldDef[]>(existing?.fields ?? [{ key: 'value', label: 'Wert' }]);
  const [primaryField, setPrimaryField] = useState(existing?.primaryField ?? 'value');

  const setField = (i: number, patch: Partial<MetricFieldDef>) => setFields(f => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const save = () => {
    if (!type.trim() || !label.trim() || fields.length === 0) { Alert.alert('Pflichtfelder', 'Typ, Label und ein Feld erforderlich.'); return; }
    const payload: MetricTypeDef = { type: type.trim(), label: label.trim(), primaryField, fields };
    dispatch({ type: existing ? 'UPDATE_METRIC_SCHEMA' : 'ADD_METRIC_SCHEMA', payload });
    navigation.goBack();
  };
  return (
    <ScrollView style={s.c} contentContainerStyle={s.pad}>
      <Field label="Type (id)" value={type} onChange={setType} placeholder="e.g. balance_hold" />
      <Field label="Label" value={label} onChange={setLabel} />
      <Text style={s.label}>Fields</Text>
      {fields.map((f, i) => (
        <View key={i} style={s.fieldCard}>
          <Field label="Key" value={f.key} onChange={t => setField(i, { key: t })} />
          <Field label="Field label" value={f.label} onChange={t => setField(i, { label: t })} />
          <Field label="Unit (optional)" value={f.unit ?? ''} onChange={t => setField(i, { unit: t || undefined })} />
          <View style={s.chips}>
            <TouchableOpacity style={[s.chip, f.integer && s.chipOn]} onPress={() => setField(i, { integer: !f.integer })}><Text style={f.integer ? s.chipTxtOn : s.chipTxt}>integer</Text></TouchableOpacity>
            <TouchableOpacity style={[s.chip, f.lowerIsBetter && s.chipOn]} onPress={() => setField(i, { lowerIsBetter: !f.lowerIsBetter })}><Text style={f.lowerIsBetter ? s.chipTxtOn : s.chipTxt}>lower is better</Text></TouchableOpacity>
            {fields.length > 1 && <TouchableOpacity style={s.chip} onPress={() => setFields(arr => arr.filter((_, idx) => idx !== i))}><Text style={[s.chipTxt, { color: COLORS.danger }]}>remove</Text></TouchableOpacity>}
          </View>
        </View>
      ))}
      <TouchableOpacity onPress={() => setFields(f => [...f, { key: `f${f.length + 1}`, label: '' }])}><Text style={[s.hint, { color: COLORS.info }]}>+ add field</Text></TouchableOpacity>
      <Chips label="Primary field (headline delta)" options={fields.map(f => f.key)} selected={[primaryField]} onToggle={setPrimaryField} />
      <TouchableOpacity style={s.save} onPress={save}><Text style={s.btnTxt}>Speichern</Text></TouchableOpacity>
      {existing && <DeleteButton onPress={() => { dispatch({ type: 'DELETE_METRIC_SCHEMA', payload: { type: existing.type } }); navigation.goBack(); }} name={existing.label} />}
    </ScrollView>
  );
}

function DeleteButton({ onPress, name }: { onPress: () => void; name: string }) {
  return (
    <TouchableOpacity
      style={s.del}
      onPress={() => Alert.alert('Löschen?', `"${name}" löschen?`, [{ text: 'Abbrechen', style: 'cancel' }, { text: 'Löschen', style: 'destructive', onPress }])}
    >
      <Text style={s.btnTxt}>Löschen</Text>
    </TouchableOpacity>
  );
}
