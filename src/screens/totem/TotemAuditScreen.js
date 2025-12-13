import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { loadTotemSecure } from '../../storage/secureStore';
import { validateTotem } from '../../crypto/totem';

export default function TotemAuditScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState({
    totemExists: false,
    keysPresent: false,
    signatureValid: false,
    storageConsistent: false,
  });

  useEffect(() => {
    performIntegrityCheck();
  }, []);

  const performIntegrityCheck = async () => {
    setLoading(true);
    try {
      // 1. Verificar se Totem existe
      const totem = await loadTotemSecure();
      const totemExists = totem !== null;

      if (!totem) {
        setChecks({
          totemExists: false,
          keysPresent: false,
          signatureValid: false,
          storageConsistent: false,
        });
        setLoading(false);
        return;
      }

      // 2. Verificar se chaves estão presentes
      const keysPresent = !!(totem.privateKey && totem.publicKey && totem.totemId);

      // 3. Verificar assinatura íntegra (derivar publicKey de privateKey)
      const signatureValid = validateTotem(totem);

      // 4. Verificar storage consistente (recarregar e comparar)
      const reloadedTotem = await loadTotemSecure();
      const storageConsistent = reloadedTotem !== null && 
                                reloadedTotem.totemId === totem.totemId &&
                                reloadedTotem.privateKey === totem.privateKey;

      setChecks({
        totemExists,
        keysPresent,
        signatureValid,
        storageConsistent,
      });
    } catch (error) {
      console.error('Erro ao verificar integridade:', error);
      setChecks({
        totemExists: false,
        keysPresent: false,
        signatureValid: false,
        storageConsistent: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const allChecksPassed = Object.values(checks).every(check => check === true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Verificação de Integridade</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.emoji}>{allChecksPassed ? '✅' : '⚠️'}</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#4a90e2" />
          ) : (
            <>
              <Text style={styles.statusTitle}>
                {allChecksPassed ? 'Totem Íntegro' : 'Verificação Incompleta'}
              </Text>
              <Text style={styles.subtitle}>
                {allChecksPassed 
                  ? 'Seu Totem está funcionando corretamente e todas as verificações passaram.'
                  : 'Algumas verificações falharam. Verifique os detalhes abaixo.'}
              </Text>

              <View style={styles.checksContainer}>
                <CheckItem
                  label="Totem encontrado"
                  passed={checks.totemExists}
                  description="Totem existe no armazenamento seguro"
                />
                <CheckItem
                  label="Chaves presentes"
                  passed={checks.keysPresent}
                  description="Chave privada e pública estão presentes"
                />
                <CheckItem
                  label="Assinatura íntegra"
                  passed={checks.signatureValid}
                  description="Chave pública deriva corretamente da chave privada"
                />
                <CheckItem
                  label="Storage consistente"
                  passed={checks.storageConsistent}
                  description="Dados do Totem são consistentes no armazenamento"
                />
              </View>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={performIntegrityCheck}
              >
                <Ionicons name="refresh-outline" size={20} color="#4a90e2" />
                <Text style={styles.refreshButtonText}>Verificar Novamente</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CheckItem({ label, passed, description }) {
  return (
    <View style={styles.checkItem}>
      <View style={styles.checkItemHeader}>
        <Ionicons
          name={passed ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={passed ? '#4ade80' : '#f87171'}
        />
        <Text style={styles.checkLabel}>{label}</Text>
      </View>
      <Text style={styles.checkDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
  },
  subtitle: {
    fontSize: 18,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  listContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  listText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  checksContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginTop: 24,
    marginBottom: 24,
  },
  checkItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  checkItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  checkDescription: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 36,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a90e2',
  },
});

