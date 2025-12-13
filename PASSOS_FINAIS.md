# 🚀 PASSOS FINAIS - CHAT CLANN PROTÓTIPO COMPLETO

## 📋 OBJETIVO
Completar o CHAT CLANN para ter um protótipo funcional testável em celulares, com comunicação entre dispositivos.

---

## 🎯 FASE 1: BACKEND/SERVIDOR (CRÍTICO)

### **PASSO 1.1: Criar Estrutura do Backend**

**Arquivos a criar:**
```
backend/
├── server.js                 # Servidor principal
├── package.json              # Dependências
├── config/
│   ├── database.js          # Configuração do banco
│   └── websocket.js         # Configuração WebSocket
├── routes/
│   ├── messages.js          # Rotas de mensagens
│   ├── clans.js             # Rotas de CLANNs
│   └── auth.js              # Autenticação
├── models/
│   ├── Message.js           # Modelo de mensagem
│   ├── Clan.js              # Modelo de CLANN
│   └── Member.js            # Modelo de membro
├── controllers/
│   ├── messageController.js
│   ├── clanController.js
│   └── authController.js
├── middleware/
│   ├── auth.js              # Middleware de autenticação
│   └── validation.js        # Validação de dados
└── utils/
    ├── encryption.js        # Criptografia (E2E)
    └── logger.js            # Logging
```

**Dependências necessárias:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "sqlite3": "^5.1.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "crypto": "built-in"
  }
}
```

---

### **PASSO 1.2: Configurar Banco de Dados**

**Arquivo: `backend/config/database.js`**
```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/clann.db');

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco:', err);
        reject(err);
        return;
      }
      console.log('✅ Banco de dados conectado');
    });

    // Criar tabelas
    db.serialize(() => {
      // Tabela de mensagens
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clan_id INTEGER NOT NULL,
          author_totem TEXT NOT NULL,
          message TEXT NOT NULL,
          encrypted INTEGER DEFAULT 1,
          timestamp INTEGER NOT NULL,
          edited INTEGER DEFAULT 0,
          deleted INTEGER DEFAULT 0,
          self_destruct_at INTEGER,
          burn_after_read INTEGER DEFAULT 0,
          FOREIGN KEY (clan_id) REFERENCES clans(id)
        )
      `);

      // Tabela de CLANNs
      db.run(`
        CREATE TABLE IF NOT EXISTS clans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          icon TEXT,
          description TEXT,
          invite_code TEXT UNIQUE NOT NULL,
          privacy TEXT DEFAULT 'private',
          created_at INTEGER NOT NULL,
          founder_totem TEXT NOT NULL
        )
      `);

      // Tabela de membros
      db.run(`
        CREATE TABLE IF NOT EXISTS clan_members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clan_id INTEGER NOT NULL,
          totem_id TEXT NOT NULL,
          role TEXT DEFAULT 'member',
          joined_at INTEGER NOT NULL,
          UNIQUE(clan_id, totem_id),
          FOREIGN KEY (clan_id) REFERENCES clans(id)
        )
      `);

      // Tabela de reações
      db.run(`
        CREATE TABLE IF NOT EXISTS message_reactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message_id INTEGER NOT NULL,
          totem_id TEXT NOT NULL,
          emoji TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          UNIQUE(message_id, totem_id, emoji),
          FOREIGN KEY (message_id) REFERENCES messages(id)
        )
      `);

      // Tabela de status de entrega
      db.run(`
        CREATE TABLE IF NOT EXISTS message_delivery (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message_id INTEGER NOT NULL,
          totem_id TEXT NOT NULL,
          delivered INTEGER DEFAULT 0,
          read INTEGER DEFAULT 0,
          delivered_at INTEGER,
          read_at INTEGER,
          UNIQUE(message_id, totem_id),
          FOREIGN KEY (message_id) REFERENCES messages(id)
        )
      `);

      // Índices para performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_messages_clan ON messages(clan_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_members_clan ON clan_members(clan_id)`);
    });

    resolve(db);
  });
}

