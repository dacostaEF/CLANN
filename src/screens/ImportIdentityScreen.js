/**
 * Tela de Importação de Identidade
 * Permite importar Totem a partir de backup criptografado
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { importTotemFromPicker } from '../backup/ImportTotem';
import { hasTotemSecure } from '../storage/secureStore';

export default function ImportIdentityScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  const handleImport = async () => {
    if (!pin || pin.length < 4) {
      Alert.alert('Atenção', 'Digite o PIN usado para criptografar o backup');
      return;
    }

    setLoading(true);
    try {
      // Verifica se já existe Totem
      const hasTotem = await hasTotemSecure();
      if (hasTotem) {
        Alert.alert(
          'Atenção',
          'Já existe um Totem configurado. A importação irá substituí-lo. Deseja continuar?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Continuar',
              style: 'destructive',
              onPress: async () => {
                await performImport();
              },
            },
          ]
        );
      } else {
        await performImport();
      }
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível importar o backup');
      setLoading(false);
    }
  };

  const performImport = async () => {
    try {
      const totem = await importTotemFromPicker(pin);
      
      Alert.alert(
        'Sucesso',
        `Totem "${totem.symbolicName}" importado com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            },
          },
        ]
      );
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
      setPin('');
      setShowPinInput(false);
    }
  };

  const handleSelectFile = () => {
    setShowPinInput(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Ionicons name="cloud-upload-outline" size={64} color="#4a90e2" />
              <Text style={styles.title}>Importar Identidade</Text>
              <Text style={styles.subtitle}>
                Restaure seu Totem a partir de um backup criptografado. Você precisará do PIN usado na exportação.
              </Text>
            </View>

            {!showPinInput ? (
              <>
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={24} color="#4a90e2" />
                  <Text style={styles.infoText}>
                    Selecione o arquivo de backup (.cln) e digite o PIN usado para criptografá-lo.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.importButton, loading && styles.importButtonDisabled]}
                  onPress={handleSelectFile}
                  disabled={loading}
                >
                  <Ionicons name="folder-open-outline" size={32} color="#ffffff" />
                  <Text style={styles.importButtonText}>Selecionar Arquivo</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.pinContainer}>
                  <Text style={styles.pinLabel}>Digite o PIN do backup:</Text>
                  <TextInput
                    style={styles.pinInput}
                    value={pin}
                    onChangeText={setPin}
                    placeholder="PIN (4-6 dígitos)"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={6}
                  />
                </View>

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setShowPinInput(false);
                      setPin('');
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.importButton, loading && styles.importButtonDisabled]}
                    onPress={handleImport}
                    disabled={loading || pin.length < 4}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.importButtonText}>Importar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    color: '#a0a0a0',
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  importButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  importButtonDisabled: {
    opacity: 0.5,
  },
  importButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  pinContainer: {
    marginBottom: 32,
  },
  pinLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
  },
  pinInput: {
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2a2a3e',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#2a2a3e',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

