import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share, ScrollView } from 'react-native';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { MetricRow } from '../../components/MetricRow';
import { formatBelt, generateProgressSummaryText } from '../../utils/format';
import { toAthleteView, getPerson } from '../../domain';
import { useT } from '../../i18n';
import type { AssessmentStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  headerMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  content: { padding: 16 },
  section: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: COLORS.text },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 24 },
});

export default function ProgressScreen({ route }: AssessmentStackScreenProps<'Progress'>) {
  const { state } = useData();
  const { t } = useT();
  const athleteId = route.params?.athleteId;
  const athlete = toAthleteView(getPerson(state.persons, athleteId ?? ''));
  // .filter() returns a new array, so the subsequent .sort() is safe (does not mutate state).
  const assessments = state.assessments
    .filter(a => a.athleteId === athleteId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!athlete) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 16, color: COLORS.text }}>{t('Athlete not found')}</Text>
      </View>
    );
  }

  // Group by game
  const gameGroups = new Map<string, typeof assessments>();
  assessments.forEach(a => {
    const game = state.games.find(g => g.id === a.gameId);
    if (game && game.logMetricType) {
      const key = a.gameId;
      if (!gameGroups.has(key)) gameGroups.set(key, []);
      gameGroups.get(key)!.push(a);
    }
  });

  const handleShare = async () => {
    const metrics = Array.from(gameGroups.entries()).map(([gameId, gameAssessments]) => {
      const game = state.games.find(g => g.id === gameId);
      const latest = gameAssessments[0];
      const previous = gameAssessments[1];

      // Extract numeric value for delta
      let current = 0;
      if (latest.metric.type === 'balance_hold') current = latest.metric.dominant;
      else if (latest.metric.type === 'reaction_errors') current = latest.metric.errorsPerTen;

      let prev: number | undefined;
      if (previous?.metric.type === latest.metric.type) {
        if (latest.metric.type === 'balance_hold' && previous.metric.type === 'balance_hold')
          prev = previous.metric.dominant;
        else if (latest.metric.type === 'reaction_errors' && previous.metric.type === 'reaction_errors')
          prev = previous.metric.errorsPerTen;
      }

      return {
        metricName: game?.name || gameId,
        current,
        previous: prev,
        unit: latest.metric.type === 'reaction_errors' ? '' : 's',
      };
    });

    const summary = generateProgressSummaryText(athlete.name, athlete.belt, metrics);
    try {
      await Share.share({ message: summary, title: `${athlete.name} Progress` });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{athlete.name}</Text>
        <Text style={styles.headerMeta}>{formatBelt(athlete.belt)}</Text>
      </View>

      <ScrollView style={styles.content}>
        {Array.from(gameGroups.entries()).length > 0 ? (
          Array.from(gameGroups.entries()).map(([gameId, gameAssessments]) => (
            <View key={gameId}>
              <Text style={styles.section}>
                {state.games.find(g => g.id === gameId)?.name || gameId}
              </Text>
              <FlatList
                scrollEnabled={false}
                data={gameAssessments}
                keyExtractor={(_item, idx) => idx.toString()}
                renderItem={({ item, index }) => (
                  <MetricRow
                    date={item.date}
                    metric={item.metric}
                    previousMetric={index < gameAssessments.length - 1 ? gameAssessments[index + 1].metric : undefined}
                    notes={item.notes}
                  />
                )}
              />
            </View>
          ))
        ) : (
          <Text style={styles.empty}>{t('No assessments logged yet')}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>{t('Share progress')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
