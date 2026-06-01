import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OtherDataHubScreen from './OtherDataHubScreen';
import { GamesListScreen, TechniquesListScreen, BodyPartsListScreen, TemplatesListScreen, MetricSchemasListScreen } from './OtherDataLists';
import { EditGameScreen, EditTechniqueScreen, EditBodyPartScreen, EditTemplateScreen, EditMetricSchemaScreen } from './OtherDataEditors';
import type { OtherDataStackParamList } from '../../types/navigation';
import { COLORS } from '../../constants/colors';
import { useT } from '../../i18n';

const Stack = createNativeStackNavigator<OtherDataStackParamList>();

export default function OtherDataNavigator() {
  const { t } = useT();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="OtherDataHub" component={OtherDataHubScreen} options={{ title: t('Other Data') }} />
      <Stack.Screen name="GamesList" component={GamesListScreen} options={{ title: t('Exercises') }} />
      <Stack.Screen name="TechniquesList" component={TechniquesListScreen} options={{ title: t('Techniques') }} />
      <Stack.Screen name="BodyPartsList" component={BodyPartsListScreen} options={{ title: t('Body parts & neuro') }} />
      <Stack.Screen name="TemplatesList" component={TemplatesListScreen} options={{ title: t('Session templates') }} />
      <Stack.Screen name="MetricSchemasList" component={MetricSchemasListScreen} options={{ title: t('Metric schemas') }} />
      <Stack.Screen name="EditGame" component={EditGameScreen} options={{ title: t('Exercise') }} />
      <Stack.Screen name="EditTechnique" component={EditTechniqueScreen} options={{ title: t('Technique') }} />
      <Stack.Screen name="EditBodyPart" component={EditBodyPartScreen} options={{ title: t('Body part') }} />
      <Stack.Screen name="EditTemplate" component={EditTemplateScreen} options={{ title: t('Template') }} />
      <Stack.Screen name="EditMetricSchema" component={EditMetricSchemaScreen} options={{ title: t('Metric schema') }} />
    </Stack.Navigator>
  );
}
