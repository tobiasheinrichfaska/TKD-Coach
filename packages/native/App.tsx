import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { DataProvider, useData } from './src/context/DataContext';
import { COLORS } from './src/constants/colors';

// Import screen components (stubs for now)
import DashboardScreen from './src/screens/DashboardScreen';
import GroupsNavigator from './src/screens/groups/GroupsNavigator';
import SessionsNavigator from './src/screens/sessions/SessionsNavigator';
import AssessmentNavigator from './src/screens/assessment/AssessmentNavigator';
import TransferNavigator from './src/screens/transfer/TransferNavigator';

const Tab = createBottomTabNavigator();

function RootNavigator() {
  const { isLoaded } = useData();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
          },
          headerStyle: {
            backgroundColor: COLORS.surface,
            borderBottomColor: COLORS.border,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            color: COLORS.text,
            fontWeight: '600',
          },
        }}
      >
        {/* Dashboard Tab */}
        <Tab.Screen
          name="DashboardTab"
          component={DashboardScreen}
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color }) => <DashIcon color={color} />,
          }}
        />

        {/* Groups Tab */}
        <Tab.Screen
          name="GroupsTab"
          component={GroupsNavigator}
          options={{
            title: 'Groups',
            tabBarLabel: 'Gruppen',
            tabBarIcon: ({ color }) => <GroupIcon color={color} />,
            headerShown: false,
          }}
        />

        {/* Sessions Tab */}
        <Tab.Screen
          name="SessionsTab"
          component={SessionsNavigator}
          options={{
            title: 'Sessions',
            tabBarLabel: 'Sessions',
            tabBarIcon: ({ color }) => <SessionIcon color={color} />,
            headerShown: false,
          }}
        />

        {/* Assessment Tab */}
        <Tab.Screen
          name="AssessmentTab"
          component={AssessmentNavigator}
          options={{
            title: 'Assessment',
            tabBarLabel: 'Bewertung',
            tabBarIcon: ({ color }) => <AssessmentIcon color={color} />,
            headerShown: false,
          }}
        />

        {/* Transfer Tab */}
        <Tab.Screen
          name="TransferTab"
          component={TransferNavigator}
          options={{
            title: 'Transfer',
            tabBarLabel: 'Übertrag',
            tabBarIcon: ({ color }) => <TransferIcon color={color} />,
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <RootNavigator />
      </DataProvider>
    </SafeAreaProvider>
  );
}

// Simple icon components (emoji-based for now, can be replaced with proper icons later)
function DashIcon({ color }: { color: string }) {
  return <View style={{ fontSize: 24, color }}></View>;
}

function GroupIcon({ color }: { color: string }) {
  return <View style={{ fontSize: 24, color }}></View>;
}

function SessionIcon({ color }: { color: string }) {
  return <View style={{ fontSize: 24, color }}></View>;
}

function AssessmentIcon({ color }: { color: string }) {
  return <View style={{ fontSize: 24, color }}></View>;
}

function TransferIcon({ color }: { color: string }) {
  return <View style={{ fontSize: 24, color }}></View>;
}
