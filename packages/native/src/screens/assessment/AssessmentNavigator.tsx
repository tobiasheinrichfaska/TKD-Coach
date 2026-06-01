import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AssessmentScreen from './AssessmentScreen';
import ProgressScreen from './ProgressScreen';
import type { AssessmentStackParamList } from '../../types/navigation';
import { COLORS } from '../../constants/colors';
import { useT } from '../../i18n';

const Stack = createNativeStackNavigator<AssessmentStackParamList>();

export default function AssessmentNavigator() {
  const { t } = useT();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="AssessmentList" component={AssessmentScreen} options={{ title: t('Log assessment') }} />
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: t('Progress') }} />
    </Stack.Navigator>
  );
}
