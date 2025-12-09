import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ClanIconPicker from '../components/ClanIconPicker';
import ClanManager from '../clans/ClanManager';
import { DEFAULT_CLAN_ICONS } from '../config/ClanTypes';

export default function CreateClanScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    icon: DEFAULT_CLAN_ICONS[0],
    description: '',
    rules: '',
    maxMembers: '50',
    privacy: 'private'
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateClan = async () => {
    if (!form.name.trim()) {
      Alert.alert('Erro', 'Digite um nome para o CLANN');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Obter totemId real a partir do TotemContext
      const creatorTotemId = 'TEMP_TOTEM_ID';
      
      const canCreate = await ClanManager.canCreateClan(creatorTotemId);
      if (!canCreate.canCreate) {
        Alert.alert('Limite atingido', canCreate.reason);
        return;
      }
      
      const clan = await ClanManager.createClan(
        {
          name: form.name.trim(),
          icon: form.icon,
          description: form.description.trim(),
          rules: form.rules.trim(),
          maxMembers: parseInt(form.maxMembers) || 50,
          privacy: form.privacy
        },
        creatorTotemId
      );
      
      Alert.alert(
        'CLANN Criado!',
        `"${clan.name}" foi criado com sucesso.\nCódigo de convite: ${clan.invite_code}`,
        [
          {
            text: 'Compartilhar Código',
            onPress: () => navigation.navigate('ClanInvite', { clanId: clan.id })
          },
          {
            text: 'Ir para CLANN',
            onPress: () => navigation.navigate('ClanDetail', { clanId: clan.id })
          }
        ]
      );
      
      setForm({
        name: '',
        icon: DEFAULT_CLAN_ICONS[0],
        description: '',
        rules: '',
        maxMembers: '50',
        privacy: 'private'
      });
      
    } catch (error) {
      Alert.alert('Erro ao criar CLANN', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Fundar um Novo CLANN</Text>
          <Text style={styles.subtitle}>
            Crie uma fortaleza digital para sua tribo
          </Text>
        </View>

        {/* Ícone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Símbolo do CLANN</Text>
          <ClanIconPicker
            selected={form.icon}
            onSelect={(icon) => updateForm('icon', icon)}
          />
        </View>

        {/* Nome */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nome do CLANN *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Guardiões da Lua, Sentinelas do Abismo..."
            value={form.name}
            onChangeText={(text) => updateForm('name', text)}
            maxLength={30}
            editable={!loading}
          />
          <Text style={styles.charCount}>{form.name.length}/30</Text>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Qual a missão deste CLANN? O que os une?"
            value={form.description}
            onChangeText={(text) => updateForm('description', text)}
            multiline
            numberOfLines={3}
            maxLength={200}
            editable={!loading}
          />
          <Text style={styles.charCount}>{form.description.length}/200</Text>
        </View>

        {/* Regras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regras (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Uma regra por linha:\n• Respeito mútuo\n• Sigilo absoluto\n• ..."
            value={form.rules}
            onChangeText={(text) => updateForm('rules', text)}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Máximo de membros:</Text>
            <TextInput
              style={[styles.input, styles.smallInput]}
              value={form.maxMembers}
              onChangeText={(text) => updateForm('maxMembers', text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              maxLength={3}
              editable={!loading}
            />
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Privacidade:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  form.privacy === 'private' && styles.radioButtonSelected
                ]}
                onPress={() => updateForm('privacy', 'private')}
                disabled={loading}
              >
                <Text style={[
                  styles.radioText,
                  form.privacy === 'private' && styles.radioTextSelected
                ]}>
                  🔒 Privado
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  form.privacy === 'public' && styles.radioButtonSelected
                ]}
                onPress={() => updateForm('privacy', 'public')}
                disabled={loading}
              >
                <Text style={[
                  styles.radioText,
                  form.privacy === 'public' && styles.radioTextSelected
                ]}>
                  🌍 Público
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            (!form.name.trim() || loading) && styles.createButtonDisabled
          ]}
          onPress={handleCreateClan}
          disabled={!form.name.trim() || loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Criando...' : '🏰 Fundar CLANN'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          * O código de convite será gerado após a criação
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#888'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333'
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  label: {
    color: '#ccc',
    fontSize: 16
  },
  smallInput: {
    width: 80,
    textAlign: 'center'
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12
  },
  radioButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333'
  },
  radioButtonSelected: {
    backgroundColor: '#2a2a2a',
    borderColor: '#4a90e2'
  },
  radioText: {
    color: '#888'
  },
  radioTextSelected: {
    color: '#4a90e2',
    fontWeight: '600'
  },
  createButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 20
  },
  createButtonDisabled: {
    backgroundColor: '#2a2a2a',
    opacity: 0.5
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  disclaimer: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16
  }
});

