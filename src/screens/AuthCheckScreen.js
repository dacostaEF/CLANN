import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTotem, TotemState } from '../context/TotemContext';

export default function AuthCheckScreen() {
  const navigation = useNavigation();
  const { totemState, loading: totemLoading } = useTotem();

  useEffect(() => {
    // DOSE 4.3 - AuthCheck Simplificado
    // Aguardar carregamento completo antes de navegar
    if (totemLoading) return;

    // Navegar baseado apenas no totemState (sem lógica implícita)
    switch (totemState) {
      case TotemState.NONE:
        navigation.replace('Welcome');
        break;

      case TotemState.NEEDS_PIN:
        navigation.replace('CreatePin');
        break;

      case TotemState.READY:
        navigation.replace('EnterPin');
        break;

      case TotemState.CORRUPTED:
        navigation.replace('TotemAudit');
        break;

      case TotemState.LOADING:
      default:
        // Não navegar durante carregamento
        break;
    }
  }, [totemLoading, totemState, navigation]);

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
