import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { hasTotemSecure } from '../crypto/totemStorage';
import { hasPin } from '../security/PinManager';

export default function AuthCheckScreen({ navigation }) {

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasTotem = await hasTotemSecure();
        const hasPinConfigured = await hasPin();

        // 1. Sem Totem → fluxo inicial
        if (!hasTotem) {
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
  }, []);

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
