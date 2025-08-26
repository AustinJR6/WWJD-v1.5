import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from './src/screens/ChatScreen';
import { RevenueCatProvider } from './utils/RevenueCatProvider';
import { AdsProvider } from './utils/AdsProvider';

type RootParamList = {
  Chat: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();

export default function App() {
  return (
    <RevenueCatProvider>
      <AdsProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Chat" component={ChatScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AdsProvider>
    </RevenueCatProvider>
  );
}
