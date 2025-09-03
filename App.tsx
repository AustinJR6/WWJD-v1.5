import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from './src/screens/ChatScreen';
import { RevenueCatProvider } from './utils/RevenueCatProvider';
import { useEffect } from 'react';
import { ensureAnon } from './src/lib/anonAuth';

type RootParamList = {
  Chat: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();

export default function App() {
  useEffect(() => {
    ensureAnon().catch((e) => console.warn('ensureAnon failed:', e?.message || e));
    if (__DEV__) {
      console.log('ENV firebase project:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
    }
  }, []);
  return (
    <RevenueCatProvider>
      <NavigationContainer>
        <Stack.Navigator id={undefined}>
          <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </RevenueCatProvider>
  );
}
