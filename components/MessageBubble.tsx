import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  text: string;
  fromUser?: boolean;
}

const MessageBubble: React.FC<Props> = ({ text, fromUser }) => {
  return (
    <View style={[styles.bubble, fromUser ? styles.user : styles.ai]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default MessageBubble;

const styles = StyleSheet.create({
  bubble: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 12,
    maxWidth: '80%',
  },
  ai: {
    backgroundColor: '#fff9e5',
    alignSelf: 'flex-start',
  },
  user: {
    backgroundColor: '#e0f0ff',
    alignSelf: 'flex-end',
  },
  text: {
    fontSize: 16,
  },
});
