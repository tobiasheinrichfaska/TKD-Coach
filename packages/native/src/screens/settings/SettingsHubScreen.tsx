import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useData } from '../../context/DataContext';
import { useT, LANGUAGES, Lang } from '../../i18n';
import type { SettingsStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  section: { fontSize: 13, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 18, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  chevron: { fontSize: 22, color: COLORS.textMuted },
  langRow: { flexDirection: 'row', gap: 8 },
  langChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  langChipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langText: { color: COLORS.text, fontWeight: '600' },
  langTextOn: { color: COLORS.surface, fontWeight: '700' },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
});

export default function SettingsHubScreen({ navigation }: SettingsStackScreenProps<'SettingsHub'>) {
  const { t, lang, setLang } = useT();
  const { state, dispatch } = useData();

  const stuck = state.sessionLogs.filter(l => l.status === 'running');
  const clearStuck = () => {
    if (stuck.length === 0) {
      Alert.alert(t('No stuck sessions'), t('There are no in-progress sessions to clear.'));
      return;
    }
    Alert.alert(
      t('Clear stuck sessions?'),
      t('Removes every in-progress session and returns its plan to Planned. Completed sessions are not affected.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Clear'),
          style: 'destructive',
          onPress: () => stuck.forEach(l => dispatch({ type: 'DELETE_SESSION_LOG', payload: { id: l.id } })),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.section}>{t('Language')}</Text>
      <View style={styles.langRow}>
        {LANGUAGES.map(l => {
          const on = lang === l.code;
          return (
            <TouchableOpacity key={l.code} style={[styles.langChip, on && styles.langChipOn]} onPress={() => setLang(l.code as Lang)}>
              <Text style={on ? styles.langTextOn : styles.langText}>{l.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hint}>{t('Choose the app language. Catalog data stays as entered.')}</Text>

      <Text style={styles.section}>{t('Transfer')}</Text>
      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Transfer', { screen: 'TransferMain' })}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('Data sync (QR transfer)')}</Text>
          <Text style={styles.meta}>{t('Send or receive data between phones via QR codes.')}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Text style={styles.section}>{t('Maintenance')}</Text>
      <TouchableOpacity style={styles.row} onPress={clearStuck}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('Clear stuck sessions')}</Text>
          <Text style={styles.meta}>{t('Reset in-progress sessions that did not close properly.')}</Text>
        </View>
        <Text style={[styles.title, { color: stuck.length > 0 ? COLORS.danger : COLORS.textMuted }]}>{stuck.length}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
