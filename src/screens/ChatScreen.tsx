import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { askJesus } from '../services/ai';
import { ensureAnon } from '../lib/anonAuth';
// Firebase REST auth initialized at startup

interface Message {
  id: string;
  text: string;
  fromUser?: boolean;
}

const BG = '#f9f5e9';
const ACCENT = '#d9c7a0';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    ensureAnon().catch(console.warn);
  }, []);
  const listRef = useRef<FlatList<Message>>(null);

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: Date.now().toString(), text: trimmed, fromUser: true };
    setMessages((m) => [...m, userMsg]);
    setText('');
    try {
      const reply = await askJesus(trimmed);
      const aiMsg: Message = { id: Date.now().toString() + '-ai', text: reply, fromUser: false };
      setMessages((m) => [...m, aiMsg]);
    } catch (e: any) {
      const errMsg = typeof e?.message === 'string' ? e.message : 'Error fetching reply.';
      console.warn('askJesus failed:', e);
      setMessages((m) => [...m, { id: Date.now().toString() + '-err', text: errMsg }]);
    }
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const prev = messages[index - 1];
    const isFirstOfBlock = !prev || !!prev.fromUser !== !!item.fromUser;
    const isJesus = !item.fromUser;
    return (
      <View style={[styles.row, isJesus ? styles.rowLeft : styles.rowRight]}>
        <View style={[styles.bubble, isJesus ? styles.bubbleJesus : styles.bubbleUser]}>
          {isFirstOfBlock && (
            <Text style={styles.label}>{isJesus ? 'Jesus' : 'You'}</Text>
          )}
          <Text style={styles.bubbleText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    // Scroll to end on new messages
    listRef.current?.scrollToEnd?.({ animated: true });
  }, [messages.length]);

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Header matching background */}
      <View style={{ backgroundColor: BG, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#6b5d3a' }}>Conversations With Jesus</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m, i) => String(m.id ?? i)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}
        style={{ backgroundColor: BG }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View
          style={{
            backgroundColor: BG,
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 12),
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Share your heart…"
            placeholderTextColor="#9a8f75"
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 10,
              elevation: 1,
            }}
            multiline
          />
          <TouchableOpacity
            onPress={onSend}
            style={{ backgroundColor: ACCENT, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 }}
          >
            <Text style={{ fontWeight: '700', color: '#4b3f25' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { marginVertical: 6, flexDirection: 'row' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '82%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    backgroundColor: '#ffffff',
  },
  bubbleJesus: { backgroundColor: 'rgba(255,255,255,0.9)' },
  bubbleUser: { backgroundColor: '#ffffff' },
  label: { fontSize: 11, color: '#5C5C5C', marginBottom: 6 },
  bubbleText: { fontSize: 16, lineHeight: 22, color: '#2A2A2A' },
});
