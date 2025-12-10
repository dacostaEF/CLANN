import { Platform } from 'react-native';

// Polyfill para web - SQLite não funciona no navegador
let SQLite;
if (Platform.OS === 'web') {
  SQLite = null; // Não será usado no web
} else {
  SQLite = require('expo-sqlite');
}

// Chaves para localStorage na Web
const WEB_CLANS_KEY = 'clann_clans';
const WEB_CLAN_MEMBERS_KEY = 'clann_clan_members';
const WEB_MESSAGES_KEY = 'clann_messages';

class ClanStorage {
  constructor() {
    if (Platform.OS !== 'web' && SQLite) {
      this.db = SQLite.openDatabase('clans.db');
    } else {
      this.db = null; // No web, não há banco
    }
  }

  // ---------------------------------------------------------
  // Helpers para localStorage na Web
  // ---------------------------------------------------------
  _getWebClans() {
    if (Platform.OS !== 'web') return [];
    try {
      const data = localStorage.getItem(WEB_CLANS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _saveWebClans(clans) {
    if (Platform.OS !== 'web') return;
    try {
      localStorage.setItem(WEB_CLANS_KEY, JSON.stringify(clans));
    } catch (error) {
      console.error('Erro ao salvar CLANNs no localStorage:', error);
    }
  }

  _getWebMembers() {
    if (Platform.OS !== 'web') return [];
    try {
      const data = localStorage.getItem(WEB_CLAN_MEMBERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _saveWebMembers(members) {
    if (Platform.OS !== 'web') return;
    try {
      localStorage.setItem(WEB_CLAN_MEMBERS_KEY, JSON.stringify(members));
    } catch (error) {
      console.error('Erro ao salvar membros no localStorage:', error);
    }
  }

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

  getDB() {
    return this.db;
  }

  async init() {
    if (Platform.OS === 'web' || !this.db) {
      // No web, não há banco de dados
      return Promise.resolve(true);
    }
    
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {

        // Tabela principal de CLANNs
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS clans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT NOT NULL,
            description TEXT,
            invite_code TEXT UNIQUE NOT NULL,
            privacy TEXT DEFAULT 'public',
            created_at TEXT NOT NULL,
            founder_totem TEXT NOT NULL
          );`
        );

        // Membros do CLANN
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS clan_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clan_id INTEGER NOT NULL,
            totem_id TEXT NOT NULL,
            role TEXT NOT NULL,
            joined_at TEXT NOT NULL,
            FOREIGN KEY (clan_id) REFERENCES clans(id)
          );`
        );

        // Atividade do CLANN (para futuros chats e logs)
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS clan_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clan_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            payload TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (clan_id) REFERENCES clans(id)
          );`
        );

        // Mensagens do CLANN (Sprint 4 + Sprint 6)
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS clan_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clan_id INTEGER NOT NULL,
            author_totem TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            self_destruct_at INTEGER,
            burn_after_read INTEGER DEFAULT 0,
            reactions TEXT,
            delivered_to TEXT,
            read_by TEXT,
            edited INTEGER DEFAULT 0,
            deleted INTEGER DEFAULT 0,
            original_content TEXT,
            edited_at INTEGER,
            FOREIGN KEY (clan_id) REFERENCES clans(id)
          );`
        );

        // Adicionar colunas se não existirem (migration para Sprint 6)
        tx.executeSql(
          `ALTER TABLE clan_messages ADD COLUMN self_destruct_at INTEGER;`,
          [],
          () => {},
          () => {} // Ignora erro se coluna já existe
        );
        
        tx.executeSql(
          `ALTER TABLE clan_messages ADD COLUMN burn_after_read INTEGER DEFAULT 0;`,
          [],
          () => {},
          () => {} // Ignora erro se coluna já existe
        );

        // Adicionar coluna reactions (Sprint 6 - ETAPA 3)
        tx.executeSql(
          `ALTER TABLE clan_messages ADD COLUMN reactions TEXT;`,
          [],
          () => {},
          () => {} // Ignora erro se coluna já existe
        );

        // Adicionar colunas de status de entrega (Sprint 6 - ETAPA 4)
        tx.executeSql(
          `ALTER TABLE clan_messages ADD COLUMN delivered_to TEXT;`,
          [],
          () => {},
          () => {} // Ignora erro se coluna já existe
        );

        tx.executeSql(
          `ALTER TABLE clan_messages ADD COLUMN read_by TEXT;`,
          [],
          () => {},
          () => {} // Ignora erro se coluna já existe
        );

        // Adicionar colunas de edição/exclusão (Sprint 6 - ETAPA 5)
        tx.executeSql(
          `ALTER TABLE clan_messages ADD COLUMN edited INTEGER DEFAULT 0;`,
          [],
          () => {},
          () => {} // Ignora erro se coluna já existe
        );

        tx.executeSql(
          `ALTER TABLE clan_messages ADD COLUMN deleted INTEGER DEFAULT 0;`,
          [],
          () => {},
          () => {} // Ignora erro se coluna já existe
        );

        tx.executeSql(
          `ALTER TABLE clan_messages ADD COLUMN original_content TEXT;`,
          [],
          () => {},
          () => {} // Ignora erro se coluna já existe
        );

        tx.executeSql(
          `ALTER TABLE clan_messages ADD COLUMN edited_at INTEGER;`,
          [],
          () => {},
          () => {} // Ignora erro se coluna já existe
        );

        // Índice para performance nas queries de mensagens
        tx.executeSql(
          `CREATE INDEX IF NOT EXISTS idx_messages_clan_id ON clan_messages(clan_id);`
        );

      },
      (error) => reject(error),
      () => resolve(true));
    });
  }

  // ---------------------------------------------------------
  // Criar CLANN
  // ---------------------------------------------------------
  createClan(data, totemId) {
    if (Platform.OS === 'web' || !this.db) {
      // Na Web, salva no localStorage
      const invite = this._generateInviteCode();
      const clanId = Date.now();
      const now = new Date().toISOString();
      
      const newClan = {
        id: clanId,
        name: data.name,
        icon: data.icon,
        description: data.description || '',
        invite_code: invite,
        privacy: data.privacy || 'public',
        created_at: now,
        founder_totem: totemId
      };

      // Salva o CLANN
      const clans = this._getWebClans();
      clans.push(newClan);
      this._saveWebClans(clans);

      // Salva o membro (fundador)
      const members = this._getWebMembers();
      members.push({
        id: Date.now() + 1,
        clan_id: clanId,
        totem_id: totemId,
        role: 'founder',
        joined_at: now
      });
      this._saveWebMembers(members);

      return Promise.resolve({
        id: clanId,
        name: data.name,
        icon: data.icon,
        description: data.description || '',
        invite_code: invite,
        privacy: data.privacy || 'public',
        members: 1,
        role: 'founder'
      });
    }

    const invite = this._generateInviteCode();

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO clans (name, icon, description, invite_code, privacy, created_at, founder_totem)
           VALUES (?, ?, ?, ?, ?, datetime('now'), ?);`,
          [data.name, data.icon, data.description || null, invite, data.privacy || 'public', totemId],
          (_, result) => {
            const clanId = result.insertId;

            // Inserir o fundador como membro
            tx.executeSql(
              `INSERT INTO clan_members (clan_id, totem_id, role, joined_at)
               VALUES (?, ?, 'founder', datetime('now'));`,
              [clanId, totemId]
            );

            resolve({
              id: clanId,
              name: data.name,
              icon: data.icon,
              description: data.description,
              invite_code: invite
            });
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // ---------------------------------------------------------
  // Entrar no CLANN via invite code
  // ---------------------------------------------------------
  joinClan(inviteCode, totemId) {
    if (Platform.OS === 'web' || !this.db) {
      // Na Web, busca no localStorage
      const clans = this._getWebClans();
      const clan = clans.find(c => c.invite_code === inviteCode.toUpperCase());
      
      if (!clan) {
        return Promise.reject(new Error('Código de convite inválido'));
      }

      // Verifica se já é membro
      const members = this._getWebMembers();
      const alreadyMember = members.some(
        m => m.clan_id === clan.id && m.totem_id === totemId
      );

      if (alreadyMember) {
        return Promise.reject(new Error('Você já é membro deste CLANN'));
      }

      // Adiciona como membro
      members.push({
        id: Date.now(),
        clan_id: clan.id,
        totem_id: totemId,
        role: 'member',
        joined_at: new Date().toISOString()
      });
      this._saveWebMembers(members);

      return Promise.resolve(clan);
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {

        tx.executeSql(
          `SELECT * FROM clans WHERE invite_code = ? LIMIT 1;`,
          [inviteCode],
          (_, { rows }) => {
            if (rows.length === 0) {
              reject(new Error("Código de convite inválido"));
              return;
            }

            const clan = rows.item(0);

            tx.executeSql(
              `INSERT INTO clan_members (clan_id, totem_id, role, joined_at)
               VALUES (?, ?, 'member', datetime('now'));`,
              [clan.id, totemId],
              () => resolve(clan),
              (_, err) => reject(err)
            );
          }
        );

      });
    });
  }

  // ---------------------------------------------------------
  // Sair do CLANN
  // ---------------------------------------------------------
  leaveClan(clanId, totemId) {
    if (Platform.OS === 'web' || !this.db) {
      // Na Web, remove do localStorage
      const members = this._getWebMembers();
      const filtered = members.filter(
        m => !(m.clan_id === parseInt(clanId) && m.totem_id === totemId)
      );
      this._saveWebMembers(filtered);
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM clan_members WHERE clan_id = ? AND totem_id = ?;`,
          [clanId, totemId],
          () => resolve(true),
          (_, err) => reject(err)
        );
      });
    });
  }

  // ---------------------------------------------------------
  // Buscar CLANN por ID
  // ---------------------------------------------------------
  getClanById(clanId) {
    if (Platform.OS === 'web' || !this.db) {
      // Na Web, busca no localStorage
      const clans = this._getWebClans();
      const clan = clans.find(c => c.id === parseInt(clanId));
      
      if (!clan) {
        return Promise.reject(new Error('CLANN não encontrado'));
      }

      // Conta membros
      const members = this._getWebMembers();
      const memberCount = members.filter(m => m.clan_id === parseInt(clanId)).length;

      return Promise.resolve({
        ...clan,
        members: memberCount
      });
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `
          SELECT c.*, 
            (SELECT COUNT(*) FROM clan_members WHERE clan_id = c.id) AS members
          FROM clans c
          WHERE c.id = ?
          `,
          [clanId],
          (_, { rows }) => {
            if (rows.length === 0) {
              reject(new Error("CLANN não encontrado"));
            } else {
              resolve(rows.item(0));
            }
          },
          (_, err) => reject(err)
        );
      });
    });
  }

  // ---------------------------------------------------------
  // Buscar CLANNs do usuário
  // ---------------------------------------------------------
  getUserClans(totemId) {
    if (Platform.OS === 'web' || !this.db) {
      // Na Web, busca no localStorage
      const members = this._getWebMembers();
      const clans = this._getWebClans();
      
      // Encontra CLANNs onde o usuário é membro
      const userMemberShips = members.filter(m => m.totem_id === totemId);
      const userClans = userMemberShips.map(membership => {
        const clan = clans.find(c => c.id === membership.clan_id);
        if (!clan) return null;
        
        // Conta membros deste CLANN
        const memberCount = members.filter(m => m.clan_id === clan.id).length;
        
        return {
          ...clan,
          role: membership.role,
          members: memberCount
        };
      }).filter(c => c !== null);

      // Ordena por data de criação (mais recente primeiro)
      userClans.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });

      return Promise.resolve(userClans);
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {

        tx.executeSql(
          `
          SELECT c.*, m.role,
            (SELECT COUNT(*) FROM clan_members WHERE clan_id = c.id) AS members
          FROM clans c
          JOIN clan_members m ON m.clan_id = c.id
          WHERE m.totem_id = ?
          ORDER BY c.created_at DESC;
          `,
          [totemId],
          (_, { rows }) => resolve(rows._array),
          (_, err) => reject(err)
        );

      });
    });
  }

  // ---------------------------------------------------------
  // Utilitário interno
  // ---------------------------------------------------------
  _generateInviteCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
}

export default new ClanStorage();
