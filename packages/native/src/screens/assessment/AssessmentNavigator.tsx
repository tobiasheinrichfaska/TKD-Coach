import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AssessmentScreen from './AssessmentScreen';
import ProgressScreen from './ProgressScreen';
import { COLORS } from '../../constants/colors';

const Stack = createNativeStackNavigator();

export default function AssessmentNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="AssessmentList" component={AssessmentScreen} options={{ title: 'Log Assessment' }} />
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
    </Stack.Navigator>
  );
}
