import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTotem } from '../context/TotemContext';

export default function ProfileScreen() {
  const { totem, loading } = useTotem();

  const handleExportIdentity = () => {
    Alert.alert('Exportar Identidade', 'Funcionalidade em desenvolvimento');
  };

  const handleSecurityAudit = () => {
    Alert.alert('Auditoria de Segurança', 'Funcionalidade em desenvolvimento');
  };

  const handleBackup = () => {
    Alert.alert('Backup', 'Funcionalidade em desenvolvimento');
  };

  const handleShowRecoveryPhrase = () => {
    Alert.alert('Frase Secreta', 'Funcionalidade em desenvolvimento');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Carregando Totem...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!totem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Totem não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayTotemId = totem.totemId ? totem.totemId.substring(0, 8).toUpperCase() + '...' : 'N/A';
  const displayPublicKey = totem.publicKey 
    ? `${totem.publicKey.substring(0, 12)}...${totem.publicKey.substring(totem.publicKey.length - 12)}`
    : 'N/A';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil do Totem</Text>
          <Text style={styles.subtitle}>
            Informações da sua identidade digital
          </Text>
        </View>

        <View style={styles.totemCard}>
          <View style={styles.totemHeader}>
            <Text style={styles.totemIcon}>🛡️</Text>
            <Text style={styles.totemName}>{totem.symbolicName || 'Totem'}</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Totem ID:</Text>
              <Text style={styles.infoValue}>{displayTotemId}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Chave Pública:</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {displayPublicKey}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportIdentity}
          >
            <Text style={styles.actionButtonIcon}>📤</Text>
            <Text style={styles.actionButtonText}>Exportar Identidade</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSecurityAudit}
          >
            <Text style={styles.actionButtonIcon}>🔒</Text>
            <Text style={styles.actionButtonText}>Auditoria de Segurança</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBackup}
          >
            <Text style={styles.actionButtonIcon}>💾</Text>
            <Text style={styles.actionButtonText}>Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShowRecoveryPhrase}
          >
            <Text style={styles.actionButtonIcon}>🔑</Text>
            <Text style={styles.actionButtonText}>Mostrar Frase Secreta</Text>
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  totemCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333333',
  },
  totemHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totemIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  totemName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4a90e2',
  },
  infoSection: {
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999999',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});

