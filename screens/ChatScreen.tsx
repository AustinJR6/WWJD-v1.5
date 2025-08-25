import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import InputBar from '../components/InputBar';
import MessageBubble from '../components/MessageBubble';
import { askJesus } from '../services/ai';
import { increment } from '../utils/TokenTracker';
import { useAds } from '../utils/AdsProvider';
import { signInAnon } from '../utils/auth';

interface Message {
  id: string;
  text: string;
  fromUser?: boolean;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { showAd } = useAds();

  useEffect(() => {
    signInAnon();
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

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={60}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              text={m.text}
              fromUser={m.fromUser}
            />
          ))}
        </ScrollView>
        <InputBar onSend={sendMessage} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fdfaf6',
  },
  container: {
    flex: 1,
  },
  messages: {
    flexGrow: 1,
    padding: 10,
  },
});
