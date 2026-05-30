import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TransferScreen from './TransferScreen';
import SelectDataScreen from './SelectDataScreen';
import { TransferSelection } from '../../types';
import BidirectionalSenderScreen from './BidirectionalSenderScreen';
import BidirectionalReceiverScreen from './BidirectionalReceiverScreen';
import { COLORS } from '../../constants/colors';

const Stack = createNativeStackNavigator();

export default function TransferNavigator() {
  const [senderSelection, setSenderSelection] = useState<TransferSelection | null>(null);

  const handleSelectData = (selection: TransferSelection) => {
    setSenderSelection(selection);
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="TransferMain" component={TransferScreen} options={{ title: 'Transfer' }} />

      <Stack.Screen
        name="SelectData"
        options={{ title: 'Select Data', headerShown: false }}
      >
        {({ navigation, route }: any) => (
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
        {({ navigation, route }: any) => (
          <BidirectionalSenderScreen
            selection={senderSelection || route.params?.selection}
            onComplete={() => navigation.popToTop()}
            onCancel={() => navigation.popToTop()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Receiver"
        options={{ title: 'Receive Data', headerShown: false }}
      >
        {({ navigation }: any) => (
          <BidirectionalReceiverScreen
            onComplete={() => navigation.popToTop()}
            onCancel={() => navigation.popToTop()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
