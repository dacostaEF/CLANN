import { Platform } from 'react-native';

// Polyfill para web - SQLite não funciona no navegador
let SQLite;
if (Platform.OS === 'web') {
  SQLite = null; // Não será usado no web
} else {
  SQLite = require('expo-sqlite');
}

// Chave para localStorage na Web
const WEB_MESSAGES_KEY = 'clann_messages';

/**
 * Camada de acesso ao SQLite para mensagens dos CLANNs
 * Gerencia persistência de mensagens localmente
 * 
 * Sprint 4: Chat básico funcional
 */
class MessagesStorage {
  constructor() {
    if (Platform.OS !== 'web' && SQLite) {
      // Usa o mesmo banco de dados dos CLANNs
      this.db = SQLite.openDatabase('clans.db');
    } else {
      this.db = null; // No web, não há banco
    }
  }

  // ---------------------------------------------------------
  // Helpers para localStorage na Web
  // ---------------------------------------------------------
  _getWebMessages() {
    if (Platform.OS !== 'web') return [];
    try {
      const data = localStorage.getItem(WEB_MESSAGES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _saveWebMessages(messages) {
    if (Platform.OS !== 'web') return;
    try {
      localStorage.setItem(WEB_MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Erro ao salvar mensagens no localStorage:', error);
    }
  }

  // ---------------------------------------------------------
  // Inicialização (tabela já criada em ClanStorage.init())
  // ---------------------------------------------------------
  async init() {
    if (Platform.OS === 'web' || !this.db) {
      // No web, não há banco de dados (usa localStorage)
      return Promise.resolve(true);
    }
    // Tabela já foi criada em ClanStorage.init()
    return Promise.resolve(true);
  }

  // ---------------------------------------------------------
  // Adicionar mensagem
  // ---------------------------------------------------------
  async addMessage(clanId, authorTotem, text) {
    if (Platform.OS === 'web' || !this.db) {
      // Na Web, salva no localStorage
      const messages = this._getWebMessages();
      const newMessage = {
        id: Date.now(),
        clan_id: parseInt(clanId),
        author_totem: authorTotem,
        message: text,
        timestamp: Date.now()
      };
      messages.push(newMessage);
      this._saveWebMessages(messages);
      return Promise.resolve(newMessage);
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO clan_messages (clan_id, author_totem, message, timestamp)
           VALUES (?, ?, ?, ?);`,
          [clanId, authorTotem, text, Date.now()],
          (_, result) => {
            resolve({
              id: result.insertId,
              clan_id: clanId,
              author_totem: authorTotem,
              message: text,
              timestamp: Date.now()
            });
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // ---------------------------------------------------------
  // Buscar mensagens de um CLANN
  // ---------------------------------------------------------
  async getMessages(clanId) {
    if (Platform.OS === 'web' || !this.db) {
      // Na Web, busca no localStorage
      const messages = this._getWebMessages();
      const clanMessages = messages
        .filter(m => m.clan_id === parseInt(clanId))
        .sort((a, b) => a.timestamp - b.timestamp); // Ordena ASC (mais antigo primeiro)
      
      return Promise.resolve(clanMessages);
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM clan_messages 
           WHERE clan_id = ? 
           ORDER BY timestamp ASC;`,
          [clanId],
          (_, { rows }) => {
            const messages = [];
            for (let i = 0; i < rows.length; i++) {
              messages.push(rows.item(i));
            }
            resolve(messages);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // ---------------------------------------------------------
  // Deletar mensagem (para futuro)
  // ---------------------------------------------------------
  async deleteMessage(messageId) {
    if (Platform.OS === 'web' || !this.db) {
      // Na Web, remove do localStorage
      const messages = this._getWebMessages();
      const filtered = messages.filter(m => m.id !== parseInt(messageId));
      this._saveWebMessages(filtered);
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM clan_messages WHERE id = ?;`,
          [messageId],
          () => resolve(true),
          (_, error) => reject(error)
        );
      });
    });
  }

  // ---------------------------------------------------------
  // Limpar todas as mensagens de um CLANN
  // ---------------------------------------------------------
  async clearMessages(clanId) {
    if (Platform.OS === 'web' || !this.db) {
      // Na Web, remove do localStorage
      const messages = this._getWebMessages();
      const filtered = messages.filter(m => m.clan_id !== parseInt(clanId));
      this._saveWebMessages(filtered);
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM clan_messages WHERE clan_id = ?;`,
          [clanId],
          () => resolve(true),
          (_, error) => reject(error)
        );
      });
    });
  }
}

export default new MessagesStorage();

