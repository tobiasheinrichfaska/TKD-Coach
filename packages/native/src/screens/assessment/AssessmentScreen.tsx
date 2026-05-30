import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, color: COLORS.text },
});

export default function AssessmentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Assessment — Phase 3</Text>
      <Text style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 8 }}>Metric logging and progress tracking coming in Phase 3.</Text>
    </View>
  );
}
