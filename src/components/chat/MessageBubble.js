import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatTheme } from '../../styles/chatTheme';

/**
 * Bolha de mensagem estilo WhatsApp/Telegram
 * Suporta mensagens enviadas e recebidas
 */
export default function MessageBubble({ 
  message, 
  isSent, 
  authorName, 
  timestamp,
  showAuthor = false,
  showAvatar = false 
}) {
  const formatTime = (ts) => {
    const date = new Date(ts);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <View style={[
      styles.container,
      isSent ? styles.containerSent : styles.containerReceived
    ]}>
      {/* Nome do autor (apenas para mensagens recebidas) */}
      {!isSent && showAuthor && authorName && (
        <Text style={styles.authorName}>{authorName}</Text>
      )}

      {/* Container da bolha */}
      <View style={[
        styles.bubble,
        isSent ? styles.bubbleSent : styles.bubbleReceived
      ]}>
        <Text style={[
          styles.messageText,
          isSent ? styles.messageTextSent : styles.messageTextReceived
        ]}>
          {message}
        </Text>

        {/* Timestamp e indicadores */}
        <View style={styles.footer}>
          <Text style={[
            styles.timestamp,
            isSent ? styles.timestampSent : styles.timestampReceived
          ]}>
            {formatTime(timestamp)}
          </Text>
          
          {/* Indicadores de leitura (apenas para mensagens enviadas) */}
          {isSent && (
            <View style={styles.checkmarks}>
              <Ionicons 
                name="checkmark-done" 
                size={14} 
                color={chatTheme.checkmarkRead} 
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '75%',
    marginBottom: 4,
    marginHorizontal: 16,
  },
  containerSent: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  containerReceived: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  authorName: {
    fontSize: 12,
    color: chatTheme.textSecondary,
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: chatTheme.borderRadius,
    shadowColor: chatTheme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: chatTheme.shadowOpacity,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleSent: {
    backgroundColor: chatTheme.bubbleSent,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: chatTheme.bubbleReceived,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTextSent: {
    color: '#FFFFFF',
  },
  messageTextReceived: {
    color: chatTheme.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  timestampSent: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timestampReceived: {
    color: chatTheme.textTertiary,
  },
  checkmarks: {
    marginLeft: 2,
  },
});

