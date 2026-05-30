import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AssessmentMetric } from '../types';
import { COLORS } from '../constants/colors';
import { formatDate } from '../utils/format';

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.surface, padding: 12, borderRadius: 8, marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, color: COLORS.textMuted },
  deltaText: { fontSize: 14, fontWeight: 'bold' },
  values: { marginTop: 8, fontSize: 14, color: COLORS.text },
  deltaPositive: { color: COLORS.success },
  deltaNegative: { color: COLORS.warning },
  deltaFlat: { color: COLORS.textMuted },
});

interface MetricRowProps {
  date: string;
  metric: AssessmentMetric;
  previousMetric?: AssessmentMetric;
  notes?: string;
}

export function MetricRow({ date, metric, previousMetric, notes }: MetricRowProps) {
  const getDeltaText = (): string => {
    switch (metric.type) {
      case 'balance_hold':
        if (!previousMetric || previousMetric.type !== 'balance_hold') return '—';
        const balDelta = metric.dominant - previousMetric.dominant;
        return balDelta > 0 ? `+${balDelta}s` : `${balDelta}s`;
      case 'reaction_errors':
        if (!previousMetric || previousMetric.type !== 'reaction_errors') return '—';
        const errDelta = metric.errorsPerTen - previousMetric.errorsPerTen;
        return errDelta < 0 ? `${errDelta}` : `+${errDelta}`;
      default:
        return '—';
    }
  };

  const getDeltaColor = (): string => {
    const delta = getDeltaText();
    if (delta === '—') return COLORS.textMuted;
    if (delta.startsWith('-')) return COLORS.success;
    if (delta.startsWith('+')) {
      // For balance, more is better; for errors, less is better
      return metric.type === 'balance_hold' ? COLORS.success : COLORS.warning;
    }
    return COLORS.textMuted;
  };

  const getMetricDisplay = (): React.ReactNode => {
    switch (metric.type) {
      case 'balance_hold':
        return (
          <Text style={styles.values}>
            Dominant: {metric.dominant}s | Non-Dom: {metric.nonDominant}s
          </Text>
        );
      case 'reaction_errors':
        return <Text style={styles.values}>Errors: {metric.errorsPerTen}/10 cues</Text>;
      case 'combo_accuracy':
        const accuracy = ((metric.correct / metric.total) * 100).toFixed(0);
        return (
          <Text style={styles.values}>
            {metric.correct}/{metric.total} ({accuracy}%)
          </Text>
        );
      case 'vestibular_landing':
        return (
          <Text style={styles.values}>
            Stable: {metric.stable} | Stumble: {metric.stumble} | Fall: {metric.fall}
          </Text>
        );
      case 'balance_poomsae':
        return (
          <Text style={styles.values}>
            Hold: {metric.holdSeconds}s | Arm Errors: {metric.armErrors}
          </Text>
        );
      case 'poomsae_distraction':
        return (
          <Text style={styles.values}>
            Errors: {metric.errors} | Baseline: {metric.baseline}
          </Text>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(date)}</Text>
        <Text style={[styles.deltaText, { color: getDeltaColor() }]}>{getDeltaText()}</Text>
      </View>
      {getMetricDisplay()}
      {notes && <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 8 }}>📝 {notes}</Text>}
    </View>
  );
}
