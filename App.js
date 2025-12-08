/**
 * App principal do CLÃ
 * Gerencia a navegação e o fluxo inicial
 */

// Polyfill para Buffer (necessário para React Native)
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Telas de onboarding
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';
import TotemGenerationScreen from './src/screens/onboarding/TotemGenerationScreen';
import RecoveryPhraseScreen from './src/screens/onboarding/RecoveryPhraseScreen';
import ChooseStartScreen from './src/screens/onboarding/ChooseStartScreen';

// Tela Home (temporária, vazia)
import HomeScreen from './src/screens/HomeScreen';

// Storage
import { hasTotemSecure } from './src/storage/secureStore';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasTotem, setHasTotem] = useState(false);

  useEffect(() => {
    checkTotem();
  }, []);

  const checkTotem = async () => {
    try {
      const exists = await hasTotemSecure();
      setHasTotem(exists);
    } catch (error) {
      console.error('Erro ao verificar Totem:', error);
      setHasTotem(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
        }}
      >
        {hasTotem ? (
          // Se já tem Totem, vai direto para Home
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          // Se não tem Totem, mostra onboarding
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="TotemGeneration" component={TotemGenerationScreen} />
            <Stack.Screen name="RecoveryPhrase" component={RecoveryPhraseScreen} />
            <Stack.Screen name="ChooseStart" component={ChooseStartScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});

