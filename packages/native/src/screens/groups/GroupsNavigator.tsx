import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupsScreen from './GroupsScreen';
import GroupDetailScreen from './GroupDetailScreen';
import EditGroupScreen from './EditGroupScreen';
import AthleteDetailScreen from './AthleteDetailScreen';
import EditAthleteScreen from './EditAthleteScreen';
import { COLORS } from '../../constants/colors';

const Stack = createNativeStackNavigator();

export default function GroupsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen
        name="GroupsList"
        component={GroupsScreen}
        options={{ title: 'Gruppen' }}
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
