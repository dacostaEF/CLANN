/**
 * Módulo de armazenamento seguro usando expo-secure-store
 * Todos os dados do Totem são armazenados de forma criptografada localmente
 */

import * as SecureStore from 'expo-secure-store';

const TOTEM_KEY = 'totem_data';

/**
 * Salva os dados do Totem de forma segura
 * @param {Object} totemData - Dados do Totem a serem salvos
 * @returns {Promise<void>}
 */
export async function saveTotemSecure(totemData) {
  try {
    // Converte o objeto para JSON e salva de forma segura
    const jsonData = JSON.stringify(totemData);
    await SecureStore.setItemAsync(TOTEM_KEY, jsonData);
  } catch (error) {
    throw new Error(`Erro ao salvar Totem: ${error.message}`);
  }
}

/**
 * Carrega os dados do Totem de forma segura
 * @returns {Promise<Object|null>} Dados do Totem ou null se não existir
 */
export async function loadTotemSecure() {
  try {
    const jsonData = await SecureStore.getItemAsync(TOTEM_KEY);
    if (!jsonData) {
      return null;
    }
    return JSON.parse(jsonData);
  } catch (error) {
    throw new Error(`Erro ao carregar Totem: ${error.message}`);
  }
}

/**
 * Deleta todos os dados do Totem
 * @returns {Promise<void>}
 */
export async function deleteTotemSecure() {
  try {
    await SecureStore.deleteItemAsync(TOTEM_KEY);
  } catch (error) {
    throw new Error(`Erro ao deletar Totem: ${error.message}`);
  }
}

/**
 * Verifica se existe um Totem salvo
 * @returns {Promise<boolean>} True se existe um Totem salvo
 */
export async function hasTotemSecure() {
  try {
    const data = await SecureStore.getItemAsync(TOTEM_KEY);
    return data !== null;
  } catch (error) {
    return false;
  }
}


