import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TransferScreen from './TransferScreen';
import { COLORS } from '../../constants/colors';

const Stack = createNativeStackNavigator();

export default function TransferNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.surface }, headerTitleStyle: { color: COLORS.text } }}>
      <Stack.Screen name="TransferMain" component={TransferScreen} options={{ title: 'Transfer' }} />
    </Stack.Navigator>
  );
}
