import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AssessmentScreen from './AssessmentScreen';
import { COLORS } from '../../constants/colors';

const Stack = createNativeStackNavigator();

export default function AssessmentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.surface }, headerTitleStyle: { color: COLORS.text } }}>
      <Stack.Screen name="AssessmentList" component={AssessmentScreen} options={{ title: 'Assessment' }} />
    </Stack.Navigator>
  );
}
