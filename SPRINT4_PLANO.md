# 🚀 SPRINT 4 - PLANO DE IMPLEMENTAÇÃO DO CHAT BÁSICO

## 📋 ANÁLISE DA ARQUITETURA ATUAL

### ✅ **Pontos Validados:**

1. **ClanStorage.js** - Estrutura SQLite existente:
   - ✅ Banco: `clans.db`
   - ✅ Tabelas existentes: `clans`, `clan_members`, `clan_activity`
   - ✅ Método `init()` já implementado com transações
   - ✅ Suporte Web: localStorage (polyfill já implementado)
   - ✅ Padrão: `clan_id` (INTEGER) e `totem_id` (TEXT)

2. **TotemId - Acesso:**
   - ✅ `getCurrentTotemId()` em `src/crypto/totemStorage.js`
   - ✅ `useTotem()` hook do TotemContext
   - ✅ Padrão: `totem.totemId` (string)

3. **Navegação:**
   - ✅ `ClanChatScreen` já existe e recebe `{ clanId, clan }` via params
   - ✅ Rota `ClanChat` já registrada no `App.js`
   - ✅ Navegação de `ClanDetailScreen` e `ClanInviteScreen` já implementada
   - ⚠️ **ISSUE**: `BottomTabNavigator` usa `ClanChatScreen` diretamente na aba "Chats" (precisa mudar)

4. **Estrutura de Diretórios:**
   - ✅ `src/clans/` - Armazenamento de CLANNs
   - ✅ `src/screens/` - Telas
   - ✅ `src/components/` - Componentes reutilizáveis
   - ❌ `src/messages/` - **NÃO EXISTE** (precisa criar)

5. **Dependências:**
   - ✅ `@react-navigation/native` - Navegação
   - ✅ `expo-sqlite` - Banco de dados
   - ✅ `react-native-safe-area-context` - SafeAreaView
   - ✅ `@expo/vector-icons` - Ícones

---

## 🎯 OBJETIVO DO SPRINT 4

Implementar chat básico funcional com:
- ✅ Mensagens armazenadas localmente (SQLite)
- ✅ Interface tipo WhatsApp (bolhas)
- ✅ Envio e listagem funcionando
- ✅ Atualização automática ao focar na tela
- ✅ Suporte Web (localStorage)

---

## 📁 ESTRUTURA DE ARQUIVOS A CRIAR

```
src/
├── messages/
│   ├── MessagesStorage.js      ← Camada de acesso ao SQLite
│   └── MessagesManager.js      ← Lógica de negócio
```

**NOTA:** Não criar arquivos ainda, apenas preparar estrutura.

---

## 🔧 ETAPAS DE IMPLEMENTAÇÃO (ORDEM EXATA)

### **ETAPA 1: Criar Tabela `clan_messages` no SQLite**

**Arquivo:** `src/clans/ClanStorage.js`  
**Método:** `init()` (linha ~69)

**SQL a adicionar:**
```sql
CREATE TABLE IF NOT EXISTS clan_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clan_id INTEGER NOT NULL,
  author_totem TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (clan_id) REFERENCES clans(id)
);
```

**Observações:**
- ✅ Usar `clan_id` (INTEGER) para consistência com tabelas existentes
- ✅ Usar `author_totem` (TEXT) para consistência com `totem_id` em `clan_members`
- ✅ `timestamp` como INTEGER (Date.now()) para ordenação eficiente
- ✅ Adicionar índice: `CREATE INDEX IF NOT EXISTS idx_messages_clan_id ON clan_messages(clan_id);`

**Suporte Web:**
- Chave localStorage: `'clann_messages'`
- Estrutura: Array de objetos `{ id, clan_id, author_totem, message, timestamp }`

---

### **ETAPA 2: Criar MessagesStorage.js**

**Arquivo:** `src/messages/MessagesStorage.js`

**Responsabilidades:**
- Acesso direto ao SQLite (ou localStorage no web)
- Métodos CRUD básicos
- Não contém lógica de negócio

**Métodos a implementar:**

```javascript
class MessagesStorage {
  // Construtor (similar ao ClanStorage)
  constructor() { ... }
  
  // Inicialização (usa o mesmo db do ClanStorage)
  async init() { ... }
  
  // Adicionar mensagem
  async addMessage(clanId, authorTotem, text) { ... }
  
  // Buscar mensagens de um CLANN
  async getMessages(clanId) { ... }
  
  // Deletar mensagem (para futuro)
  async deleteMessage(messageId) { ... }
  
  // Limpar todas as mensagens de um CLANN
  async clearMessages(clanId) { ... }
  
  // Helpers para Web (localStorage)
  _getWebMessages() { ... }
  _saveWebMessages(messages) { ... }
}
```

**Observações:**
- ✅ Reutilizar `ClanStorage.getDB()` ou criar instância própria?
- ⚠️ **DECISÃO**: Criar instância própria para manter separação de responsabilidades
- ✅ Banco: `clans.db` (mesmo banco, tabela diferente)

---

### **ETAPA 3: Criar MessagesManager.js**

**Arquivo:** `src/messages/MessagesManager.js`

