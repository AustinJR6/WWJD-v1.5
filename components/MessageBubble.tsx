import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  text: string;
  fromUser?: boolean;
}

export default function MessageBubble({ text, fromUser }: Props) {
  return (
    <View style={[styles.bubble, fromUser ? styles.user : styles.ai]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: '80%',
  },
  ai: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  user: {
    backgroundColor: '#cfe9ff',
    alignSelf: 'flex-end',
  },
  text: {
    fontSize: 16,
  },
});
