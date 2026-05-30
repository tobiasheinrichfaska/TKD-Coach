import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TransferScreen from './TransferScreen';
import SendQRScreen from './SendQRScreen';
import ReceiveQRScreen from './ReceiveQRScreen';
import { COLORS } from '../../constants/colors';

const Stack = createNativeStackNavigator();

export default function TransferNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="TransferMain" component={TransferScreen} options={{ title: 'Transfer' }} />
      <Stack.Screen name="SendQR" component={SendQRScreen} options={{ title: 'Send Data' }} />
      <Stack.Screen name="ReceiveQR" component={ReceiveQRScreen} options={{ title: 'Receive Data' }} />
    </Stack.Navigator>
  );
}
