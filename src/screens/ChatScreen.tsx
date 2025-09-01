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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { askJesus } from '../services/ai';
import { ensureAnon } from '../lib/anonAuth';
// Firebase REST auth initialized at startup

interface Message {
  id: string;
  text: string;
  fromUser?: boolean;
}

const colors = {
  bgTop: '#F8F5EC',
  bgMid: '#F1E6D0',
  bgBottom: '#E5D6B6',
  gold: '#C5A463',
  goldDeep: '#9E7F3C',
  halo: 'rgba(255, 235, 180, 0.35)',
  text: '#2A2A2A',
  textDim: '#5C5C5C',
  inputBg: 'rgba(255,255,255,0.85)',
  border: 'rgba(0,0,0,0.08)'
};

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
    <View style={{ flex: 1 }}>
      <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={StyleSheet.absoluteFill} />

      {/* Faint cross silhouette */}
      <View pointerEvents="none" style={styles.crossWrap}>
        <View style={styles.crossVertical} />
        <View style={styles.crossHorizontal} />
      </View>

      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        {/* Header with halo */}
        <View style={styles.headerWrap}>
          <BlurView intensity={20} style={styles.halo} />
          <Text style={styles.headerSmall}>Conversations</Text>
          <Text style={styles.headerLarge}>
            With <Text style={{ color: colors.goldDeep }}>Jesus</Text>
          </Text>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m, i) => String(m.id ?? i)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, 12),
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <BlurView intensity={20} style={styles.inputBar}>
              <View style={styles.inputInner}>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Share your heart…"
                  placeholderTextColor={colors.textDim}
                  style={styles.input}
                  multiline
                />
                <TouchableOpacity onPress={onSend} style={styles.sendBtn}>
                  <Text style={styles.sendIcon}>▷</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: { alignItems: 'center', paddingTop: 22, paddingBottom: 12 },
  halo: {
    position: 'absolute',
    top: 8,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.halo,
  },
  headerSmall: { fontSize: 14, letterSpacing: 1, color: colors.textDim },
  headerLarge: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowRadius: 6,
  },
  crossWrap: { position: 'absolute', top: '18%', left: 0, right: 0, alignItems: 'center', opacity: 0.09 },
  crossVertical: { width: 36, height: '52%', borderRadius: 18, backgroundColor: '#FFFFFF' },
  crossHorizontal: { position: 'absolute', top: '28%', width: '42%', height: 28, borderRadius: 14, backgroundColor: '#FFFFFF' },
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
  bubbleJesus: { backgroundColor: 'rgba(255,255,255,0.65)' },
  bubbleUser: { backgroundColor: '#ffffff' },
  label: { fontSize: 11, color: '#5C5C5C', marginBottom: 6 },
  bubbleText: { fontSize: 16, lineHeight: 22, color: '#2A2A2A' },
  inputBar: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  inputInner: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8 },
  input: { flex: 1, minHeight: 42, maxHeight: 120, fontSize: 16, color: colors.text, paddingTop: 8, paddingBottom: 8 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold, marginLeft: 8 },
  sendIcon: { fontSize: 18, color: '#FFF', fontWeight: '700' },
});
