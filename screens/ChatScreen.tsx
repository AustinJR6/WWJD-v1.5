import React, { useEffect, useState } from 'react';
import { View, FlatList, SafeAreaView } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import InputBar from '../components/InputBar';
import MessageBubble from '../components/MessageBubble';
import { askJesus } from '../services/openai';
import { increment } from '../utils/TokenTracker';
import { useAds } from '../utils/AdsProvider';
import { saveAuthToken } from '../utils/getToken';

interface Message {
  id: string;
  text: string;
  fromUser?: boolean;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { showAd } = useAds();

  const registerAnonymousUser = async () => {
    const res = await fetch('https://your-api.com/auth/anonymous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: Application.androidId || Device.osInternalBuildId,
      }),
    });
    const data = await res.json();
    if (data.token) {
      await saveAuthToken(data.token);
    }
  };

  useEffect(() => {
    registerAnonymousUser();
  }, []);

  const sendMessage = async (text: string) => {
    const userMessage: Message = { id: Date.now().toString(), text, fromUser: true };
    setMessages((m) => [...m, userMessage]);
    increment();
    showAd();
    try {
      const reply = await askJesus(text);
      const aiMessage: Message = { id: Date.now().toString() + '-ai', text: reply };
      setMessages((m) => [...m, aiMessage]);
    } catch (e) {
      setMessages((m) => [...m, { id: Date.now().toString() + '-err', text: 'Error fetching reply.' }]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble text={item.text} fromUser={item.fromUser} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
      />
      <InputBar onSend={sendMessage} />
    </SafeAreaView>
  );
}
