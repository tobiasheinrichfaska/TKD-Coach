import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { encodeToChunks } from '../../utils/qrChunks';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 24, color: COLORS.text, textAlign: 'center' },
  qrContainer: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 12, marginBottom: 24, justifyContent: 'center', alignItems: 'center' },
  progress: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 12 },
  controls: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  button: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 14 },
  loading: { marginBottom: 24 },
  instruction: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 16 },
});

export default function SendQRScreen({ navigation }: any) {
  const { state } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);

  const chunks = useMemo(() => {
    try {
      return encodeToChunks(state);
    } catch (e) {
      console.error('Failed to encode QR chunks:', e);
      return [];
    }
  }, [state]);

  if (chunks.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loading} />
        <Text style={styles.header}>Preparing QR codes...</Text>
      </View>
    );
  }

  const currentChunk = chunks[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === chunks.length - 1;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Share Coach Data</Text>
      <Text style={styles.progress}>QR Code {currentIndex + 1} of {chunks.length}</Text>

      <View style={styles.qrContainer}>
        <QRCode value={currentChunk} size={300} ecl="H" />
      </View>

      <Text style={styles.progress}>Chunk {currentIndex + 1}/{chunks.length}</Text>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isFirst && styles.buttonDisabled]}
          onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={isFirst}
        >
          <Text style={styles.buttonText}>← Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLast && styles.buttonDisabled]}
          onPress={() => setCurrentIndex(Math.min(chunks.length - 1, currentIndex + 1))}
          disabled={isLast}
        >
          <Text style={styles.buttonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instruction}>
        {isLast
          ? 'Last chunk. Have the receiving phone scan all QR codes in order.'
          : 'Tap Next to view the next QR code.'}
      </Text>

      <TouchableOpacity
        style={[styles.button, { marginTop: 24 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}
