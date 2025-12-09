/**
 * Módulo de gerenciamento de PIN
 * Gerencia criação, validação e hash de PIN
 * Gera chave AES para criptografia de backup
 */

import { Platform } from 'react-native';
import { sha256 } from '@noble/hashes/sha256';
import { randomBytes } from '../utils/randomBytes';

// Polyfill para web usando localStorage
let SecureStore;
if (Platform.OS === 'web') {
  SecureStore = {
    async setItemAsync(key, value) {
      localStorage.setItem(key, value);
    },
    async getItemAsync(key) {
      return localStorage.getItem(key);
    },
    async deleteItemAsync(key) {
      localStorage.removeItem(key);
    },
  };
} else {
  SecureStore = require('expo-secure-store');
}

const PIN_KEY = 'pin_hash';
const PIN_SALT_KEY = 'pin_salt';
const AES_KEY_KEY = 'aes_key';
const PIN_ATTEMPTS_KEY = 'pin_attempts';
const PIN_LOCKED_UNTIL_KEY = 'pin_locked_until';

// Tempo de bloqueio após 5 tentativas (30 segundos)
const LOCK_DURATION = 30 * 1000; // 30 segundos em milissegundos

/**
 * Valida o formato do PIN (4-6 dígitos)
 * @param {string} pin - PIN a validar
 * @returns {boolean} True se válido
 */
export function validatePinFormat(pin) {
  return /^\d{4,6}$/.test(pin);
}

/**
 * Gera hash do PIN usando SHA256 com salt (iterações múltiplas)
 * @param {string} pin - PIN em texto plano
 * @param {Uint8Array} salt - Salt aleatório
 * @returns {Promise<string>} Hash do PIN em hex
 */
async function hashPin(pin, salt) {
  const pinBytes = new TextEncoder().encode(pin);
  // Combina PIN + salt
  const combined = new Uint8Array(pinBytes.length + salt.length);
  combined.set(pinBytes, 0);
  combined.set(salt, pinBytes.length);
  
  // Aplica SHA256 múltiplas vezes (simula PBKDF2)
  let hash = combined;
  for (let i = 0; i < 100000; i++) {
    hash = sha256(hash);
  }
  
  return Buffer.from(hash).toString('hex');
}

/**
 * Gera chave AES-256 a partir do PIN
 * @param {string} pin - PIN do usuário
 * @param {Uint8Array} salt - Salt (pode ser o mesmo do PIN ou diferente)
 * @returns {Promise<Uint8Array>} Chave AES de 32 bytes
 */
export async function generateAESKeyFromPin(pin, salt) {
  const pinBytes = new TextEncoder().encode(pin);
  // Combina PIN + salt
  const combined = new Uint8Array(pinBytes.length + salt.length);
  combined.set(pinBytes, 0);
  combined.set(salt, pinBytes.length);
  
  // Aplica SHA256 múltiplas vezes para derivar chave
  let hash = combined;
  for (let i = 0; i < 100000; i++) {
    hash = sha256(hash);
  }
  
  // Retorna 32 bytes (256 bits) para AES-256
  return hash.slice(0, 32);
}

/**
 * Cria e salva um novo PIN
 * @param {string} pin - PIN em texto plano (4-6 dígitos)
 * @returns {Promise<void>}
 */
export async function createPin(pin) {
  if (!validatePinFormat(pin)) {
    throw new Error('PIN deve ter entre 4 e 6 dígitos');
  }

  // Gera salt aleatório
  const salt = randomBytes(16);
  const saltHex = Buffer.from(salt).toString('hex');

  // Gera hash do PIN
  const pinHash = await hashPin(pin, salt);

  // Gera chave AES para backup
  const aesKey = await generateAESKeyFromPin(pin, salt);
  const aesKeyHex = Buffer.from(aesKey).toString('hex');

  // Salva tudo no SecureStore
  await SecureStore.setItemAsync(PIN_KEY, pinHash);
  await SecureStore.setItemAsync(PIN_SALT_KEY, saltHex);
  await SecureStore.setItemAsync(AES_KEY_KEY, aesKeyHex);

  // Reseta tentativas
  await SecureStore.deleteItemAsync(PIN_ATTEMPTS_KEY);
  await SecureStore.deleteItemAsync(PIN_LOCKED_UNTIL_KEY);
}

