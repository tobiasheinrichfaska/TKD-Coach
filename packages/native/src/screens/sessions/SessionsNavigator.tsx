import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SessionsScreen from './SessionsScreen';
import PlanSessionScreen from './PlanSessionScreen';
import RunSessionScreen from './RunSessionScreen';
import RecentSessionsScreen from './RecentSessionsScreen';
import SessionArchiveScreen from './SessionArchiveScreen';
import SessionDetailScreen from './SessionDetailScreen';
import type { SessionsStackParamList } from '../../types/navigation';
import { COLORS } from '../../constants/colors';
import { useT } from '../../i18n';

const Stack = createNativeStackNavigator<SessionsStackParamList>();

export default function SessionsNavigator() {
  const { t } = useT();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="SessionsList" component={SessionsScreen} options={{ title: t('Sessions') }} />
      <Stack.Screen name="PlanSession" component={PlanSessionScreen} options={{ title: t('Plan Session'), presentation: 'modal' }} />
      <Stack.Screen name="RunSession" component={RunSessionScreen} options={{ title: t('Running Session') }} />
      <Stack.Screen name="RecentSessions" component={RecentSessionsScreen} options={{ title: t('Recent Sessions') }} />
      <Stack.Screen name="SessionArchive" component={SessionArchiveScreen} options={{ title: t('Archive') }} />
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: t('Session') }} />
    </Stack.Navigator>
  );
}
