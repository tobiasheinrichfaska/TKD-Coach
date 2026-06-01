import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HumansHubScreen from './HumansHubScreen';
import GroupsScreen from './GroupsScreen';
import AllAthletesScreen from './AllAthletesScreen';
import AssessmentNavigator from '../assessment/AssessmentNavigator';
import EmergencyContactsScreen from './EmergencyContactsScreen';
import EditEmergencyContactScreen from './EditEmergencyContactScreen';
import AddContactScreen from './AddContactScreen';
import GroupDetailScreen from './GroupDetailScreen';
import EditGroupScreen from './EditGroupScreen';
import AthleteDetailScreen from './AthleteDetailScreen';
import EditAthleteScreen from './EditAthleteScreen';
import type { GroupsStackParamList } from '../../types/navigation';
import { COLORS } from '../../constants/colors';
import { useT } from '../../i18n';

const Stack = createNativeStackNavigator<GroupsStackParamList>();

export default function GroupsNavigator() {
  const { t } = useT();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="HumansHub" component={HumansHubScreen} options={{ title: t('Humans') }} />
      <Stack.Screen name="GroupsList" component={GroupsScreen} options={{ title: t('Groups') }} />
      <Stack.Screen name="AllAthletes" component={AllAthletesScreen} options={{ title: t('All Athletes') }} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} options={{ title: t('Emergency contacts') }} />
      <Stack.Screen name="EditEmergencyContact" component={EditEmergencyContactScreen} options={{ title: t('Edit contact') }} />
      <Stack.Screen name="AddContact" component={AddContactScreen} options={{ title: t('Add contact') }} />
      <Stack.Screen name="Assessment" component={AssessmentNavigator} options={{ title: t('Assessment'), headerShown: false }} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: t('Group') }} />
      <Stack.Screen name="EditGroup" component={EditGroupScreen} options={{ title: t('Edit group') }} />
      <Stack.Screen name="AthleteDetail" component={AthleteDetailScreen} options={{ title: t('Athlete') }} />
      <Stack.Screen name="EditAthlete" component={EditAthleteScreen} options={{ title: t('Edit athlete') }} />
    </Stack.Navigator>
  );
}
