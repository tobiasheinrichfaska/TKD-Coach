import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SessionsScreen from './SessionsScreen';
import { COLORS } from '../../constants/colors';

const Stack = createNativeStackNavigator();

export default function SessionsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.surface }, headerTitleStyle: { color: COLORS.text } }}>
      <Stack.Screen name="SessionsList" component={SessionsScreen} options={{ title: 'Sessions' }} />
    </Stack.Navigator>
  );
}
