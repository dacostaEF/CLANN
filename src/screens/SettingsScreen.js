import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const handleThemeChange = () => {
    Alert.alert('Tema', 'Funcionalidade em desenvolvimento');
  };

  const handleLanguageChange = () => {
    Alert.alert('Idioma', 'Funcionalidade em desenvolvimento');
  };

  const handleAbout = () => {
    Alert.alert('Sobre o App', 'CLANN App v1.0.0\n\nAplicativo de gerenciamento de CLANNs');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Política de Privacidade', 'Funcionalidade em desenvolvimento');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Configurações</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleThemeChange}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌓</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Tema</Text>
                <Text style={styles.settingValue}>Escuro</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geral</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleLanguageChange}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌐</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Idioma</Text>
                <Text style={styles.settingValue}>Português</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleAbout}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>ℹ️</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Sobre o App</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔒</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Política de Privacidade</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
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
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: '#999999',
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 24,
    color: '#666666',
    marginLeft: 12,
  },
});

