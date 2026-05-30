import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useData } from '../../context/DataContext';
import { COLORS } from '../../constants/colors';
import { assembleFromChunks, mergeAppData, QRChunk } from '../../utils/qrChunks';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerText: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  camera: { flex: 1 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 16 },
  overlayText: { color: COLORS.surface, textAlign: 'center', fontSize: 14, marginBottom: 8 },
  progress: { color: COLORS.surface, fontSize: 12, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: COLORS.surface, fontWeight: 'bold' },
  noCamera: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  noCameraText: { fontSize: 16, color: COLORS.text, marginBottom: 16, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default function ReceiveQRScreen({ navigation }: any) {
  const { state, dispatch } = useData();
  const [permission, requestPermission] = useCameraPermissions();
  const [chunks, setChunks] = useState<Map<string, QRChunk>>(new Map());
  const [isImporting, setIsImporting] = useState(false);
  const scannedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async (result: any) => {
    if (isImporting) return;

    try {
      const chunk = JSON.parse(result.data) as QRChunk;

      if (!chunk.id || chunk.total === undefined || chunk.index === undefined || !chunk.data) {
        return; // Invalid chunk format
      }

      const chunkKey = `${chunk.id}_${chunk.index}`;
      if (scannedIdsRef.current.has(chunkKey)) {
        return; // Already scanned this chunk
      }

      scannedIdsRef.current.add(chunkKey);
      setChunks(prev => new Map(prev).set(chunkKey, chunk));

      const newChunks = new Map(chunks);
      newChunks.set(chunkKey, chunk);

      // Check if we have all chunks for this transfer ID
      const allChunksForId = Array.from(newChunks.values()).filter(c => c.id === chunk.id);
      if (allChunksForId.length === chunk.total) {
        // All chunks collected
        await completeImport(allChunksForId);
      }
    } catch (e) {
      // Invalid JSON, ignore and continue scanning
    }
  };

  const completeImport = async (allChunks: QRChunk[]) => {
    setIsImporting(true);
    try {
      const packets = allChunks.map(c => JSON.stringify(c));
      const importedData = assembleFromChunks(packets);
      const merged = mergeAppData(state, importedData);

      dispatch({
        type: 'LOAD_ALL',
        payload: merged,
      });

      Alert.alert(
        'Import Complete',
        `Successfully imported ${importedData.athletes.length} athletes, ${importedData.groups.length} groups, and ${importedData.assessments.length} assessments.`,
        [
          {
            text: 'Done',
            onPress: () => {
              scannedIdsRef.current.clear();
              setChunks(new Map());
              navigation.goBack();
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Import Failed', `Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setIsImporting(false);
    }
  };

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

  const chunkArray = Array.from(chunks.values());
  const firstChunk = chunkArray.length > 0 ? chunkArray[0] : null;
  const totalChunks = firstChunk?.total ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Scan QR Codes</Text>
      </View>

      {isImporting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.overlayText, { marginTop: 16 }]}>Processing...</Text>
        </View>
      ) : (
        <>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          <View style={styles.overlay}>
            {chunkArray.length > 0 && (
              <Text style={styles.progress}>
                Received: {chunkArray.length}/{totalChunks} chunks
              </Text>
            )}
            <Text style={styles.overlayText}>
              Point camera at QR codes
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
