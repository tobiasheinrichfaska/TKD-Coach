import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SessionsScreen from './SessionsScreen';
import PlanSessionScreen from './PlanSessionScreen';
import RunSessionScreen from './RunSessionScreen';
import type { SessionsStackParamList } from '../../types/navigation';
import { COLORS } from '../../constants/colors';

const Stack = createNativeStackNavigator<SessionsStackParamList>();

export default function SessionsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="SessionsList" component={SessionsScreen} options={{ title: 'Sessions' }} />
      <Stack.Screen
        name="PlanSession"
        component={PlanSessionScreen}
        options={{ title: 'Plan Session', presentation: 'modal' }}
      />
      <Stack.Screen
        name="RunSession"
        component={RunSessionScreen}
        options={{ title: 'Running Session' }}
      />
    </Stack.Navigator>
  );
}
