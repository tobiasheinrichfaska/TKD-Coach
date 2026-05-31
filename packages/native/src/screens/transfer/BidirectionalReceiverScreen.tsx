import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { assembleFromChunks, detectChanges, applyChanges } from '../../utils/qrChunks';
import type { QRChunk, ChangeDetection } from '../../utils/qrChunks';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerText: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  camera: { flex: 1 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)', padding: 16 },
  overlayText: { color: COLORS.surface, textAlign: 'center', fontSize: 14, marginBottom: 8 },
  progress: { color: COLORS.surface, fontSize: 12, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
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

interface HandshakeData {
  role: string;
  peerId: string;
  totalChunks: number;
  ready: boolean;
}

export default function BidirectionalReceiverScreen({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const { state, dispatch } = useData();
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
      const importedData = assembleFromChunks(packets);
      const detected = detectChanges(state, importedData);
      setChanges(detected);
      setReceiverState('review');
    } catch (e) {
      Alert.alert('Processing Failed', e instanceof Error ? e.message : 'Unknown error');
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
        <Text style={styles.noCameraText}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (receiverState === 'processing') {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.overlayText, { marginTop: 16 }]}>Processing transfer...</Text>
      </View>
    );
  }

  if (receiverState === 'review' && changes) {
    const totalNew = changes.new.groups.length + changes.new.persons.length + changes.new.sessionPlans.length + changes.new.sessionLogs.length + changes.new.assessments.length;
    const totalChanged = changes.changed.groups.length + changes.changed.persons.length + changes.changed.sessionPlans.length + changes.changed.sessionLogs.length + changes.changed.assessments.length;
    const totalUnchanged = changes.unchanged.groups.length + changes.unchanged.persons.length + changes.unchanged.sessionPlans.length + changes.unchanged.sessionLogs.length + changes.unchanged.assessments.length;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Review Transfer</Text>
        </View>
        <ScrollView>
          {totalNew > 0 && (
            <View style={styles.changeSection}>
              <Text style={[styles.changeTitle, { color: COLORS.success }]}>New Data ({totalNew})</Text>
              {changes.new.groups.length > 0 && <Text style={[styles.changeItem, styles.newItem]}>+ {changes.new.groups.length} groups</Text>}
              {changes.new.persons.length > 0 && <Text style={[styles.changeItem, styles.newItem]}>+ {changes.new.persons.length} people</Text>}
              {changes.new.sessionPlans.length > 0 && <Text style={[styles.changeItem, styles.newItem]}>+ {changes.new.sessionPlans.length} session plans</Text>}
              {changes.new.sessionLogs.length > 0 && <Text style={[styles.changeItem, styles.newItem]}>+ {changes.new.sessionLogs.length} session logs</Text>}
              {changes.new.assessments.length > 0 && <Text style={[styles.changeItem, styles.newItem]}>+ {changes.new.assessments.length} assessments</Text>}
            </View>
          )}

          {totalChanged > 0 && (
            <View style={styles.changeSection}>
              <Text style={[styles.changeTitle, { color: COLORS.warning }]}>Updated Data ({totalChanged})</Text>
              {changes.changed.groups.length > 0 && <Text style={[styles.changeItem, styles.changedItem]}>~ {changes.changed.groups.length} groups</Text>}
              {changes.changed.persons.length > 0 && <Text style={[styles.changeItem, styles.changedItem]}>~ {changes.changed.persons.length} people</Text>}
              {changes.changed.sessionPlans.length > 0 && <Text style={[styles.changeItem, styles.changedItem]}>~ {changes.changed.sessionPlans.length} session plans</Text>}
              {changes.changed.sessionLogs.length > 0 && <Text style={[styles.changeItem, styles.changedItem]}>~ {changes.changed.sessionLogs.length} session logs</Text>}
              {changes.changed.assessments.length > 0 && <Text style={[styles.changeItem, styles.changedItem]}>~ {changes.changed.assessments.length} assessments</Text>}
            </View>
          )}

          {totalUnchanged > 0 && (
            <View style={styles.changeSection}>
              <Text style={[styles.changeTitle, { color: COLORS.textMuted }]}>Unchanged ({totalUnchanged})</Text>
              <Text style={[styles.changeItem, styles.unchangedItem]}>= {totalUnchanged} items match your data</Text>
            </View>
          )}
        </ScrollView>

        <View style={{ padding: 16, gap: 8 }}>
          <TouchableOpacity style={styles.button} onPress={handleAccept}>
            <Text style={styles.buttonText}>Accept & Merge</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={() => { setReceiverState('scanning-chunks'); setChunks(new Map()); scannedIdsRef.current.clear(); }}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (receiverState === 'complete') {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={{ fontSize: 24, color: COLORS.success, marginBottom: 16 }}>✓ Import Complete</Text>
        <Text style={{ color: COLORS.text, marginBottom: 24, textAlign: 'center' }}>Data has been merged into your database</Text>
        <TouchableOpacity style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {receiverState === 'scanning-handshake' ? 'Waiting for Sender' : 'Receiving Data'}
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
            Received: {receivedCount}/{totalCount} chunks
          </Text>
        )}
        <Text style={styles.overlayText}>
          {receiverState === 'scanning-handshake'
            ? 'Point camera at sender QR code'
            : `Scan chunk ${receivedCount + 1} of ${totalCount}`}
        </Text>
        <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={onCancel}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