**Responsabilidades:**
- Lógica de negócio
- Validações
- Ordenação
- Encapsulamento de MessagesStorage

**Métodos a implementar:**

```javascript
class MessagesManager {
  constructor() {
    this.storage = new MessagesStorage();
  }
  
  // Inicializar storage
  async init() { ... }
  
  // Adicionar mensagem com validação
  async addMessage(clanId, authorTotem, text) {
    // Validar: text não vazio, trim, max length?
    // Adicionar timestamp
    // Chamar storage.addMessage()
  }
  
  // Buscar mensagens ordenadas
  async getMessages(clanId) {
    // Buscar do storage
    // Ordenar por timestamp (ASC)
    // Retornar array formatado
  }
  
  // Deletar mensagem
  async deleteMessage(messageId) { ... }
  
  // Limpar mensagens
  async clearMessages(clanId) { ... }
}
```

**Validações:**
- ✅ Texto não vazio após trim
- ✅ Texto não excede 5000 caracteres (limite razoável)
- ✅ `clanId` e `authorTotem` não nulos

---

### **ETAPA 4: Atualizar ClanChatScreen.js**

**Arquivo:** `src/screens/ClanChatScreen.js` (já existe)

**Modificações necessárias:**

1. **Imports:**
   ```javascript
   import MessagesManager from '../messages/MessagesManager';
   import { getCurrentTotemId } from '../crypto/totemStorage';
   import { useFocusEffect } from '@react-navigation/native';
   ```

2. **Estado:**
   - ✅ `messages` - já existe
   - ✅ `messageText` - já existe
   - ➕ `currentTotemId` - novo estado
   - ➕ `flatListRef` - ref para scroll automático

3. **Inicialização:**
   ```javascript
   const messagesManager = new MessagesManager();
   
   useEffect(() => {
     // Inicializar MessagesManager
     messagesManager.init();
     
     // Carregar totemId atual
     loadCurrentTotemId();
   }, []);
   ```

4. **Carregar mensagens:**
   ```javascript
   const loadMessages = async () => {
     if (!clan?.id) return;
     
     try {
       const msgs = await messagesManager.getMessages(clan.id);
       setMessages(msgs);
       
       // Scroll para o final
       setTimeout(() => {
         flatListRef.current?.scrollToEnd({ animated: true });
       }, 100);
     } catch (error) {
       console.error('Erro ao carregar mensagens:', error);
     }
   };
   ```

5. **useFocusEffect:**
   ```javascript
   useFocusEffect(
     useCallback(() => {
       loadMessages();
     }, [clan?.id])
   );
   ```

6. **handleSendMessage:**
   ```javascript
   const handleSendMessage = async () => {
     if (!messageText.trim() || !clan?.id || !currentTotemId) return;
     
     try {
       await messagesManager.addMessage(
         clan.id,
         currentTotemId,
         messageText.trim()
       );
       
       setMessageText('');
       await loadMessages(); // Recarregar lista
     } catch (error) {
       console.error('Erro ao enviar mensagem:', error);
       Alert.alert('Erro', 'Não foi possível enviar a mensagem');
     }
   };
   ```

7. **FlatList:**
   - ✅ Inverter lista: `inverted={true}`
   - ✅ KeyExtractor: `item.id.toString()`
   - ✅ RenderItem: Componente de bolha (usuário vs outros)

8. **Campo de input:**
   - ✅ Habilitar: `editable={true}`
   - ✅ onSubmitEditing: chamar `handleSendMessage`

---

### **ETAPA 5: Estilo do Chat (Bolhas)**

**Layout WhatsApp/Signal:**

**Bolha do usuário (direita):**
```javascript
<View style={styles.messageBubbleUser}>
  <Text style={styles.messageTextUser}>{item.message}</Text>
  <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
</View>
```

**Estilos:**
- `backgroundColor: '#1E88E5'` (azul)
- `alignSelf: 'flex-end'`
- `borderRadius: 18`
- `padding: 12px`
- `maxWidth: '75%'`

**Bolha de outros (esquerda):**
```javascript
<View style={styles.messageBubbleOther}>
  <Text style={styles.messageTextOther}>{item.message}</Text>
  <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
</View>
```

**Estilos:**
- `backgroundColor: '#333'` (cinza escuro)
- `alignSelf: 'flex-start'`
- `borderRadius: 18`
- `padding: 12px`
- `maxWidth: '75%'`

**Campo de input:**
- `backgroundColor: '#111'`
- `borderRadius: 20`
- `padding: 12px 16px`
- `color: '#fff'`

---

### **ETAPA 6: Atualização Automática**

**Implementar:**
1. `useFocusEffect` - recarrega ao focar na tela
2. Após enviar mensagem - recarrega imediatamente
3. Scroll automático para última mensagem

**Código:**
```javascript
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  useCallback(() => {
    loadMessages();
  }, [clan?.id])
);
```

---

### **ETAPA 7: Ajustar BottomTabNavigator**

**Problema atual:**
- Aba "Chats" usa `ClanChatScreen` diretamente
- Deveria listar CLANNs e navegar para chat específico

