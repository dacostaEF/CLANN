import * as SecureStore from 'expo-secure-store';

/**
 * Nome da chave usada no SecureStore
 */
const TOTEM_KEY = 'CLANN_TOTEM_DATA';

/**
 * Salva o totem no armazenamento seguro
 * @param {Object} totemData - { totemId, privateKey, publicKey, createdAt }
 */
export async function saveTotem(totemData) {
  try {
    const json = JSON.stringify(totemData);
    await SecureStore.setItemAsync(TOTEM_KEY, json);
    return true;
  } catch (error) {
    console.error('Erro ao salvar totem:', error);
    return false;
  }
}

/**
 * Carrega o totem completo
 * @returns {Object|null}
 */
export async function loadTotem() {
  try {
    const data = await SecureStore.getItemAsync(TOTEM_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar totem:', error);
    return null;
  }
}

/**
 * Retorna o ID do Totem atual
 * @returns {string|null}
 */
export async function getCurrentTotemId() {
  const totem = await loadTotem();
  return totem?.totemId || null;
}

/**
 * Verifica se existe um totem salvo
 * @returns {boolean}
 */
export async function hasTotemSecure() {
  const totem = await loadTotem();
  return !!totem;
}

/**
 * Limpa o totem do dispositivo
 */
export async function clearTotem() {
  try {
    await SecureStore.deleteItemAsync(TOTEM_KEY);
    return true;
  } catch {
    return false;
  }
}


