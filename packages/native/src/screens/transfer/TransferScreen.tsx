import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginTop: 24, marginBottom: 8, textAlign: 'center' },
  description: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 32 },
  buttonContainer: { gap: 16, marginVertical: 24 },
  button: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 12, alignItems: 'center', minHeight: 100, justifyContent: 'center' },
  buttonTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.surface, marginBottom: 8 },
  buttonSubtitle: { fontSize: 12, color: COLORS.surface, opacity: 0.8 },
});

export default function TransferScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Transfer Coach Data</Text>
      <Text style={styles.description}>
        Exchange athlete, group, and assessment data with another coach's phone using QR codes.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SendQR')}
        >
          <Text style={styles.buttonTitle}>📤 Send</Text>
          <Text style={styles.buttonSubtitle}>Display QR codes to share your data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ReceiveQR')}
        >
          <Text style={styles.buttonTitle}>📥 Receive</Text>
          <Text style={styles.buttonSubtitle}>Scan QR codes to import data</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.description, { marginTop: 32 }]}>
        Coaches maintain independent datasets. Data is merged using a local-wins strategy: existing entries are kept, new ones are added.
      </Text>
    </ScrollView>
  );
}
