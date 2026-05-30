import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';

import { DataProvider, useData } from './src/context/DataContext';
import { COLORS } from './src/constants/colors';

// Test: Import just GroupsNavigator
import GroupsNavigator from './src/screens/groups/GroupsNavigator';

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
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Groups" component={GroupsNavigator} />
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
