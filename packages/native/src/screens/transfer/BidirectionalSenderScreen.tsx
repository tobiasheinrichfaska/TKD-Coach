import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { encodeToChunks, exportSelected } from '../../utils/qrChunks';
import { TransferSelection } from '../../types';
import { generateId } from '../../utils/ids';
import { useT } from '../../i18n';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: COLORS.text, textAlign: 'center' },
  subheader: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 24 },
  qrContainer: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 12, marginBottom: 16, justifyContent: 'center', alignItems: 'center' },
  status: { fontSize: 14, color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  progress: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12, textAlign: 'center' },
  instruction: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 12, marginBottom: 16, paddingHorizontal: 8 },
  controls: { flexDirection: 'row', gap: 8, marginTop: 16 },
  button: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonSecondary: { backgroundColor: COLORS.info },
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
  const { t } = useT();
  const [transferState, setTransferState] = useState<TransferState>('handshake');
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
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
  const isLastChunk = currentChunkIndex === chunks.length - 1;

  const handleStartTransfer = () => {
    if (chunks.length === 0) {
      Alert.alert(t('No data'), t('No data selected to transfer'));
      return;
    }
    setTransferState('transferring');
  };

  // Manual advance: there is no receiver→sender back-channel, so the sender
  // simply pages through the chunk QRs at the receiver's scanning pace.
  const handleNext = () => {
    if (isLastChunk) {
      setTransferState('complete');
    } else {
      setCurrentChunkIndex(i => i + 1);
    }
  };

  const handlePrev = () => {
    setCurrentChunkIndex(i => Math.max(0, i - 1));
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>{t('Transfer error')}</Text>
        <Text style={{ color: COLORS.danger, marginVertical: 16 }}>{error}</Text>
        <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={onCancel}>
          <Text style={styles.buttonText}>{t('Back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (chunks.length === 0) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.status, { marginTop: 16 }]}>{t('Preparing data...')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        {transferState === 'handshake' ? t('Ready to send') : transferState === 'transferring' ? t('Sending data') : t('Transfer complete')}
      </Text>

      {transferState === 'handshake' && (
        <>
          <Text style={styles.subheader}>{t('Have the receiver scan this QR code')}</Text>
          <View style={styles.qrContainer}>
            <QRCode value={handshakeQr} size={250} ecl="H" />
          </View>
          <Text style={styles.instruction}>
            {t('This QR announces you as sender with')} {chunks.length} {t('chunks to transfer. Once the receiver confirms, you send the data.')}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStartTransfer}>
            <Text style={styles.buttonText}>{t('Receiver scanned → start transfer')}</Text>
          </TouchableOpacity>
        </>
      )}

      {transferState === 'transferring' && (
        <>
          <Text style={styles.status}>{t('Chunk')} {currentChunkIndex + 1} {t('of')} {chunks.length}</Text>
          <View style={styles.qrContainer}>
            <QRCode value={currentChunkQr} size={250} ecl="H" />
          </View>

          <Text style={styles.instruction}>
            {t('Hold each code in front of the receiver camera until it scans, then tap Next. The receiver assembles automatically once it has all chunks.')}
          </Text>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary, currentChunkIndex === 0 && { opacity: 0.5 }]}
              onPress={handlePrev}
              disabled={currentChunkIndex === 0}
            >
              <Text style={styles.buttonText}>{t('Previous')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>{isLastChunk ? t('Finish') : t('Next')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {transferState === 'complete' && (
        <>
          <Text style={[styles.status, { color: COLORS.success, fontSize: 16 }]}>
            ✓ {t('Transfer complete')}
          </Text>
          <Text style={styles.instruction}>
            {t('All chunks transmitted successfully. The receiver will merge the data into their local database.')}
          </Text>
          <TouchableOpacity style={styles.button} onPress={onComplete}>
            <Text style={styles.buttonText}>{t('Finish')}</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, styles.buttonDanger, { marginTop: 16 }]}
        onPress={onCancel}
      >
        <Text style={styles.buttonText}>{t('Cancel transfer')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