/**
 * Verifica se o PIN está correto
 * @param {string} pin - PIN a verificar
 * @returns {Promise<boolean>} True se correto
 */
export async function verifyPin(pin) {
  try {
    // Verifica se está bloqueado
    const lockedUntil = await SecureStore.getItemAsync(PIN_LOCKED_UNTIL_KEY);
    if (lockedUntil) {
      const lockTime = parseInt(lockedUntil, 10);
      if (Date.now() < lockTime) {
        const remainingSeconds = Math.ceil((lockTime - Date.now()) / 1000);
        throw new Error(`PIN bloqueado. Tente novamente em ${remainingSeconds} segundos.`);
      }
      // Desbloqueia se o tempo passou
      await SecureStore.deleteItemAsync(PIN_LOCKED_UNTIL_KEY);
    }

    // Carrega hash e salt
    const storedHash = await SecureStore.getItemAsync(PIN_KEY);
    const saltHex = await SecureStore.getItemAsync(PIN_SALT_KEY);

    if (!storedHash || !saltHex) {
      return false;
    }

    const salt = Buffer.from(saltHex, 'hex');
    const computedHash = await hashPin(pin, salt);

    if (computedHash === storedHash) {
      // PIN correto - reseta tentativas
      await SecureStore.deleteItemAsync(PIN_ATTEMPTS_KEY);
      return true;
    } else {
      // PIN incorreto - incrementa tentativas
      await incrementPinAttempts();
      return false;
    }
  } catch (error) {
    if (error.message.includes('bloqueado')) {
      throw error;
    }
    return false;
  }
}

/**
 * Incrementa contador de tentativas de PIN
 * Bloqueia após 5 tentativas
 */
async function incrementPinAttempts() {
  const attemptsStr = await SecureStore.getItemAsync(PIN_ATTEMPTS_KEY);
  let attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
  attempts += 1;

  if (attempts >= 5) {
    // Bloqueia por 30 segundos
    const lockUntil = Date.now() + LOCK_DURATION;
    await SecureStore.setItemAsync(PIN_LOCKED_UNTIL_KEY, lockUntil.toString());
    await SecureStore.setItemAsync(PIN_ATTEMPTS_KEY, '0'); // Reseta contador
    throw new Error('Muitas tentativas incorretas. PIN bloqueado por 30 segundos.');
  } else {
    await SecureStore.setItemAsync(PIN_ATTEMPTS_KEY, attempts.toString());
  }
}

/**
 * Obtém a chave AES salva (para backup)
 * @returns {Promise<string|null>} Chave AES em hex ou null
 */
export async function getAESKey() {
  try {
    return await SecureStore.getItemAsync(AES_KEY_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * Verifica se existe um PIN configurado
 * @returns {Promise<boolean>} True se existe PIN
 */
export async function hasPin() {
  try {
    const pinHash = await SecureStore.getItemAsync(PIN_KEY);
    return pinHash !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Obtém o número de tentativas de PIN restantes
 * @returns {Promise<number>} Tentativas restantes (5 - tentativas atuais)
 */
export async function getRemainingAttempts() {
  try {
    const attemptsStr = await SecureStore.getItemAsync(PIN_ATTEMPTS_KEY);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    return Math.max(0, 5 - attempts);
  } catch (error) {
    return 5;
  }
}

/**
 * Obtém o tempo restante de bloqueio (em segundos)
 * @returns {Promise<number>} Segundos restantes ou 0 se não bloqueado
 */
export async function getLockRemainingTime() {
  try {
    const lockedUntil = await SecureStore.getItemAsync(PIN_LOCKED_UNTIL_KEY);
    if (!lockedUntil) {
      return 0;
    }
    const lockTime = parseInt(lockedUntil, 10);
    const remaining = Math.max(0, Math.ceil((lockTime - Date.now()) / 1000));
    return remaining;
  } catch (error) {
    return 0;
  }
}

