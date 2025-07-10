import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from './screens/ChatScreen';
import { RevenueCatProvider } from './utils/RevenueCatProvider';
import { AdsProvider } from './utils/AdsProvider';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <RevenueCatProvider>
      <AdsProvider>
        <NavigationContainer>
          <Stack.Navigator id="root">
            <Stack.Screen name="Chat" component={ChatScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AdsProvider>
    </RevenueCatProvider>
  );
}
