import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsHubScreen from './SettingsHubScreen';
import TransferNavigator from '../transfer/TransferNavigator';
import { useT } from '../../i18n';
import type { SettingsStackParamList } from '../../types/navigation';
import { COLORS } from '../../constants/colors';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  const { t } = useT();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="SettingsHub" component={SettingsHubScreen} options={{ title: t('Settings') }} />
      <Stack.Screen name="Transfer" component={TransferNavigator} options={{ title: t('Transfer'), headerShown: false }} />
    </Stack.Navigator>
  );
}