module.exports = { initDatabase };
```

---

### **PASSO 1.3: Criar Servidor Express + WebSocket**

**Arquivo: `backend/server.js`**
```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initDatabase } = require('./config/database');
const messageRoutes = require('./routes/messages');
const clanRoutes = require('./routes/clans');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Em produção, especificar domínios
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/messages', messageRoutes);
app.use('/api/clans', clanRoutes);

// WebSocket
const connectedUsers = new Map(); // Map<totemId, socketId>

io.on('connection', (socket) => {
  console.log('✅ Cliente conectado:', socket.id);

  // Autenticação via totemId
  socket.on('authenticate', (data) => {
    const { totemId } = data;
    if (totemId) {
      connectedUsers.set(totemId, socket.id);
      socket.totemId = totemId;
      console.log(`✅ Totem autenticado: ${totemId}`);
    }
  });

  // Enviar mensagem
  socket.on('send_message', async (data) => {
    const { clanId, authorTotem, message, options } = data;
    
    // Salvar mensagem no banco (via API)
    // Broadcast para todos os membros do CLANN
    const members = await getClanMembers(clanId);
    
    members.forEach(member => {
      const memberSocketId = connectedUsers.get(member.totemId);
      if (memberSocketId) {
        io.to(memberSocketId).emit('new_message', {
          clanId,
          authorTotem,
          message,
          timestamp: Date.now(),
          ...options
        });
      }
    });
  });

  // Indicador de digitação
  socket.on('typing', (data) => {
    const { clanId, totemId, isTyping } = data;
    const members = getClanMembers(clanId);
    
    members.forEach(member => {
      if (member.totemId !== totemId) {
        const memberSocketId = connectedUsers.get(member.totemId);
        if (memberSocketId) {
          io.to(memberSocketId).emit('user_typing', {
            clanId,
            totemId,
            isTyping
          });
        }
      }
    });
  });

  // Desconexão
  socket.on('disconnect', () => {
    if (socket.totemId) {
      connectedUsers.delete(socket.totemId);
      console.log(`❌ Totem desconectado: ${socket.totemId}`);
    }
  });
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 WebSocket disponível em ws://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Erro ao inicializar servidor:', err);
  process.exit(1);
});
```

---

### **PASSO 1.4: Criar Rotas de Mensagens**

**Arquivo: `backend/routes/messages.js`**
```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database').db;

