import React, { useState, useEffect } from 'react';
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
import { useRoute } from '@react-navigation/native';
import QRCodeSVG from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import ClanStorage from '../clans/ClanStorage';

export default function ClanInviteScreen() {
  const route = useRoute();
  const { clanId } = route.params || {};
  
  const [clan, setClan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClanData();
  }, [clanId]);

  const loadClanData = async () => {
    if (!clanId) {
      Alert.alert('Erro', 'ID do CLANN não fornecido');
      setLoading(false);
      return;
    }

    try {
      const clanData = await ClanStorage.getClanById(clanId);
      if (!clanData) {
        Alert.alert('Erro', 'CLANN não encontrado');
        setLoading(false);
        return;
      }
      setClan(clanData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do CLANN');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareCode = async () => {
    if (!clan?.invite_code) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
        return;
      }

      const message = `Entre no CLANN "${clan.name}" usando o código: ${clan.invite_code}`;
      await Sharing.shareAsync(message, {
        dialogTitle: 'Compartilhar código do CLANN',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o código');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!clan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>CLANN não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const qrData = `CLANN:${clan.invite_code}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Convidar para o CLANN</Text>
          <Text style={styles.subtitle}>
            Compartilhe o código ou escaneie o QR Code
          </Text>
        </View>

        <View style={styles.clanInfo}>
          <Text style={styles.clanName}>{clan.name}</Text>
          {clan.icon && (
            <Text style={styles.clanIcon}>{clan.icon}</Text>
          )}
        </View>

        <View style={styles.qrContainer}>
          <QRCodeSVG
            value={qrData}
            size={250}
            color="#ffffff"
            backgroundColor="#000000"
          />
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Código de Convite</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{clan.invite_code}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareCode}
        >
          <Text style={styles.shareButtonText}>📤 Compartilhar Código</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Outros usuários podem entrar neste CLANN usando o código acima ou escaneando o QR Code.
          </Text>
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
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  clanInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  clanName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  clanIcon: {
    fontSize: 40,
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  codeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: 200,
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a90e2',
    letterSpacing: 4,
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 200,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    width: '100%',
  },
  infoText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
