import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AssessmentMetric, MetricTypeDef } from '../types';
import { COLORS } from '../constants/colors';
import { formatDate } from '../utils/format';
import { fieldDelta } from '../domain';

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, color: COLORS.textMuted },
  deltaText: { fontSize: 14, fontWeight: 'bold' },
  values: { marginTop: 8, fontSize: 14, color: COLORS.text },
});

interface MetricRowProps {
  date: string;
  metric: AssessmentMetric;
  previousMetric?: AssessmentMetric;
  notes?: string;
  /** Schema for this metric type — drives the value display and the headline delta. */
  schema?: MetricTypeDef;
}

const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const val = (m: AssessmentMetric, key: string): number => (m as unknown as Record<string, number>)[key] ?? 0;

export function MetricRow({ date, metric, previousMetric, notes, schema }: MetricRowProps) {
  const primary = schema?.fields.find(f => f.key === schema.primaryField);
  const delta =
    primary && previousMetric && previousMetric.type === metric.type
      ? fieldDelta(primary, val(metric, primary.key), val(previousMetric, primary.key))
      : null;

  const deltaText = delta ? `${delta.raw > 0 ? '+' : ''}${fmt(delta.raw)}${primary?.unit ?? ''}` : '—';
  const deltaColor = !delta || delta.raw === 0 ? COLORS.textMuted : delta.improved ? COLORS.success : COLORS.warning;

  const display = schema
    ? schema.fields.map(f => `${f.label}: ${fmt(val(metric, f.key))}${f.unit ?? ''}`).join('  ·  ')
    : '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(date)}</Text>
        <Text style={[styles.deltaText, { color: deltaColor }]}>{deltaText}</Text>
      </View>
      {!!display && <Text style={styles.values}>{display}</Text>}
      {notes && <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 8 }}>📝 {notes}</Text>}
    </View>
  );
}
