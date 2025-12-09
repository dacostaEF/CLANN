import * as SQLite from 'expo-sqlite';

class ClanStorage {
  constructor() {
    this.db = SQLite.openDatabase('clans.db');
  }

  getDB() {
    return this.db;
  }

  async init() {
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

      },
      (error) => reject(error),
      () => resolve(true));
    });
  }

  // ---------------------------------------------------------
  // Criar CLANN
  // ---------------------------------------------------------
  createClan(data, totemId) {
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
