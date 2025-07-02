import React, { useState } from 'react';
import { View, FlatList, SafeAreaView } from 'react-native';
import InputBar from '../components/InputBar';
import MessageBubble from '../components/MessageBubble';
import { askJesus } from '../utils/OpenAI';
import { increment } from '../utils/TokenTracker';
import { useAds } from '../utils/AdsProvider';

interface Message {
  id: string;
  text: string;
  fromUser?: boolean;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { showAd } = useAds();

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
