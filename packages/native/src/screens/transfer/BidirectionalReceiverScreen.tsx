import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { assembleFromChunks, detectChanges, applyChanges, sanitizeImported, SYNCED_COLLECTIONS } from '../../utils/qrChunks';
import type { QRChunk, ChangeDetection, SyncedCollection } from '../../utils/qrChunks';
import { useT } from '../../i18n';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerText: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  camera: { flex: 1 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)', padding: 16 },
  overlayText: { color: COLORS.surface, textAlign: 'center', fontSize: 14, marginBottom: 8 },
  progress: { color: COLORS.surface, fontSize: 12, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonDanger: { backgroundColor: COLORS.danger },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  noCamera: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  noCameraText: { fontSize: 16, color: COLORS.text, marginBottom: 16, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  changeSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  changeTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  changeItem: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4, paddingLeft: 8 },
  newItem: { color: COLORS.success },
  changedItem: { color: COLORS.warning },
  unchangedItem: { color: COLORS.textMuted },
});

type ReceiverState = 'scanning-handshake' | 'scanning-chunks' | 'processing' | 'review' | 'complete';

// i18n label key for every synced collection. Typed against SyncedCollection, so adding a
// collection to the sync set without a label here is a compile error — the review must show
// ALL of them (catalogs + contact links always ride along), so there's no silent merge.
const COLLECTION_LABELS: Record<SyncedCollection, string> = {
  groups: 'groups',
  persons: 'people',
  sessionPlans: 'session plans',
  sessionLogs: 'session logs',
  assessments: 'assessments',
  games: 'exercises',
  sessionTemplates: 'session templates',
  contactLinks: 'contact links',
  bodyParts: 'body parts',
  techniques: 'techniques',
};

/** Sum item counts across every synced collection in one change bucket. */
const bucketTotal = (bucket: Record<string, unknown[]>): number =>
  SYNCED_COLLECTIONS.reduce((s, key) => s + (bucket[key]?.length ?? 0), 0);

interface HandshakeData {
  role: string;
  peerId: string;
  totalChunks: number;
  ready: boolean;
}

