import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { useT } from '../../i18n';
import type { TransferSelection } from '../../types';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  content: { padding: 16 },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: COLORS.text },
  checkbox: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: COLORS.surface, marginBottom: 8, borderRadius: 8 },
  checkboxChecked: { backgroundColor: COLORS.primary, opacity: 0.1 },
  box: { width: 24, height: 24, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 4, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  boxChecked: { backgroundColor: COLORS.primary },
  checkmark: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },
  label: { fontSize: 14, color: COLORS.text, flex: 1 },
  count: { fontSize: 12, color: COLORS.textMuted },
  controls: { flexDirection: 'row', gap: 12, padding: 16 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonPrimary: { backgroundColor: COLORS.primary },
  buttonSecondary: { backgroundColor: COLORS.info },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  buttonDisabled: { opacity: 0.5 },
});

interface SelectDataScreenProps {
  onConfirm: (selection: TransferSelection) => void;
  onCancel: () => void;
}

export default function SelectDataScreen({ onConfirm, onCancel }: SelectDataScreenProps) {
  const { state } = useData();
  const { t } = useT();
  const [selection, setSelection] = useState<TransferSelection>({
    groups: true,
    persons: true,
    sessionPlans: false,
    sessionLogs: false,
    assessments: false,
  });

  const toggle = (key: keyof TransferSelection) => {
    setSelection(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAll = () => {
    setSelection({
      groups: true,
      persons: true,
      sessionPlans: true,
      sessionLogs: true,
      assessments: true,
    });
  };

  const selectNone = () => {
    setSelection({
      groups: false,
      persons: false,
      sessionPlans: false,
      sessionLogs: false,
      assessments: false,
    });
  };

  const hasSelection = Object.values(selection).some(v => v);
  const totalItems =
    (selection.groups ? state.groups.length : 0) +
    (selection.persons ? state.persons.length : 0) +
    (selection.sessionPlans ? state.sessionPlans.length : 0) +
    (selection.sessionLogs ? state.sessionLogs.length : 0) +
    (selection.assessments ? state.assessments.length : 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{t('Select data to sync')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.section}>{t('What to include in transfer:')}</Text>

        <TouchableOpacity
          style={[styles.checkbox, selection.groups && styles.checkboxChecked]}
          onPress={() => toggle('groups')}
        >
          <View style={[styles.box, selection.groups && styles.boxChecked]}>
            {selection.groups && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t('Groups')}</Text>
            <Text style={styles.count}>{state.groups.length} {t('items')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkbox, selection.persons && styles.checkboxChecked]}
          onPress={() => toggle('persons')}
        >
          <View style={[styles.box, selection.persons && styles.boxChecked]}>
            {selection.persons && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t('People (athletes & contacts)')}</Text>
            <Text style={styles.count}>{state.persons.length} {t('items')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkbox, selection.sessionPlans && styles.checkboxChecked]}
          onPress={() => toggle('sessionPlans')}
        >
          <View style={[styles.box, selection.sessionPlans && styles.boxChecked]}>
            {selection.sessionPlans && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t('Session plans')}</Text>
            <Text style={styles.count}>{state.sessionPlans.length} {t('items')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkbox, selection.sessionLogs && styles.checkboxChecked]}
          onPress={() => toggle('sessionLogs')}
        >
          <View style={[styles.box, selection.sessionLogs && styles.boxChecked]}>
            {selection.sessionLogs && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t('Session logs')}</Text>
            <Text style={styles.count}>{state.sessionLogs.length} {t('items')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkbox, selection.assessments && styles.checkboxChecked]}
          onPress={() => toggle('assessments')}
        >
          <View style={[styles.box, selection.assessments && styles.boxChecked]}>
            {selection.assessments && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t('Assessments')}</Text>
            <Text style={styles.count}>{state.assessments.length} {t('items')}</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.section, { marginTop: 24 }]}>{t('Quick select:')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={selectAll}>
            <Text style={styles.buttonText}>{t('All')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={selectNone}>
            <Text style={styles.buttonText}>{t('None')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.section, { marginTop: 24 }]}>
          {t('Total')}: {totalItems} {t('items will be transferred')}
        </Text>
        <Text style={styles.count}>
          {t('Catalogs (exercises, techniques, body parts, templates) and contact links are always included in a transfer.')}
        </Text>
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={onCancel}>
          <Text style={styles.buttonText}>{t('Cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, !hasSelection && styles.buttonDisabled]}
          onPress={() => onConfirm(selection)}
          disabled={!hasSelection}
        >
          <Text style={styles.buttonText}>{t('Continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
