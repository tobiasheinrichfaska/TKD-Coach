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

const Stack = createNativeStackNavigator<GroupsStackParamList>();

export default function GroupsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen
        name="HumansHub"
        component={HumansHubScreen}
        options={{ title: 'Humans' }}
      />
      <Stack.Screen
        name="GroupsList"
        component={GroupsScreen}
        options={{ title: 'Gruppen' }}
      />
      <Stack.Screen
        name="AllAthletes"
        component={AllAthletesScreen}
        options={{ title: 'Alle Athleten' }}
      />
      <Stack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{ title: 'Notfallkontakte' }}
      />
      <Stack.Screen
        name="EditEmergencyContact"
        component={EditEmergencyContactScreen}
        options={{ title: 'Kontakt bearbeiten' }}
      />
      <Stack.Screen
        name="AddContact"
        component={AddContactScreen}
        options={{ title: 'Kontakt hinzufügen' }}
      />
      <Stack.Screen
        name="Assessment"
        component={AssessmentNavigator}
        options={{ title: 'Assessment', headerShown: false }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{ title: 'Gruppe' }}
      />
      <Stack.Screen
        name="EditGroup"
        component={EditGroupScreen}
        options={{ title: 'Gruppe bearbeiten' }}
      />
      <Stack.Screen
        name="AthleteDetail"
        component={AthleteDetailScreen}
        options={{ title: 'Athlet' }}
      />
      <Stack.Screen
        name="EditAthlete"
        component={EditAthleteScreen}
        options={{ title: 'Athlet bearbeiten' }}
      />
    </Stack.Navigator>
  );
}
