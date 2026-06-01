import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useT } from '../../i18n';
import type { TransferStackScreenProps } from '../../types/navigation';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginTop: 24, marginBottom: 8, textAlign: 'center' },
  description: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  buttonContainer: { gap: 16, marginVertical: 24 },
  button: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 12, alignItems: 'center', minHeight: 100, justifyContent: 'center' },
  buttonTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.surface, marginBottom: 8 },
  buttonSubtitle: { fontSize: 12, color: COLORS.surface, opacity: 0.8, textAlign: 'center' },
});

export default function TransferScreen({ navigation }: TransferStackScreenProps<'TransferMain'>) {
  const { t } = useT();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{t('Sync data with another coach')}</Text>
      <Text style={styles.description}>
        {t('Both coaches start the transfer on their phones. One acts as sender, one as receiver. You choose your role below.')}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SelectData')}
        >
          <Text style={styles.buttonTitle}>📤 {t('Start as sender')}</Text>
          <Text style={styles.buttonSubtitle}>{t('You will display QR codes for the other phone to scan')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Receiver')}
        >
          <Text style={styles.buttonTitle}>📥 {t('Start as receiver')}</Text>
          <Text style={styles.buttonSubtitle}>{t('You will scan QR codes from the other phone')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.description, { marginTop: 32 }]}>
        <Text style={{ fontWeight: 'bold' }}>{t('How it works:')}</Text>
        {'\n'}1. {t('Sender selects data to share')}
        {'\n'}2. {t('Receiver scans handshake QR')}
        {'\n'}3. {t('Sender pages through chunk QRs; receiver scans each')}
        {'\n'}4. {t('Receiver reviews changes and confirms merge')}
      </Text>
    </ScrollView>
  );
}
