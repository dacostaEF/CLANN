/**
 * Tela de Geração do Totem
 * Mostra as informações do Totem gerado
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { generateTotem } from '../../crypto/totem';
import { saveTotemSecure } from '../../storage/secureStore';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function TotemGenerationScreen({ navigation }) {
  const [totem, setTotem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateTotemData();
  }, []);

  const generateTotemData = async () => {
    try {
      setLoading(true);
      const newTotem = generateTotem();
      setTotem(newTotem);
      
      // Salva o Totem de forma segura
      await saveTotemSecure(newTotem);
      setLoading(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o Totem. Tente novamente.');
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copiado', `${label} copiado para a área de transferência.`);
  };

  const handleContinue = () => {
    navigation.navigate('RecoveryPhrase', { recoveryPhrase: totem.recoveryPhrase });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Gerando seu Totem...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!totem) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Seu Totem foi criado!</Text>

          <View style={styles.totemCard}>
            <View style={styles.totemHeader}>
              <Ionicons name="shield" size={48} color="#4a90e2" />
              <Text style={styles.totemName}>{totem.symbolicName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID:</Text>
              <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{totem.totemId.substring(0, 4).toUpperCase()}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(totem.totemId, 'ID do Totem')}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={20} color="#4a90e2" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Chave Pública:</Text>
              <View style={styles.infoValueContainer}>
                <Text style={styles.publicKey} numberOfLines={1} ellipsizeMode="middle">
                  {totem.publicKey.substring(0, 12)}...{totem.publicKey.substring(totem.publicKey.length - 12)}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(totem.publicKey, 'Chave pública')}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={20} color="#4a90e2" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Ver frase de recuperação</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a0a0a0',
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
  },
  totemCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  totemHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  totemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginTop: 12,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  infoLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    flex: 1,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  infoValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 8,
  },
  publicKey: {
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'monospace',
    marginRight: 8,
    flex: 1,
    textAlign: 'right',
  },
  copyButton: {
    padding: 4,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});





