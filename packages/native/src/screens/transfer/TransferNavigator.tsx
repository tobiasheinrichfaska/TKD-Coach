import React, { useState } from 'react';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ParamListBase, RouteProp } from '@react-navigation/native';
import TransferScreen from './TransferScreen';
import SelectDataScreen from './SelectDataScreen';
import { TransferSelection } from '../../types';
import BidirectionalSenderScreen from './BidirectionalSenderScreen';
import BidirectionalReceiverScreen from './BidirectionalReceiverScreen';
import { COLORS } from '../../constants/colors';

type StackChildProps = {
  navigation: NativeStackNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase, string>;
};

const Stack = createNativeStackNavigator();

export default function TransferNavigator() {
  const [senderSelection, setSenderSelection] = useState<TransferSelection | null>(null);

  const handleSelectData = (selection: TransferSelection) => {
    setSenderSelection(selection);
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="TransferMain" component={TransferScreen} options={{ title: 'Transfer' }} />

      <Stack.Screen
        name="SelectData"
        options={{ title: 'Select Data', headerShown: false }}
      >
        {({ navigation }: StackChildProps) => (
          <SelectDataScreen
            onConfirm={(selection) => {
              handleSelectData(selection);
              navigation.navigate('Sender', { selection });
            }}
            onCancel={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Sender"
        options={{ title: 'Send Data', headerShown: false }}
      >
        {({ navigation, route }: StackChildProps) => {
          const routeSelection = (route.params as { selection?: TransferSelection } | undefined)?.selection;
          const effective = senderSelection || routeSelection;
          if (!effective) {
            // Defensive: should not happen because SelectData always navigates with a selection.
            navigation.popToTop();
            return null;
          }
          return (
            <BidirectionalSenderScreen
              selection={effective}
              onComplete={() => navigation.popToTop()}
              onCancel={() => navigation.popToTop()}
            />
          );
        }}
      </Stack.Screen>

      <Stack.Screen
        name="Receiver"
        options={{ title: 'Receive Data', headerShown: false }}
      >
        {({ navigation }: StackChildProps) => (
          <BidirectionalReceiverScreen
            onComplete={() => navigation.popToTop()}
            onCancel={() => navigation.popToTop()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