// Enviar mensagem
router.post('/', async (req, res) => {
  try {
    const { clanId, authorTotem, message, options = {} } = req.body;

    if (!clanId || !authorTotem || !message) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const timestamp = Date.now();
    const sql = `
      INSERT INTO messages (clan_id, author_totem, message, timestamp, 
                           self_destruct_at, burn_after_read)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      clanId,
      authorTotem,
      message,
      timestamp,
      options.selfDestructAt || null,
      options.burnAfterRead ? 1 : 0
    ], function(err) {
      if (err) {
        console.error('Erro ao salvar mensagem:', err);
        return res.status(500).json({ error: 'Erro ao salvar mensagem' });
      }

      res.json({
        id: this.lastID,
        clanId,
        authorTotem,
        message,
        timestamp,
        ...options
      });
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Buscar mensagens
router.get('/:clanId', async (req, res) => {
  try {
    const { clanId } = req.params;
    const { since } = req.query; // Timestamp da última mensagem

    let sql = `
      SELECT * FROM messages 
      WHERE clan_id = ? AND deleted = 0
    `;
    const params = [clanId];

    if (since) {
      sql += ' AND timestamp > ?';
      params.push(since);
    }

    sql += ' ORDER BY timestamp ASC';

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Erro ao buscar mensagens:', err);
        return res.status(500).json({ error: 'Erro ao buscar mensagens' });
      }

      res.json(rows);
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Editar mensagem
router.patch('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { newText, totemId } = req.body;

    // Verificar se é o autor
    db.get('SELECT author_totem FROM messages WHERE id = ?', [messageId], (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Mensagem não encontrada' });
      }

      if (row.author_totem !== totemId) {
        return res.status(403).json({ error: 'Não autorizado' });
      }

      db.run(
        'UPDATE messages SET message = ?, edited = 1, edited_at = ? WHERE id = ?',
        [newText, Date.now(), messageId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao editar mensagem' });
          }
          res.json({ success: true });
        }
      );
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Deletar mensagem
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { totemId } = req.body;

    // Verificar se é o autor
    db.get('SELECT author_totem FROM messages WHERE id = ?', [messageId], (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Mensagem não encontrada' });
      }

      if (row.author_totem !== totemId) {
        return res.status(403).json({ error: 'Não autorizado' });
      }

      db.run('UPDATE messages SET deleted = 1 WHERE id = ?', [messageId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao deletar mensagem' });
        }
        res.json({ success: true });
      });
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
```

---

### **PASSO 1.5: Integrar Backend no App React Native**

**Arquivo: `src/services/api.js`** (criar novo)
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Desenvolvimento
  : 'https://seu-servidor.com/api'; // Produção

class ApiService {
  async sendMessage(clanId, authorTotem, message, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clanId,
          authorTotem,
          message,
          options
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async getMessages(clanId, since = null) {
    try {
      let url = `${API_BASE_URL}/messages/${clanId}`;
      if (since) {
        url += `?since=${since}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar mensagens');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  }
}

export default new ApiService();
```

**Arquivo: `src/services/websocket.js`** (criar novo)
```javascript
import { io } from 'socket.io-client';
import { getCurrentTotemId } from '../crypto/totemStorage';

const WS_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://seu-servidor.com';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', async () => {
      console.log('✅ WebSocket conectado');
      this.connected = true;

      // Autenticar com totemId
      const totemId = await getCurrentTotemId();
      if (totemId) {
        this.socket.emit('authenticate', { totemId });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      this.connected = false;
    });

    // Escutar novas mensagens
    this.socket.on('new_message', (data) => {
      const handler = this.listeners.get('new_message');
      if (handler) {
        handler(data);
      }
    });

    // Escutar indicador de digitação
    this.socket.on('user_typing', (data) => {
      const handler = this.listeners.get('user_typing');
      if (handler) {
        handler(data);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  sendMessage(clanId, authorTotem, message, options = {}) {
    if (!this.connected) {
      throw new Error('WebSocket não conectado');
    }

    this.socket.emit('send_message', {
      clanId,
      authorTotem,
      message,
      options
    });
  }

  sendTyping(clanId, totemId, isTyping) {
    if (!this.connected) {
      return;
    }

    this.socket.emit('typing', {
      clanId,
      totemId,
      isTyping
    });
  }

  on(event, handler) {
    this.listeners.set(event, handler);
  }

  off(event) {
    this.listeners.delete(event);
  }
}

export default new WebSocketService();
```

**Atualizar: `src/messages/MessagesManager.js`**
```javascript
// Adicionar no início do arquivo
import ApiService from '../services/api';
import WebSocketService from '../services/websocket';

// Modificar método addMessage para usar backend
async addMessage(clanId, authorTotem, text, options = {}) {
  // ... validações existentes ...

  try {
    // Enviar para backend via WebSocket (real-time)
    WebSocketService.sendMessage(clanId, authorTotem, encryptedText, options);

    // Também salvar localmente (offline-first)
    const message = await this.storage.addMessage(
      parseInt(clanId),
      authorTotem.trim(),
      encryptedText,
      { selfDestructAt, burnAfterRead }
    );

    return message;
  } catch (error) {
    // Fallback: salvar apenas localmente se backend falhar
    console.warn('Backend offline, salvando apenas localmente:', error);
    return await this.storage.addMessage(/* ... */);
  }
}
```

**Atualizar: `src/screens/ClanChatScreen.js`**
```javascript
// Adicionar no início
import WebSocketService from '../services/websocket';

// No useEffect de inicialização
useEffect(() => {
  // Conectar WebSocket
  WebSocketService.connect();

  // Escutar novas mensagens
  WebSocketService.on('new_message', (data) => {
    if (data.clanId === clan?.id) {
      // Adicionar mensagem à lista
      setMessages(prev => [...prev, data]);
    }
  });

  return () => {
    WebSocketService.off('new_message');
  };
}, [clan?.id]);
```

---

## 🎯 FASE 2: NOTIFICAÇÕES PUSH

### **PASSO 2.1: Instalar Dependências**

```bash
npx expo install expo-notifications
```

### **PASSO 2.2: Configurar Notificações**

**Arquivo: `src/services/notifications.js`** (criar novo)
```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  async registerForPushNotifications() {
    if (!Device.isDevice) {
      console.warn('Notificações push só funcionam em dispositivos físicos');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permissão de notificação negada');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('✅ Token de notificação:', token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  async scheduleLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Imediato
    });
  }

  setNotificationListener(handler) {
    return Notifications.addNotificationReceivedListener(handler);
  }

  setNotificationResponseListener(handler) {
    return Notifications.addNotificationResponseReceivedListener(handler);
  }

  async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
  }
}

export default new NotificationService();
```

**Atualizar: `src/screens/ClanChatScreen.js`**
```javascript
import NotificationService from '../services/notifications';

// No useEffect de inicialização
useEffect(() => {
  // Registrar para notificações
  NotificationService.registerForPushNotifications();

  // Escutar notificações recebidas
  const subscription = NotificationService.setNotificationListener(
    (notification) => {
      console.log('Notificação recebida:', notification);
    }
  );

  return () => {
    subscription.remove();
  };
}, []);
```

---

## 🎯 FASE 3: MÍDIA (FOTOS/VÍDEOS/ÁUDIOS)

### **PASSO 3.1: Instalar Dependências**

```bash
npx expo install expo-image-picker expo-camera expo-av expo-document-picker
```

### **PASSO 3.2: Criar Plugin de Mídia**

**Arquivo: `src/plugins/media/MediaPlugin.js`** (criar novo)
```javascript
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

class MediaPlugin {
  async pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permissão de galeria negada');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      return {
        uri: result.assets[0].uri,
        type: 'image',
        name: result.assets[0].fileName || 'image.jpg',
      };
    }

    return null;
  }

  async takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permissão de câmera negada');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      return {
        uri: result.assets[0].uri,
        type: 'image',
        name: 'photo.jpg',
      };
    }

    return null;
  }

  async pickVideo() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permissão de galeria negada');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      return {
        uri: result.assets[0].uri,
        type: 'video',
        name: result.assets[0].fileName || 'video.mp4',
      };
    }

    return null;
  }

  async pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        return {
          uri: result.assets[0].uri,
          type: 'document',
          name: result.assets[0].name,
          mimeType: result.assets[0].mimeType,
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao selecionar documento:', error);
      throw error;
    }
  }
}

export default new MediaPlugin();
```

### **PASSO 3.3: Integrar Mídia no MessageInput**

**Atualizar: `src/components/chat/MessageInput.js`**
```javascript
import MediaPlugin from '../../plugins/media/MediaPlugin';

// Adicionar função para anexar mídia
const handleAttachMedia = async () => {
  try {
    Alert.alert(
      'Anexar Mídia',
      'Escolha o tipo de mídia',
      [
        { text: 'Foto da Galeria', onPress: async () => {
          const image = await MediaPlugin.pickImage();
          if (image) {
            onSendMedia(image);
          }
        }},
        { text: 'Tirar Foto', onPress: async () => {
          const photo = await MediaPlugin.takePhoto();
          if (photo) {
            onSendMedia(photo);
          }
        }},
        { text: 'Vídeo', onPress: async () => {
          const video = await MediaPlugin.pickVideo();
          if (video) {
            onSendMedia(video);
          }
        }},
        { text: 'Arquivo', onPress: async () => {
          const doc = await MediaPlugin.pickDocument();
          if (doc) {
            onSendMedia(doc);
          }
        }},
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  } catch (error) {
    Alert.alert('Erro', error.message);
  }
};
```

---

## 🎯 FASE 4: PERFIS DE USUÁRIO

### **PASSO 4.1: Criar Tabela de Perfis no Backend**

**Adicionar ao `backend/config/database.js`:**
```javascript
db.run(`
  CREATE TABLE IF NOT EXISTS user_profiles (
    totem_id TEXT PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    last_seen INTEGER,
    created_at INTEGER NOT NULL
  )
`);
```

### **PASSO 4.2: Criar Componente de Perfil**

**Arquivo: `src/components/profile/UserProfile.js`** (criar novo)
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import ApiService from '../../services/api';

export default function UserProfile({ totemId }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [totemId]);

  const loadProfile = async () => {
    try {
      const data = await ApiService.getProfile(totemId);
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>{totemId.substring(0, 8)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile.avatar_url && (
        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
      )}
      <Text style={styles.name}>
        {profile.display_name || totemId.substring(0, 8)}
      </Text>
      {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  name: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bio: {
    color: '#888',
    fontSize: 12,
  },
});
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **Fase 1: Backend (1-2 semanas)**
- [ ] Criar estrutura de pastas do backend
- [ ] Configurar banco de dados SQLite
- [ ] Criar servidor Express
- [ ] Implementar WebSocket (Socket.io)
- [ ] Criar rotas de mensagens (POST, GET, PATCH, DELETE)
- [ ] Criar rotas de CLANNs
- [ ] Integrar WebSocket no app React Native
- [ ] Testar comunicação entre 2 dispositivos

### **Fase 2: Notificações (3-5 dias)**
- [ ] Instalar expo-notifications
- [ ] Configurar permissões
- [ ] Criar serviço de notificações
- [ ] Integrar no ClanChatScreen
- [ ] Testar notificações locais e push

### **Fase 3: Mídia (1-2 semanas)**
- [ ] Instalar dependências (image-picker, camera, av, document-picker)
- [ ] Criar MediaPlugin
- [ ] Implementar seleção de fotos
- [ ] Implementar câmera
- [ ] Implementar vídeos
- [ ] Implementar áudios
- [ ] Implementar arquivos
- [ ] Integrar no MessageInput
- [ ] Criar visualizador de mídia

### **Fase 4: Perfis (3-5 dias)**
- [ ] Criar tabela de perfis no backend
- [ ] Criar rotas de perfis
- [ ] Criar componente UserProfile
- [ ] Integrar nas mensagens
- [ ] Criar tela de edição de perfil

---

## 🚀 COMANDOS PARA INICIAR

### **Backend:**
```bash
cd backend
npm install
npm start
```

### **App React Native:**
```bash
# Já deve estar rodando
npm start
```

---

## 📝 NOTAS IMPORTANTES

1. **Backend é CRÍTICO** - Sem ele, não há comunicação entre dispositivos
2. **WebSocket é essencial** - Para real-time
3. **Notificações melhoram UX** - Mas não bloqueiam testes básicos
4. **Mídia é importante** - Mas pode ser adicionada depois
5. **Perfis melhoram UX** - Mas não são críticos

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **Backend básico** (servidor + banco + rotas)
2. **WebSocket** (real-time)
3. **Integração no app** (conectar ao servidor)
4. **Testar entre 2 dispositivos**
5. **Notificações** (melhorar UX)
6. **Mídia** (completar funcionalidades)
7. **Perfis** (polimento final)

---

**Tempo total estimado:** 3-4 semanas para protótipo completo

