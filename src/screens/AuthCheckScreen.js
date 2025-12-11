import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTotem } from '../context/TotemContext';
import { hasPin } from '../security/PinManager';

export default function AuthCheckScreen() {
  const navigation = useNavigation();
  const { totem, loading: totemLoading } = useTotem();

  useEffect(() => {
    if (totemLoading) return;

    const checkAuth = async () => {
      try {
        const hasPinConfigured = await hasPin();

        // 1. Sem Totem → fluxo inicial
        if (!totem) {
          navigation.replace('Welcome');
          return;
        }

        // 2. Tem Totem, mas não tem PIN → cria PIN
        if (!hasPinConfigured) {
          navigation.replace('CreatePin');
          return;
        }

        // 3. Tem Totem + PIN → pedir PIN
        navigation.replace('EnterPin');

      } catch (err) {
        console.error('Erro no AuthCheck:', err);
        navigation.replace('Welcome');
      }
    };

    checkAuth();
  }, [totemLoading, totem, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4a90e2" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