export default function BidirectionalReceiverScreen({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const { state, dispatch } = useData();
  const { t } = useT();
  const [permission, requestPermission] = useCameraPermissions();
  const [receiverState, setReceiverState] = useState<ReceiverState>('scanning-handshake');
  const [handshake, setHandshake] = useState<HandshakeData | null>(null);
  const [chunks, setChunks] = useState<Map<string, QRChunk>>(new Map());
  const [changes, setChanges] = useState<ChangeDetection | null>(null);
  const scannedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (receiverState === 'processing') return;

    try {
      const data: unknown = JSON.parse(result.data);
      if (!data || typeof data !== 'object') return;
      const obj = data as Record<string, unknown>;

      // Check if it's a handshake
      if (obj.role === 'sender' && obj.totalChunks !== undefined) {
        if (receiverState === 'scanning-handshake') {
          setHandshake(obj as unknown as HandshakeData);
          setReceiverState('scanning-chunks');
          scannedIdsRef.current.clear();
          setChunks(new Map());
        }
        return;
      }

      // Otherwise treat as chunk
      if (receiverState === 'scanning-chunks') {
        const chunk = obj as unknown as QRChunk;
        if (!chunk.id || chunk.total === undefined || chunk.index === undefined || !chunk.data) {
          return;
        }
        // The chunk's own `total` drives completion; the handshake announced one too.
        // A mismatch means we're scanning chunks from a different transfer — warn.
        if (handshake && chunk.total !== handshake.totalChunks) {
          console.warn(`Chunk total (${chunk.total}) != handshake total (${handshake.totalChunks})`);
        }

        const chunkKey = `${chunk.id}_${chunk.index}`;
        if (scannedIdsRef.current.has(chunkKey)) {
          return;
        }

        scannedIdsRef.current.add(chunkKey);
        const newChunks = new Map(chunks);
        newChunks.set(chunkKey, chunk);
        setChunks(newChunks);

        const allChunksForId = Array.from(newChunks.values()).filter(c => c.id === chunk.id);
        if (allChunksForId.length === chunk.total) {
          // All chunks collected
          await processTransfer(allChunksForId);
        }
      }
    } catch (e) {
      // Invalid JSON, ignore and continue scanning
    }
  };

  const processTransfer = async (allChunks: QRChunk[]) => {
    setReceiverState('processing');
    try {
      const packets = allChunks.map(c => JSON.stringify(c));
      const importedData = sanitizeImported(assembleFromChunks(packets));
      const detected = detectChanges(state, importedData);
      setChanges(detected);
      setReceiverState('review');
    } catch (e) {
      Alert.alert(t('Processing failed'), e instanceof Error ? e.message : t('Unknown error'));
      setReceiverState('scanning-chunks');
    }
  };

  const handleAccept = () => {
    if (!changes) return;
    // Single shared merge: replace changed entities by id, append new ones.
    dispatch({ type: 'LOAD_ALL', payload: applyChanges(state, changes) });
    setReceiverState('complete');
  };

  const chunkArray = Array.from(chunks.values());
  const receivedCount = chunkArray.length;
  const totalCount = handshake?.totalChunks ?? 0;

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.noCamera}>
        <Text style={styles.noCameraText}>{t('Camera permission required')}</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>{t('Grant permission')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (receiverState === 'processing') {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.overlayText, { marginTop: 16 }]}>{t('Processing transfer...')}</Text>
      </View>
    );
  }

  if (receiverState === 'review' && changes) {
    const newBucket = changes.new as unknown as Record<string, unknown[]>;
    const changedBucket = changes.changed as unknown as Record<string, unknown[]>;
    const unchangedBucket = changes.unchanged as unknown as Record<string, unknown[]>;
    const totalNew = bucketTotal(newBucket);
    const totalChanged = bucketTotal(changedBucket);
    const totalUnchanged = bucketTotal(unchangedBucket);
    // Nothing new or changed → accepting would be a no-op; block it.
    const canMerge = totalNew + totalChanged > 0;

    // Per-collection breakdown for one bucket, e.g. "+ 3 groups" / "~ 2 exercises".
    const breakdown = (bucket: Record<string, unknown[]>, sign: string, itemStyle: object) =>
      SYNCED_COLLECTIONS
        .filter(key => (bucket[key]?.length ?? 0) > 0)
        .map(key => (
          <Text key={key} style={[styles.changeItem, itemStyle]}>
            {sign} {bucket[key].length} {t(COLLECTION_LABELS[key])}
          </Text>
        ));

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{t('Review transfer')}</Text>
        </View>
        <ScrollView>
          {totalNew > 0 && (
            <View style={styles.changeSection}>
              <Text style={[styles.changeTitle, { color: COLORS.success }]}>{t('New data')} ({totalNew})</Text>
              {breakdown(newBucket, '+', styles.newItem)}
            </View>
          )}

          {totalChanged > 0 && (
            <View style={styles.changeSection}>
              <Text style={[styles.changeTitle, { color: COLORS.warning }]}>{t('Updated data')} ({totalChanged})</Text>
              {breakdown(changedBucket, '~', styles.changedItem)}
            </View>
          )}

          {totalUnchanged > 0 && (
            <View style={styles.changeSection}>
              <Text style={[styles.changeTitle, { color: COLORS.textMuted }]}>{t('Unchanged')} ({totalUnchanged})</Text>
              <Text style={[styles.changeItem, styles.unchangedItem]}>= {totalUnchanged} {t('items match your data')}</Text>
            </View>
          )}

          {!canMerge && (
            <View style={styles.changeSection}>
              <Text style={[styles.changeItem, styles.unchangedItem]}>{t('Nothing to merge')}</Text>
            </View>
          )}
        </ScrollView>

        <View style={{ padding: 16, gap: 8 }}>
          <TouchableOpacity
            style={[styles.button, !canMerge && styles.buttonDisabled]}
            onPress={handleAccept}
            disabled={!canMerge}
          >
            <Text style={styles.buttonText}>{t('Accept & merge')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={() => { setReceiverState('scanning-chunks'); setChunks(new Map()); scannedIdsRef.current.clear(); }}>
            <Text style={styles.buttonText}>{t('Reject')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (receiverState === 'complete') {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={{ fontSize: 24, color: COLORS.success, marginBottom: 16 }}>✓ {t('Import complete')}</Text>
        <Text style={{ color: COLORS.text, marginBottom: 24, textAlign: 'center' }}>{t('Data has been merged into your database')}</Text>
        <TouchableOpacity style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>{t('Finish')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {receiverState === 'scanning-handshake' ? t('Waiting for sender') : t('Receiving data')}
        </Text>
      </View>

      <CameraView
        style={styles.camera}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      <View style={styles.overlay}>
        {handshake && receivedCount > 0 && (
          <Text style={styles.progress}>
            {t('Received')}: {receivedCount}/{totalCount} {t('chunks')}
          </Text>
        )}
        <Text style={styles.overlayText}>
          {receiverState === 'scanning-handshake'
            ? t('Point camera at sender QR code')
            : `${t('Scan chunk')} ${receivedCount + 1} ${t('of')} ${totalCount}`}
        </Text>
        <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={onCancel}>
          <Text style={styles.buttonText}>{t('Stop')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
