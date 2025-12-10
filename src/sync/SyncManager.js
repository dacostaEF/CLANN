import { Platform } from 'react-native';
import MessagesStorage from '../messages/MessagesStorage';

/**
 * Gerenciador de sincronização em tempo real
 * Sprint 6 - ETAPA 6
 * Polling inteligente com delta updates (offline-first)
 */
class SyncManager {
  constructor() {
    this.syncIntervals = new Map(); // Map<clanId, intervalId>
    this.isActive = false;
    this.lastTimestamps = new Map(); // Map<clanId, lastTimestamp>
  }

  // ---------------------------------------------------------
  // Iniciar sincronização para um CLANN
  // ---------------------------------------------------------
  startSync(clanId, callback) {
    if (!clanId || !callback) {
      console.warn('SyncManager: clanId e callback são obrigatórios');
      return;
    }

    // Parar sync anterior se existir
    this.stopSync(clanId);

    // Obter último timestamp das mensagens do CLANN
    this._initializeLastTimestamp(clanId).then(() => {
      // Iniciar polling
      const intervalId = setInterval(async () => {
        if (!this.isActive) return;

        try {
          const lastTimestamp = this.lastTimestamps.get(clanId) || 0;
          const updates = await this.fetchUpdates(clanId, lastTimestamp);

          if (updates && updates.length > 0) {
            // Atualizar último timestamp
            const maxTimestamp = Math.max(
              ...updates.map(m => m.timestamp || 0),
              lastTimestamp
            );
            this.lastTimestamps.set(clanId, maxTimestamp);

            // Chamar callback com deltas
            callback(updates);
          }
        } catch (error) {
          console.warn('Erro na sincronização:', error);
        }
      }, 3000); // 3 segundos

      this.syncIntervals.set(clanId, intervalId);
      this.isActive = true;
    });
  }

  // ---------------------------------------------------------
  // Parar sincronização
  // ---------------------------------------------------------
  stopSync(clanId = null) {
    if (clanId) {
      // Parar sync de um CLANN específico
      const intervalId = this.syncIntervals.get(clanId);
      if (intervalId) {
        clearInterval(intervalId);
        this.syncIntervals.delete(clanId);
        this.lastTimestamps.delete(clanId);
      }
    } else {
      // Parar todos os syncs
      this.syncIntervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
      this.syncIntervals.clear();
      this.lastTimestamps.clear();
      this.isActive = false;
    }
  }

  // ---------------------------------------------------------
  // Buscar atualizações (delta updates)
  // ---------------------------------------------------------
  async fetchUpdates(clanId, lastTimestamp) {
    try {
      const updates = await MessagesStorage.getMessagesSince(clanId, lastTimestamp);
      return updates || [];
    } catch (error) {
      console.error('Erro ao buscar atualizações:', error);
      return [];
    }
  }

  // ---------------------------------------------------------
  // Inicializar último timestamp
  // ---------------------------------------------------------
  async _initializeLastTimestamp(clanId) {
    try {
      const allMessages = await MessagesStorage.getMessages(clanId);
      if (allMessages.length > 0) {
        const maxTimestamp = Math.max(...allMessages.map(m => m.timestamp || 0));
        this.lastTimestamps.set(clanId, maxTimestamp);
      } else {
        this.lastTimestamps.set(clanId, 0);
      }
    } catch (error) {
      console.warn('Erro ao inicializar timestamp:', error);
      this.lastTimestamps.set(clanId, 0);
    }
  }

  // ---------------------------------------------------------
  // Atualizar último timestamp manualmente
  // ---------------------------------------------------------
  updateLastTimestamp(clanId, timestamp) {
    const current = this.lastTimestamps.get(clanId) || 0;
    if (timestamp > current) {
      this.lastTimestamps.set(clanId, timestamp);
    }
  }

  // ---------------------------------------------------------
  // Verificar se está sincronizando
  // ---------------------------------------------------------
  isSyncing(clanId = null) {
    if (clanId) {
      return this.syncIntervals.has(clanId);
    }
    return this.syncIntervals.size > 0;
  }
}

export default new SyncManager();

