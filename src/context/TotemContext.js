/**
 * Context API para gerenciamento do estado do Totem
 * Centraliza o estado do Totem carregado do secureStore
 * 
 * NÃO implementa lógica de backup, seed ou segurança.
 * Apenas centraliza o estado do Totem.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadTotemSecure } from '../storage/secureStore';

const TotemContext = createContext(null);

export function TotemProvider({ children }) {
  const [totem, setTotemState] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Carrega o Totem do secureStore
   */
  const loadTotem = async () => {
    try {
      setLoading(true);
      const loadedTotem = await loadTotemSecure();
      setTotemState(loadedTotem);
      return loadedTotem;
    } catch (error) {
      console.error('Erro ao carregar Totem:', error);
      setTotemState(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Define o Totem no estado
   */
  const setTotem = (newTotem) => {
    setTotemState(newTotem);
  };

  /**
   * Limpa o Totem do estado
   */
  const clearTotem = () => {
    setTotemState(null);
  };

  // Carrega Totem ao montar o provider
  useEffect(() => {
    console.log("[TotemContext] Iniciando carregamento do Totem...");
    
    loadTotem().then((loadedTotem) => {
      console.log("[TotemContext] Totem carregado do storage:", loadedTotem);
      
      if (!loadedTotem) {
        console.warn("[TotemContext] Nenhum Totem encontrado — fluxo seguirá para onboarding.");
      }
    });
  }, []);

  const value = {
    totem,
    loading,
    setTotem,
    loadTotem,
    clearTotem,
  };

  return (
    <TotemContext.Provider value={value}>
      {children}
    </TotemContext.Provider>
  );
}

/**
 * Hook para usar o TotemContext
 */
export function useTotem() {
  const context = useContext(TotemContext);
  if (!context) {
    throw new Error('useTotem deve ser usado dentro de TotemProvider');
  }
  return context;
}

