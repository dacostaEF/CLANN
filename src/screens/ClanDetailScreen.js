import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ClanStorage from '../clans/ClanStorage';
import { getCurrentTotemId } from '../crypto/totemStorage';

export default function ClanDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { clanId } = route.params;

  const [clan, setClan] = useState(null);

  useEffect(() => {
    loadClan();
  }, []);

  const loadClan = async () => {
    try {
      const data = await ClanStorage.getClanById(clanId);
      setClan(data);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar o CLANN.');
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (!clan) return;

    await Share.share({
      message: `Entre no meu CLANN "${clan.name}"!\nCódigo: ${clan.invite_code}`,
      title: `Convite para ${clan.name}`
    });
  };

  const handleLeave = async () => {
    try {
      const totemId = await getCurrentTotemId();
      await ClanStorage.leaveClan(clanId, totemId);
      Alert.alert('Pronto!', 'Você saiu deste CLANN.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível sair do CLANN.');
      console.error(err);
    }
  };

  if (!clan) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando CLANN...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.icon}>{clan.icon}</Text>
      <Text style={styles.name}>{clan.name}</Text>
      <Text style={styles.description}>
        {clan.description || 'Sem descrição'}
      </Text>

      <View style={styles.statsBox}>
        <Text style={styles.statsLabel}>Membros</Text>
        <Text style={styles.statsValue}>{clan.members}</Text>
      </View>

      <Text style={styles.inviteTitle}>Código de Convite</Text>
      <Text style={styles.inviteCode}>{clan.invite_code}</Text>

      <TouchableOpacity style={styles.btn} onPress={handleShare}>
        <Text style={styles.btnText}>Compartilhar Convite</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.leaveBtn]} onPress={handleLeave}>
        <Text style={styles.btnText}>Sair do CLANN</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
    alignItems: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a'
  },
  loadingText: {
    color: '#888',
    fontSize: 16
  },
  icon: {
    fontSize: 60,
    marginTop: 20
  },
  name: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10
  },
  description: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15
  },
  statsBox: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
    width: '70%'
  },
  statsLabel: {
    color: '#888',
    fontSize: 14
  },
  statsValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  },
  inviteTitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 10
  },
  inviteCode: {
    color: '#4a90e2',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25
  },
  btn: {
    backgroundColor: '#4a90e2',
    padding: 15,
    width: '80%',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  leaveBtn: {
    backgroundColor: '#b03030'
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

