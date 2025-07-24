import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from './screens/ChatScreen';
import AuthScreen from './screens/AuthScreen';
import { RevenueCatProvider } from './utils/RevenueCatProvider';
import { AdsProvider } from './utils/AdsProvider';

export type RootStackParamList = {
  Auth: undefined;
  Chat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();


export default function App() {
  return (
    <RevenueCatProvider>
      <AdsProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Auth">
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AdsProvider>
    </RevenueCatProvider>
  );
}