**Solução:**
1. Criar `ChatsListScreen.js` (nova tela)
2. Listar todos os CLANNs do usuário
3. Ao clicar → navegar para `ClanChat` com `clanId`

**OU (mais simples para Sprint 4):**
- Manter `ClanChatScreen` na aba
- Mas adicionar lógica: se não receber `clanId`, mostrar lista de CLANNs

**DECISÃO:** Criar `ChatsListScreen.js` separada para manter responsabilidades claras.

---

## ⚠️ PONTOS DE ATENÇÃO

### **1. Compatibilidade Web:**
- ✅ localStorage já implementado em `ClanStorage`
- ✅ Replicar padrão em `MessagesStorage`
- ✅ Estrutura: Array de objetos JSON

### **2. Identificação de Mensagens:**
- ✅ Usar `author_totem` (totemId do autor)
- ✅ Comparar com `currentTotemId` para determinar se é do usuário
- ✅ Não mostrar nome do autor ainda (Sprint 5)

### **3. Timestamp:**
- ✅ Usar `Date.now()` (INTEGER)
- ✅ Ordenar ASC para exibir do mais antigo ao mais recente
- ✅ FlatList `inverted={true}` para mostrar mais recente embaixo

### **4. Performance:**
- ✅ Índice em `clan_id` para queries rápidas
- ✅ Limitar mensagens? (não no Sprint 4)
- ✅ Paginação? (não no Sprint 4)

### **5. Validações:**
- ✅ Texto não vazio
- ✅ Texto não muito longo (5000 chars)
- ✅ `clanId` válido
- ✅ `authorTotem` válido

---

## 🚫 NÃO IMPLEMENTAR NO SPRINT 4

- ❌ Criptografia ponta a ponta
- ❌ Confirmação de leitura
- ❌ Edição/remoção de mensagens
- ❌ Uploads de mídia
- ❌ Notificações
- ❌ Sincronização entre dispositivos
- ❌ Nomes de usuários (apenas totemId)
- ❌ Avatares
- ❌ Status online/offline

---

## 📊 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Infraestrutura
- [ ] Adicionar tabela `clan_messages` em `ClanStorage.init()`
- [ ] Criar diretório `src/messages/`
- [ ] Criar `MessagesStorage.js` com métodos CRUD
- [ ] Criar `MessagesManager.js` com lógica de negócio
- [ ] Testar storage isoladamente

### Fase 2: Interface
- [ ] Atualizar `ClanChatScreen.js` com lógica de mensagens
- [ ] Implementar bolhas (usuário vs outros)
- [ ] Implementar campo de input funcional
- [ ] Implementar scroll automático
- [ ] Implementar `useFocusEffect`

### Fase 3: Integração
- [ ] Conectar envio de mensagens
- [ ] Conectar listagem de mensagens
- [ ] Testar fluxo completo
- [ ] Ajustar `BottomTabNavigator` ou criar `ChatsListScreen`

### Fase 4: Polimento
- [ ] Validações de entrada
- [ ] Tratamento de erros
- [ ] Loading states
- [ ] Empty states
- [ ] Testes básicos

---

## 🔍 VALIDAÇÕES FINAIS

Antes de começar a implementar, validar:

1. ✅ `ClanStorage.init()` está sendo chamado no `App.js`?
2. ✅ `getCurrentTotemId()` funciona corretamente?
3. ✅ Navegação para `ClanChat` está funcionando?
4. ✅ Estrutura de `clan` object está clara? (`clan.id` vs `clan.clanId`)

**NOTA:** Verificar inconsistência: `ClanStorage` usa `id` (INTEGER) mas alguns lugares usam `clanId` (TEXT). Validar qual usar.

---

## 📝 NOTAS TÉCNICAS

### **Estrutura de Mensagem:**
```javascript
{
  id: 1,                    // INTEGER (auto-increment)
  clan_id: 123,             // INTEGER (FK para clans.id)
  author_totem: "TOTEM123", // TEXT (totemId do autor)
  message: "Olá!",          // TEXT
  timestamp: 1234567890     // INTEGER (Date.now())
}
```

### **Queries SQL:**
```sql
-- Inserir mensagem
INSERT INTO clan_messages (clan_id, author_totem, message, timestamp)
VALUES (?, ?, ?, ?);

-- Buscar mensagens de um CLANN
SELECT * FROM clan_messages 
WHERE clan_id = ? 
ORDER BY timestamp ASC;

-- Deletar mensagem
DELETE FROM clan_messages WHERE id = ?;

-- Limpar mensagens de um CLANN
DELETE FROM clan_messages WHERE clan_id = ?;
```

### **localStorage (Web):**
```javascript
// Estrutura
[
  { id: 1, clan_id: 123, author_totem: "TOTEM123", message: "Olá!", timestamp: 1234567890 },
  { id: 2, clan_id: 123, author_totem: "TOTEM456", message: "Oi!", timestamp: 1234567891 }
]

// Chave: 'clann_messages'
```

---

## ✅ PRONTO PARA IMPLEMENTAÇÃO

Arquitetura validada, estrutura planejada, dependências verificadas.

**Próximo passo:** Aguardar aprovação para começar implementação seguindo ordem exata das etapas.

