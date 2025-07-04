import * as SecureStore from 'expo-secure-store';

export const getAuthToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync('authToken');
};

export const saveAuthToken = async (token: string) => {
  await SecureStore.setItemAsync('authToken', token);
};
