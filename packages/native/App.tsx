import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';

import { DataProvider, useData } from './src/context/DataContext';
import { COLORS } from './src/constants/colors';
import type { RootTabParamList } from './src/types/navigation';

import DashboardScreen from './src/screens/DashboardScreen';
import HumansNavigator from './src/screens/groups/GroupsNavigator';
import SessionsNavigator from './src/screens/sessions/SessionsNavigator';
import OtherDataNavigator from './src/screens/otherdata/OtherDataNavigator';
import TransferNavigator from './src/screens/transfer/TransferNavigator';

const Tab = createBottomTabNavigator<RootTabParamList>();

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
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Sessions" component={SessionsNavigator} />
        <Tab.Screen name="Humans" component={HumansNavigator} />
        <Tab.Screen name="OtherData" component={OtherDataNavigator} options={{ title: 'Other Data' }} />
        <Tab.Screen name="Transfer" component={TransferNavigator} />
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
