import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OtherDataHubScreen from './OtherDataHubScreen';
import { GamesListScreen, TechniquesListScreen, BodyPartsListScreen, TemplatesListScreen, MetricSchemasListScreen } from './OtherDataLists';
import type { OtherDataStackParamList } from '../../types/navigation';
import { COLORS } from '../../constants/colors';

const Stack = createNativeStackNavigator<OtherDataStackParamList>();

export default function OtherDataNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="OtherDataHub" component={OtherDataHubScreen} options={{ title: 'Other Data' }} />
      <Stack.Screen name="GamesList" component={GamesListScreen} options={{ title: 'Übungen' }} />
      <Stack.Screen name="TechniquesList" component={TechniquesListScreen} options={{ title: 'Techniques' }} />
      <Stack.Screen name="BodyPartsList" component={BodyPartsListScreen} options={{ title: 'Body parts & neuro' }} />
      <Stack.Screen name="TemplatesList" component={TemplatesListScreen} options={{ title: 'Session templates' }} />
      <Stack.Screen name="MetricSchemasList" component={MetricSchemasListScreen} options={{ title: 'Metric schemas' }} />
    </Stack.Navigator>
  );
}
