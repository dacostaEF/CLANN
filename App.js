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

// Telas de segurança (Sprint 2)
import VerifySeedScreen from './src/screens/VerifySeedScreen';
import CreatePinScreen from './src/screens/CreatePinScreen';
import EnterPinScreen from './src/screens/EnterPinScreen';
import ExportIdentityScreen from './src/screens/ExportIdentityScreen';
import ImportIdentityScreen from './src/screens/ImportIdentityScreen';
import SecurityAuditScreen from './src/screens/SecurityAuditScreen';

// Tela Home
import HomeScreen from './src/screens/HomeScreen';

// Storage e Security
import { hasTotemSecure } from './src/storage/secureStore';
import { hasPin } from './src/security/PinManager';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasTotem, setHasTotem] = useState(false);
  const [hasPinConfigured, setHasPinConfigured] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    try {
      const totemExists = await hasTotemSecure();
      setHasTotem(totemExists);
      
      if (totemExists) {
        const pinExists = await hasPin();
        setHasPinConfigured(pinExists);
        setPinVerified(!pinExists); // Se não tem PIN, não precisa verificar
      }
    } catch (error) {
      console.error('Erro ao verificar estado inicial:', error);
      setHasTotem(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSuccess = () => {
    setPinVerified(true);
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
        {hasTotem && hasPinConfigured && !pinVerified ? (
          // Se tem Totem e PIN, precisa autenticar
          <Stack.Screen name="EnterPin">
            {(props) => <EnterPinScreen {...props} onSuccess={handlePinSuccess} />}
          </Stack.Screen>
        ) : hasTotem ? (
          // Se tem Totem (com ou sem PIN), vai para Home
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ExportIdentity" component={ExportIdentityScreen} />
            <Stack.Screen name="ImportIdentity" component={ImportIdentityScreen} />
            <Stack.Screen name="SecurityAudit" component={SecurityAuditScreen} />
          </>
        ) : (
          // Se não tem Totem, mostra onboarding
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="TotemGeneration" component={TotemGenerationScreen} />
            <Stack.Screen name="RecoveryPhrase" component={RecoveryPhraseScreen} />
            <Stack.Screen name="VerifySeed" component={VerifySeedScreen} />
            <Stack.Screen name="CreatePin" component={CreatePinScreen} />
            <Stack.Screen name="ChooseStart" component={ChooseStartScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ExportIdentity" component={ExportIdentityScreen} />
            <Stack.Screen name="ImportIdentity" component={ImportIdentityScreen} />
            <Stack.Screen name="SecurityAudit" component={SecurityAuditScreen} />
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

