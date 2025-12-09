import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClanChatScreen() {
  const messages = []; // Lista vazia

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nome do CLANN</Text>
      </View>

      {/* Área de mensagens vazia */}
      <View style={styles.messagesContainer}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Chat será ativado no Sprint 4
          </Text>
        </View>
      </View>

      {/* Campo de digitação desativado */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mensagem..."
          placeholderTextColor="#666666"
          editable={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
});


