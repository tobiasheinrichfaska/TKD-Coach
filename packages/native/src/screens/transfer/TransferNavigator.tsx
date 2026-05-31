import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TransferScreen from './TransferScreen';
import SelectDataScreen from './SelectDataScreen';
import { TransferSelection } from '../../types';
import type { TransferStackParamList } from '../../types/navigation';
import BidirectionalSenderScreen from './BidirectionalSenderScreen';
import BidirectionalReceiverScreen from './BidirectionalReceiverScreen';
import { COLORS } from '../../constants/colors';

const Stack = createNativeStackNavigator<TransferStackParamList>();

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
        {({ navigation }) => (
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
        {({ navigation, route }) => {
          const effective = senderSelection || route.params.selection;
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
        {({ navigation }) => (
          <BidirectionalReceiverScreen
            onComplete={() => navigation.popToTop()}
            onCancel={() => navigation.popToTop()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
