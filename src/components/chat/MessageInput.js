import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatTheme } from '../../styles/chatTheme';

/**
 * Campo de entrada de mensagem estilo WhatsApp
 * Com ícones de anexo, microfone e envio
 */
export default function MessageInput({ 
  value, 
  onChangeText, 
  onSend, 
  placeholder = "Digite uma mensagem…" 
}) {
  const [isFocused, setIsFocused] = useState(false);

  const hasText = value && value.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused
      ]}>
        {/* Ícone de anexo */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            // Funcionalidade de anexo em desenvolvimento
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name="attach" 
            size={24} 
            color={chatTheme.textSecondary} 
          />
        </TouchableOpacity>

        {/* Campo de texto */}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={chatTheme.textTertiary}
          multiline
          maxLength={5000}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="send"
          onSubmitEditing={hasText ? onSend : undefined}
        />

        {/* Botão de envio ou microfone */}
        {hasText ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={onSend}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              // Funcionalidade de gravação de áudio em desenvolvimento
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="mic" 
              size={24} 
              color={chatTheme.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: chatTheme.inputBackground,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: chatTheme.separatorColor,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: chatTheme.background,
    borderRadius: chatTheme.borderRadius,
    borderWidth: 1,
    borderColor: chatTheme.inputBorder,
    paddingHorizontal: 4,
    paddingVertical: 6,
    minHeight: 44,
    maxHeight: 120,
  },
  inputContainerFocused: {
    borderColor: chatTheme.bubbleSent,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: chatTheme.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    maxHeight: 100,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: chatTheme.bubbleSent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});

