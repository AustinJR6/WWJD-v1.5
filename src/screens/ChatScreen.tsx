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
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ensureAnon } from '../lib/anonAuth';

interface Message {
  id: string;
  text: string;
  fromUser?: boolean;
}

const colors = {
  bgGradientStart: '#0a192f',
  bgGradientEnd: '#172a45',
  header: '#0a192f',
  title: '#ffaf42', // Light orange
  userBubble: '#2c3e50',
  jesusBubble: '#3498db',
  bubbleText: '#ffffff',
  inputBg: '#1e3048',
  inputText: '#ffffff',
  sendButton: '#ffaf42',
  sendButtonText: '#0a192f',
  lightBurst: 'rgba(52, 152, 219, 0.1)',
};

const API_URL =
  process.env.EXPO_PUBLIC_CLOUD_RUN_URL ?? 'https://askjesus-y54eeumzaq-uc.a.run.app';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    ensureAnon().catch(console.warn);
  }, []);
  const listRef = useRef<FlatList<Message>>(null);

  const addMessage = (msg: Message) => setMessages((m) => [...m, msg]);

  const ask = async (userText: string) => {
    try {
      const resp = await fetch(`${API_URL}/askJesus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug': '1',
        },
        body: JSON.stringify({ message: userText }),
      });

      const rawText = await resp.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        /* keep as text */
      }

      if (!resp.ok) {
        console.log('ASK HTTP ERROR:', resp.status, rawText);
        const errMsg =
          (data && data.error) || `Error ${resp.status}: ${rawText?.slice(0, 200)}`;
        addMessage({
          id: Date.now().toString() + '-err',
          text: errMsg,
          fromUser: false,
        });
        return;
      }

      let assistantText: string | undefined = data?.text;

      if (!assistantText && data?.candidates?.[0]?.content?.parts) {
        assistantText = data.candidates[0].content.parts
          .map((p: any) => p?.text ?? '')
          .join('')
          .trim();
      }

      if (!assistantText) assistantText = 'Sorry—I couldn’t generate a reply just now.';
      addMessage({ id: Date.now().toString() + '-ai', text: assistantText, fromUser: false });
    } catch (e: any) {
      console.log('ASK EXCEPTION:', e);
      addMessage({
        id: Date.now().toString() + '-err',
        text: `Network error: ${e?.message || e}`,
        fromUser: false,
      });
    }
  };

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: Date.now().toString(), text: trimmed, fromUser: true };
    addMessage(userMsg);
    setText('');
    await ask(trimmed);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isJesus = !item.fromUser;
    return (
      <View style={[styles.row, isJesus ? styles.rowLeft : styles.rowRight]}>
        <View style={[styles.bubble, isJesus ? styles.bubbleJesus : styles.bubbleUser]}>
          <Text style={styles.bubbleText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    listRef.current?.scrollToEnd?.({ animated: true });
  }, [messages.length]);

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.bgGradientStart, colors.bgGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.lightBurst1} />
      <View style={styles.lightBurst2} />
      <View style={styles.lightBurst3} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>WWJD</Text>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m, i) => String(m.id ?? i)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
          <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 12 }]}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Share your heart…"
              placeholderTextColor="#9ab"
              style={styles.input}
              multiline
            />
            <TouchableOpacity onPress={onSend} style={styles.sendBtn}>
              <Text style={styles.sendIcon}>▲</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgGradientStart,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.header,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'serif', // An elegant font
    color: colors.title,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  row: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 20,
  },
  bubbleJesus: {
    backgroundColor: colors.jesusBubble,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.bubbleText,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: colors.inputBg,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    fontSize: 16,
    color: colors.inputText,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 16,
    borderRadius: 21,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sendButton,
    marginLeft: 8,
  },
  sendIcon: {
    fontSize: 18,
    color: colors.sendButtonText,
    fontWeight: '700',
    transform: [{ translateY: -1 }],
  },
  lightBurst1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: '10%',
    left: '-20%',
    backgroundColor: colors.lightBurst,
  },
  lightBurst2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: '50%',
    right: '-30%',
    backgroundColor: colors.lightBurst,
  },
  lightBurst3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: '5%',
    left: '20%',
    backgroundColor: colors.lightBurst,
  },
});
