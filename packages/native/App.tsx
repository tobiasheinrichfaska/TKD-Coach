import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';

import { DataProvider, useData } from './src/context/DataContext';
import { LanguageProvider, useT } from './src/i18n';
import { COLORS } from './src/constants/colors';
import type { RootTabParamList } from './src/types/navigation';

import DashboardScreen from './src/screens/DashboardScreen';
import HumansNavigator from './src/screens/groups/GroupsNavigator';
import SessionsNavigator from './src/screens/sessions/SessionsNavigator';
import OtherDataNavigator from './src/screens/otherdata/OtherDataNavigator';
import SettingsNavigator from './src/screens/settings/SettingsNavigator';

const Tab = createBottomTabNavigator<RootTabParamList>();

function RootNavigator() {
  const { isLoaded } = useData();
  const { t } = useT();

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
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('Dashboard') }} />
        {/* popToTopOnBlur: leaving the Sessions tab returns it to the list (not the last
            run/detail). The running session is persisted, so Resume re-opens it. */}
        <Tab.Screen name="Sessions" component={SessionsNavigator} options={{ title: t('Sessions'), popToTopOnBlur: true }} />
        <Tab.Screen name="Humans" component={HumansNavigator} options={{ title: t('Humans') }} />
        <Tab.Screen name="OtherData" component={OtherDataNavigator} options={{ title: t('Other Data') }} />
        <Tab.Screen name="Settings" component={SettingsNavigator} options={{ title: t('Settings') }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <DataProvider>
          <RootNavigator />
        </DataProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
