/**
 * Context API para gerenciamento do estado de segurança
 * Guarda flags e estado relacionado a PIN, biometria e tentativas
 * 
 * NÃO implementa lógica de autodestruição.
 * A lógica de autodestruição continua nos módulos do Sprint 2.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { hasPin } from '../security/PinManager';
import { isBiometryEnabled, isBiometryAvailable } from '../security/BiometryManager';
import { getRemainingAttempts, getLockRemainingTime } from '../security/PinManager';
import { getFailedAttempts } from '../security/SelfDestruct';

const SecurityContext = createContext(null);

export function SecurityProvider({ children }) {
  const [hasPinConfigured, setHasPinConfigured] = useState(false);
  const [biometryEnabled, setBiometryEnabled] = useState(false);
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [pinRemainingAttempts, setPinRemainingAttempts] = useState(5);
  const [pinLockRemaining, setPinLockRemaining] = useState(0);
  const [selfDestructAttempts, setSelfDestructAttempts] = useState(0);
  const [loading, setLoading] = useState(true);

  /**
   * Carrega o estado de segurança
   */
  const loadSecurityState = async () => {
    try {
      setLoading(true);
      
      const [hasPin, biometryEnabled, biometryAvail, remainingAttempts, lockRemaining, failedAttempts] = await Promise.all([
        hasPin(),
        isBiometryEnabled(),
        isBiometryAvailable(),
        getRemainingAttempts(),
        getLockRemainingTime(),
        getFailedAttempts(),
      ]);

      setHasPinConfigured(hasPin);
      setBiometryEnabled(biometryEnabled);
      setBiometryAvailable(biometryAvail);
      setPinRemainingAttempts(remainingAttempts);
      setPinLockRemaining(lockRemaining);
      setSelfDestructAttempts(failedAttempts);
    } catch (error) {
      console.error('Erro ao carregar estado de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza o estado de PIN
   */
  const updatePinState = async () => {
    const hasPinValue = await hasPin();
    setHasPinConfigured(hasPinValue);
    if (hasPinValue) {
      const remaining = await getRemainingAttempts();
      const lockRemaining = await getLockRemainingTime();
      setPinRemainingAttempts(remaining);
      setPinLockRemaining(lockRemaining);
    }
  };

  /**
   * Atualiza o estado de biometria
   */
  const updateBiometryState = async () => {
    const enabled = await isBiometryEnabled();
    const available = await isBiometryAvailable();
    setBiometryEnabled(enabled);
    setBiometryAvailable(available);
  };

  /**
   * Atualiza tentativas de autodestruição
   */
  const updateSelfDestructState = async () => {
    const attempts = await getFailedAttempts();
    setSelfDestructAttempts(attempts);
  };

  // Carrega estado inicial
  useEffect(() => {
    loadSecurityState();
  }, []);

  // Atualiza estado periodicamente (a cada 5 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      updatePinState();
      updateBiometryState();
      updateSelfDestructState();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    // Estado
    hasPinConfigured,
    biometryEnabled,
    biometryAvailable,
    pinRemainingAttempts,
    pinLockRemaining,
    selfDestructAttempts,
    loading,
    
    // Funções
    loadSecurityState,
    updatePinState,
    updateBiometryState,
    updateSelfDestructState,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

/**
 * Hook para usar o SecurityContext
 */
export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity deve ser usado dentro de SecurityProvider');
  }
  return context;
}

