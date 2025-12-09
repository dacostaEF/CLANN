/**
 * Tela de Frase de Recuperação
 * Mostra as 12 palavras e solicita confirmação do usuário
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function RecoveryPhraseScreen({ route, navigation }) {
  const { recoveryPhrase } = route.params;
  const words = recoveryPhrase.split(' ');
  const [confirmedWords, setConfirmedWords] = useState({});
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    // Seleciona 2 índices aleatórios para verificação
    const indices = [];
    while (indices.length < 2) {
      const index = Math.floor(Math.random() * words.length);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
    setSelectedIndices(indices.sort((a, b) => a - b));
  }, []);

  const copyPhrase = async () => {
    await Clipboard.setStringAsync(recoveryPhrase);
    Alert.alert('Copiado', 'Frase de recuperação copiada para a área de transferência.');
  };

  const handleWordConfirm = (index, word) => {
    const trimmedWord = word.trim().toLowerCase();
    if (trimmedWord === words[index].toLowerCase()) {
      setConfirmedWords({
        ...confirmedWords,
        [index]: trimmedWord,
      });
      // Limpa o input
      setInputValues({
        ...inputValues,
        [index]: '',
      });
    } else {
      Alert.alert('Palavra incorreta', 'A palavra digitada não corresponde. Tente novamente.');
    }
  };

  const handleContinue = () => {
    // Verifica se as palavras foram confirmadas corretamente
    const allConfirmed = selectedIndices.every(
      (index) => confirmedWords[index] === words[index]
    );

    if (!allConfirmed) {
      Alert.alert(
        'Verificação necessária',
        'Por favor, confirme as palavras corretamente antes de continuar.'
      );
      return;
    }

    // Navega para verificação completa da seed (Sprint 2)
    navigation.navigate('VerifySeed', { recoveryPhrase });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Frase de Recuperação</Text>
          <Text style={styles.subtitle}>
            Anote estas 12 palavras em um local seguro. Elas são necessárias para recuperar seu Totem.
          </Text>

          <View style={styles.phraseContainer}>
            {words.map((word, index) => (
              <View key={index} style={styles.wordBox}>
                <Text style={styles.wordNumber}>{index + 1}</Text>
                <Text style={styles.word}>{word}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={copyPhrase}
            activeOpacity={0.8}
          >
            <Ionicons name="copy-outline" size={20} color="#4a90e2" />
            <Text style={styles.copyButtonText}>Copiar frase</Text>
          </TouchableOpacity>

          <View style={styles.verificationContainer}>
            <Text style={styles.verificationTitle}>
              Confirme as palavras nas posições:
            </Text>
            {selectedIndices.map((index) => (
              <View key={index} style={styles.verificationRow}>
                <Text style={styles.verificationLabel}>
                  Palavra {index + 1}:
                </Text>
                <View style={styles.verificationInput}>
                  {confirmedWords[index] ? (
                    <View style={styles.confirmedWord}>
                      <Text style={styles.confirmedWordText}>
                        {confirmedWords[index]}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const newConfirmed = { ...confirmedWords };
                          delete newConfirmed[index];
                          setConfirmedWords(newConfirmed);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="#4a90e2" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.textInput}
                        value={inputValues[index] || ''}
                        onChangeText={(text) => {
                          setInputValues({
                            ...inputValues,
                            [index]: text,
                          });
                        }}
                        placeholder="Digite a palavra"
                        placeholderTextColor="#666"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onSubmitEditing={() => {
                          if (inputValues[index]) {
                            handleWordConfirm(index, inputValues[index]);
                          }
                        }}
                      />
                      <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => {
                          if (inputValues[index]) {
                            handleWordConfirm(index, inputValues[index]);
                          }
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={24} color="#4a90e2" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Confirmar que anotei</Text>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  phraseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  wordBox: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#0f0f1e',
    borderRadius: 8,
  },
  wordNumber: {
    fontSize: 12,
    color: '#4a90e2',
    marginRight: 8,
    fontWeight: '600',
    minWidth: 20,
  },
  word: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 32,
  },
  copyButtonText: {
    color: '#4a90e2',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  verificationContainer: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  verificationTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 16,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    width: 100,
  },
  verificationInput: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    color: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  confirmButton: {
    padding: 4,
  },
  confirmedWord: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f1e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  confirmedWordText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
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

