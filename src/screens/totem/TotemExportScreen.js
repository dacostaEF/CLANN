import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TotemExportScreen() {
  const navigation = useNavigation();

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
          <Text style={styles.title}>Exportar Identidade</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.emoji}>📤</Text>
          </View>

          <Text style={styles.subtitle}>Em breve você poderá:</Text>

          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Ionicons name="download-outline" size={20} color="#4a90e2" />
              <Text style={styles.listText}>Exportar Totem como arquivo</Text>
            </View>

            <View style={styles.listItem}>
              <Ionicons name="qr-code-outline" size={20} color="#4a90e2" />
              <Text style={styles.listText}>Exportar via QR Code</Text>
            </View>

            <View style={styles.listItem}>
              <Ionicons name="share-outline" size={20} color="#4a90e2" />
              <Text style={styles.listText}>Compartilhar backup</Text>
            </View>

            <View style={styles.listItem}>
              <Ionicons name="lock-closed-outline" size={20} color="#4a90e2" />
              <Text style={styles.listText}>Backup protegido por PIN</Text>
            </View>
          </View>
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
});

