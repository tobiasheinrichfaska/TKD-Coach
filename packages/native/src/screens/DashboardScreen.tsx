import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: COLORS.text,
  },
});

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard — Phase 1</Text>
      <Text style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 8 }}>
        Heute's planned sessions will appear here.
      </Text>
    </View>
  );
}
