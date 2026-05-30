import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { encodeToChunks, exportSelected } from '../../utils/qrChunks';
import { TransferSelection } from '../../types';
import { generateId } from '../../utils/ids';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: COLORS.text, textAlign: 'center' },
  subheader: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 24 },
  qrContainer: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 12, marginBottom: 16, justifyContent: 'center', alignItems: 'center' },
  status: { fontSize: 14, color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  progress: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12, textAlign: 'center' },
  instruction: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 12, marginBottom: 16, paddingHorizontal: 8 },
  ackContainer: { backgroundColor: COLORS.success, opacity: 0.1, padding: 12, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: COLORS.success },
  ackText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  ackPreview: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  controls: { flexDirection: 'row', gap: 8, marginTop: 16 },
  button: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonDanger: { backgroundColor: COLORS.danger },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  loading: { justifyContent: 'center', alignItems: 'center', padding: 24 },
});

interface BidirectionalSenderScreenProps {
  selection: TransferSelection;
  onComplete: () => void;
  onCancel: () => void;
}

type TransferState = 'handshake' | 'transferring' | 'complete';

export default function BidirectionalSenderScreen({ selection, onComplete, onCancel }: BidirectionalSenderScreenProps) {
  const { state } = useData();
  const [transferState, setTransferState] = useState<TransferState>('handshake');
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [acknowledged, setAcknowledged] = useState<Map<number, string>>(new Map());
  const [transferId] = useState(generateId());
  const [error, setError] = useState<string | null>(null);

  const exportedData = useMemo(() => {
    try {
      return exportSelected(state, selection);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
      return null;
    }
  }, [state, selection]);

  const chunks = useMemo(() => {
    if (!exportedData) return [];
    try {
      return encodeToChunks(exportedData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Encoding failed');
      return [];
    }
  }, [exportedData]);

  const handshakeQr = useMemo(() => {
    return JSON.stringify({
      role: 'sender',
      peerId: transferId,
      totalChunks: chunks.length,
      ready: true,
    });
  }, [transferId, chunks.length]);

  const currentChunkQr = chunks[currentChunkIndex];
  const currentAck = acknowledged.get(currentChunkIndex);

  const handleAcknowledge = () => {
    if (transferState === 'handshake') {
      if (chunks.length === 0) {
        Alert.alert('No Data', 'No data selected to transfer');
        return;
      }
      setTransferState('transferring');
    } else if (transferState === 'transferring') {
      if (currentAck) {
        if (currentChunkIndex < chunks.length - 1) {
          setCurrentChunkIndex(currentChunkIndex + 1);
          setAcknowledged(new Map(acknowledged).set(currentChunkIndex + 1, 'waiting'));
        } else {
          setTransferState('complete');
        }
      }
    }
  };

  const handleRepeat = () => {
    Alert.alert('Repeat Chunk', 'Receiver will rescan this chunk');
    setAcknowledged(prev => {
      const next = new Map(prev);
      next.delete(currentChunkIndex);
      return next;
    });
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Transfer Error</Text>
        <Text style={{ color: COLORS.danger, marginVertical: 16 }}>{error}</Text>
        <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={onCancel}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (chunks.length === 0) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.status, { marginTop: 16 }]}>Preparing data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        {transferState === 'handshake' ? 'Ready to Send' : transferState === 'transferring' ? 'Sending Data' : 'Transfer Complete'}
      </Text>

      {transferState === 'handshake' && (
        <>
          <Text style={styles.subheader}>Have receiver scan this QR code</Text>
          <View style={styles.qrContainer}>
            <QRCode value={handshakeQr} size={250} ecl="H" />
          </View>
          <Text style={styles.instruction}>
            This QR announces you as sender with {chunks.length} chunks to transfer. Once receiver confirms, you'll send the data.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleAcknowledge}>
            <Text style={styles.buttonText}>Receiver Scanned → Start Transfer</Text>
          </TouchableOpacity>
        </>
      )}

      {transferState === 'transferring' && (
        <>
          <Text style={styles.status}>Chunk {currentChunkIndex + 1} of {chunks.length}</Text>
          <View style={styles.qrContainer}>
            <QRCode value={currentChunkQr} size={250} ecl="H" />
          </View>

          {currentAck && (
            <View style={styles.ackContainer}>
              <Text style={styles.ackText}>✓ Chunk {currentChunkIndex + 1} Acknowledged</Text>
              <Text style={styles.ackPreview}>{currentAck}</Text>
            </View>
          )}

          <Text style={styles.instruction}>
            {currentAck
              ? 'Receiver confirmed receipt. Tap Next to continue.'
              : 'Waiting for receiver to scan and confirm...'}
          </Text>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, !currentAck && { opacity: 0.5 }]}
              onPress={handleAcknowledge}
              disabled={!currentAck}
            >
              <Text style={styles.buttonText}>Next Chunk</Text>
            </TouchableOpacity>
            {currentAck && (
              <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={handleRepeat}>
                <Text style={styles.buttonText}>Repeat</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {transferState === 'complete' && (
        <>
          <Text style={[styles.status, { color: COLORS.success, fontSize: 16 }]}>
            ✓ Transfer Complete
          </Text>
          <Text style={styles.instruction}>
            All {chunks.length} chunks transmitted successfully. Receiver will merge data into their local database.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onComplete}>
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, styles.buttonDanger, { marginTop: 16 }]}
        onPress={onCancel}
      >
        <Text style={styles.buttonText}>Cancel Transfer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
