import * as SQLite from 'expo-sqlite';

const DB_NAME = 'clann.db';

let db = null;

const initDatabase = () => {
  if (!db) {
    db = SQLite.openDatabase(DB_NAME);
    
    db.transaction(tx => {
      // Tabela de CLANNs
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS clans (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          icon TEXT DEFAULT '🛡️',
          description TEXT,
          rules TEXT,
          privacy TEXT DEFAULT 'private',
          max_members INTEGER DEFAULT 50,
          created_at TEXT,
          created_by TEXT,
          invite_code TEXT UNIQUE,
          metadata TEXT
        )`
      );
      
      // Tabela de membros
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS clan_members (
          clan_id TEXT,
          totem_id TEXT,
          joined_at TEXT,
          role TEXT DEFAULT 'member',
          FOREIGN KEY (clan_id) REFERENCES clans(id),
          PRIMARY KEY (clan_id, totem_id)
        )`
      );
      
      // Índices para performance
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_clan_members ON clan_members(clan_id)');
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_member_clans ON clan_members(totem_id)');
    });
  }
};

export default class ClanStorage {
  static getDB() {
    initDatabase();
    return db;
  }

  // Cria um novo CLANN
  static async createClan(clanData, creatorTotemId) {
    return new Promise((resolve, reject) => {
      const db = this.getDB();
      
      const clanId = `clan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const inviteCode = this.generateInviteCode();
      const now = new Date().toISOString();
      
      const clan = {
        id: clanId,
        name: clanData.name,
        icon: clanData.icon || '🛡️',
        description: clanData.description || '',
        rules: clanData.rules || '',
        privacy: clanData.privacy || 'private',
        max_members: clanData.maxMembers || 50,
        created_at: now,
        created_by: creatorTotemId,
        invite_code: inviteCode,
        metadata: JSON.stringify({
          version: 1,
          theme: 'default'
        })
      };

      db.transaction(tx => {
        // Insere o CLANN
        tx.executeSql(
          `INSERT INTO clans 
           (id, name, icon, description, rules, privacy, max_members, created_at, created_by, invite_code, metadata)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            clan.id,
            clan.name,
            clan.icon,
            clan.description,
            clan.rules,
            clan.privacy,
            clan.max_members,
            clan.created_at,
            clan.created_by,
            clan.invite_code,
            clan.metadata
          ],
          (_, result) => {
            // Adiciona criador como fundador
            tx.executeSql(
              `INSERT INTO clan_members (clan_id, totem_id, joined_at, role)
               VALUES (?, ?, ?, ?)`,
              [clanId, creatorTotemId, now, 'founder'],
              () => resolve({ ...clan, members: 1 })
            );
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Entra em um CLANN existente
  static async joinClan(inviteCode, totemId) {
    return new Promise((resolve, reject) => {
      const db = this.getDB();
      
      db.transaction(tx => {
        // 1. Encontra o CLANN pelo código
        tx.executeSql(
          `SELECT * FROM clans WHERE invite_code = ?`,
          [inviteCode],
          (_, { rows }) => {
            const clan = rows._array[0];
            if (!clan) {
              reject(new Error('CLANN não encontrado'));
              return;
            }
            
            // 2. Verifica se já é membro
            tx.executeSql(
              `SELECT 1 FROM clan_members WHERE clan_id = ? AND totem_id = ?`,
              [clan.id, totemId],
              (_, { rows: memberRows }) => {
                if (memberRows._array.length > 0) {
                  reject(new Error('Você já é membro deste CLANN'));
                  return;
                }
                
                // 3. Verifica limite de membros
                tx.executeSql(
                  `SELECT COUNT(*) as count FROM clan_members WHERE clan_id = ?`,
                  [clan.id],
                  (_, { rows: countRows }) => {
                    const currentMembers = countRows._array[0].count;
                    if (currentMembers >= clan.max_members) {
                      reject(new Error('CLANN atingiu o limite de membros'));
                      return;
                    }
                    
                    // 4. Adiciona como membro
                    tx.executeSql(
                      `INSERT INTO clan_members (clan_id, totem_id, joined_at, role)
                       VALUES (?, ?, ?, ?)`,
                      [clan.id, totemId, new Date().toISOString(), 'member'],
                      () => {
                        // 5. Retorna CLANN atualizado
                        resolve({
                          ...clan,
                          members: currentMembers + 1,
                          metadata: JSON.parse(clan.metadata || '{}')
                        });
                      }
                    );
                  }
                );
              }
            );
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Lista CLANNs do usuário
  static async getUserClans(totemId) {
    return new Promise((resolve, reject) => {
      const db = this.getDB();
      
      db.transaction(tx => {
        tx.executeSql(
          `SELECT 
            c.*,
            COUNT(cm.totem_id) as member_count,
            cm.role as user_role
           FROM clans c
           JOIN clan_members cm ON c.id = cm.clan_id
           WHERE cm.totem_id = ?
           GROUP BY c.id
           ORDER BY c.created_at DESC`,
          [totemId],
          (_, { rows }) => {
            const clans = rows._array.map(clan => ({
              ...clan,
              members: clan.member_count,
              metadata: JSON.parse(clan.metadata || '{}'),
              userRole: clan.user_role
            }));
            resolve(clans);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Busca CLANN por ID
  static async getClanById(clanId, totemId = null) {
    return new Promise((resolve, reject) => {
      const db = this.getDB();
      
      db.transaction(tx => {
        // Busca CLANN
        tx.executeSql(
          `SELECT 
            c.*,
            COUNT(cm.totem_id) as member_count
           FROM clans c
           LEFT JOIN clan_members cm ON c.id = cm.clan_id
           WHERE c.id = ?
           GROUP BY c.id`,
          [clanId],
          (_, { rows }) => {
            const clan = rows._array[0];
            if (!clan) {
              resolve(null);
              return;
            }
            
            const clanData = {
              ...clan,
              members: clan.member_count,
              metadata: JSON.parse(clan.metadata || '{}')
            };
            
            // Se fornecido totemId, verifica se é membro
            if (totemId) {
              tx.executeSql(
                `SELECT role FROM clan_members 
                 WHERE clan_id = ? AND totem_id = ?`,
                [clanId, totemId],
                (_, { rows: memberRows }) => {
                  clanData.isMember = memberRows._array.length > 0;
                  clanData.userRole = memberRows._array[0]?.role || null;
                  resolve(clanData);
                }
              );
            } else {
              resolve(clanData);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Lista membros de um CLANN
  static async getClanMembers(clanId) {
    return new Promise((resolve, reject) => {
      const db = this.getDB();
      
      db.transaction(tx => {
        tx.executeSql(
          `SELECT 
            cm.totem_id,
            cm.role,
            cm.joined_at,
            CASE 
              WHEN cm.role = 'founder' THEN 1
              WHEN cm.role = 'admin' THEN 2
              ELSE 3
            END as sort_order
           FROM clan_members cm
           WHERE cm.clan_id = ?
           ORDER BY sort_order, cm.joined_at`,
          [clanId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    });
  }

  // Sai de um CLANN
  static async leaveClan(clanId, totemId) {
    return new Promise((resolve, reject) => {
      const db = this.getDB();
      
      db.transaction(tx => {
        // Verifica se é o fundador
        tx.executeSql(
          `SELECT role FROM clan_members 
           WHERE clan_id = ? AND totem_id = ?`,
          [clanId, totemId],
          (_, { rows }) => {
            const role = rows._array[0]?.role;
            
            if (role === 'founder') {
              // Fundador não pode sair sem transferir
              reject(new Error('Fundador deve transferir o CLANN antes de sair'));
              return;
            }
            
            // Remove membro
            tx.executeSql(
              `DELETE FROM clan_members 
               WHERE clan_id = ? AND totem_id = ?`,
              [clanId, totemId],
              () => resolve(true),
              (_, error) => reject(error)
            );
          }
        );
      });
    });
  }

  // Gera código de convite único
  static generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Remove I, O, 0, 1
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

