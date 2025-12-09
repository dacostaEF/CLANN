# 🏰 ESTRUTURA DO CÓDIGO CLANN - Sprint 3

## 📋 RESUMO DAS ÚLTIMAS 10-11 DOSES

### **Dose 1: Tipos e Constantes** (`src/config/ClanTypes.js`)
- ✅ Constantes: `CLAN_ROLES`, `DEFAULT_CLAN_ICONS`, `CLAN_PRIVACY`
- ✅ Validações: `validateClanName()`, `validateClanDescription()`
- **Propósito:** Base universal para todo o sistema de CLANNs

---

### **Dose 2: Persistência SQLite** (`src/clans/ClanStorage.js`)
- ✅ Banco de dados SQLite (`clann.db`)
- ✅ Tabelas: `clans` e `clan_members`
- ✅ Métodos principais:
  - `createClan()` - Cria CLANN e adiciona fundador
  - `joinClan()` - Entra em CLANN por código
  - `getUserClans()` - Lista CLANNs do usuário
  - `getClanById()` - Busca CLANN específico
  - `getClanMembers()` - Lista membros
  - `leaveClan()` - Sai do CLANN (bloqueia fundador)
  - `generateInviteCode()` - Gera código único de 6 caracteres
- **Propósito:** Camada de persistência local

---

### **Dose 3: Lógica de Negócio** (`src/clans/ClanManager.js`)
- ✅ Validações antes de criar/entrar
- ✅ Normalização de códigos de convite
- ✅ Limite de 5 CLANNs por usuário
- ✅ Verificação de permissões (founder/admin)
- ✅ Métodos:
  - `createClan()` - Valida e cria
  - `joinClan()` - Normaliza código e entra
  - `canCreateClan()` - Verifica limite
  - `updateClan()` - Atualiza com validação de permissões
  - `findClanByCode()` - Placeholder (futuro servidor)
- **Propósito:** Camada de lógica entre UI e Storage

---

### **Dose 4: Tela de Criação** (`src/screens/CreateClanScreen.js`)
- ✅ Formulário completo:
  - Seleção de ícone (16 opções)
  - Nome (3-30 caracteres)
  - Descrição (até 200 caracteres)
  - Regras (texto livre)
  - Máximo de membros (numérico)
  - Privacidade (privado/público)
- ✅ Validações em tempo real
- ✅ Integração com `ClanManager`
- ✅ Placeholder `TEMP_TOTEM_ID` (será substituído por TotemContext)
- **Propósito:** Interface para criar CLANNs

---

### **Dose 5: Tela de Entrada** (`src/screens/JoinClanScreen.js`)
- ✅ Entrada por código de 6 caracteres
- ✅ Scanner QR Code (integração com câmera)
- ✅ Validação de código
- ✅ Integração com `ClanManager`
- ✅ Placeholder `TEMP_TOTEM_ID`
- **Propósito:** Interface para entrar em CLANNs existentes

---

### **Dose 6: Lista de CLANNs** (`src/screens/ClanListScreen.js`)
- ✅ Lista todos os CLANNs do usuário
- ✅ Pull-to-refresh
- ✅ Estado vazio com ações
- ✅ Botão de criar no header
- ✅ Integração com `ClanStorage.getUserClans()`
- ✅ Placeholder `TEMP_TOTEM_ID`
- **Propósito:** Visualizar CLANNs do usuário

---

### **Dose 7: Card de CLANN** (`src/components/ClanCard.js`)
- ✅ Exibe informações do CLANN:
  - Ícone, nome, descrição
  - Contagem de membros
  - Badge de role (👑 founder, ⭐ admin)
  - Privacidade (🔒 privado, 🌍 público)
  - Tempo desde criação
  - Nível do CLANN (placeholder)
- ✅ Design responsivo
- **Propósito:** Componente reutilizável para exibir CLANNs

---

### **Dose 8: Seletor de Ícones** (`src/components/ClanIconPicker.js`)
- ✅ Scroll horizontal de 16 ícones
- ✅ Seleção visual com borda azul
- ✅ Integração com `DEFAULT_CLAN_ICONS`
- **Propósito:** Componente para escolher ícone do CLANN

---

### **Dose 9: Scanner QR Code** (`src/components/QRScannerModal.js`)
- ✅ Scanner funcional com `expo-camera`
- ✅ Gerenciamento de permissões
- ✅ Frame visual para QR Code
- ✅ Alternância câmera frontal/traseira
- ✅ Overlay com instruções
- **Propósito:** Escanear QR Codes de convite

---

### **Dose 10: Dependências** (`package.json` + `app.json`)
- ✅ `expo-camera: ~14.0.0` - Scanner de QR
- ✅ `react-native-qrcode-svg: ^6.1.2` - Geração de QR
- ✅ `@react-native-async-storage/async-storage: 1.21.0` - Storage
- ✅ Permissões da câmera configuradas
- **Propósito:** Suporte técnico para funcionalidades

---

## 🏗️ ARQUITETURA COMPLETA DO SISTEMA CLANN

### **1. CAMADA DE CONFIGURAÇÃO**
```
src/config/
└── ClanTypes.js          # Constantes, validações universais
```

**O que faz:**
- Define roles (founder, admin, member)
- Lista de ícones padrão (16 opções)
- Privacidade (private, public)
- Validações de nome e descrição

---

### **2. CAMADA DE PERSISTÊNCIA**
```
src/clans/
├── ClanStorage.js        # SQLite - CRUD completo
└── __tests__/
    └── ClanStorage.test.js
```

**Estrutura do Banco de Dados:**
```sql
-- Tabela de CLANNs
clans:
  - id (TEXT PRIMARY KEY)
  - name (TEXT NOT NULL)
  - icon (TEXT DEFAULT '🛡️')
  - description (TEXT)
  - rules (TEXT)
  - privacy (TEXT DEFAULT 'private')
  - max_members (INTEGER DEFAULT 50)
  - created_at (TEXT)
  - created_by (TEXT)  -- Totem ID do criador
  - invite_code (TEXT UNIQUE)  -- 6 caracteres
  - metadata (TEXT JSON)

-- Tabela de Membros
clan_members:
  - clan_id (TEXT)
  - totem_id (TEXT)
  - joined_at (TEXT)
  - role (TEXT DEFAULT 'member')
  - PRIMARY KEY (clan_id, totem_id)
```

**Métodos principais:**
- `createClan()` - Cria CLANN + adiciona fundador
- `joinClan()` - Valida e adiciona membro
- `getUserClans()` - Lista CLANNs do usuário
- `getClanById()` - Busca CLANN específico
- `getClanMembers()` - Lista membros ordenados
- `leaveClan()` - Remove membro (bloqueia fundador)

---

### **3. CAMADA DE LÓGICA DE NEGÓCIO**
```
src/clans/
└── ClanManager.js        # Validações, regras de negócio
```

**Fluxo de criação:**
```
1. Valida nome (3-30 caracteres)
2. Valida descrição (até 200 caracteres)
3. Verifica limite (máximo 5 CLANNs)
4. Chama ClanStorage.createClan()
5. Retorna CLANN criado
```

**Fluxo de entrada:**
```
1. Normaliza código (maiúsculas, sem espaços)
2. Valida formato (6 caracteres alfanuméricos)
3. Chama ClanStorage.joinClan()
4. Validações internas:
   - CLANN existe?
   - Já é membro?
   - Tem espaço?
5. Adiciona como membro
```

---

### **4. CAMADA DE COMPONENTES**
```
src/components/
├── ClanCard.js           # Card para exibir CLANN
├── ClanIconPicker.js     # Seletor de ícones
└── QRScannerModal.js     # Scanner QR Code
```

**ClanCard:**
- Recebe: `{ clan, onPress }`
- Exibe: ícone, nome, descrição, membros, role, privacidade, data
- Design: card escuro com bordas, badges visuais

**ClanIconPicker:**
- Recebe: `{ selected, onSelect }`
- Exibe: 16 ícones em scroll horizontal
- Seleção: borda azul quando selecionado

**QRScannerModal:**
- Recebe: `{ visible, onClose, onScanned }`
- Funcionalidades: câmera, permissões, frame visual, alternar câmera

---

### **5. CAMADA DE TELAS**
```
src/screens/
├── CreateClanScreen.js   # Criar CLANN
├── JoinClanScreen.js     # Entrar em CLANN
└── ClanListScreen.js     # Listar CLANNs
```

**CreateClanScreen:**
- Formulário completo
- Validações em tempo real
- Integração com `ClanManager`
- Navega para `ClanInvite` ou `ClanDetail` após criar

**JoinClanScreen:**
- Entrada por código
- Scanner QR Code
- Validação de código
- Navega para `ClanDetail` após entrar

**ClanListScreen:**
- Lista CLANNs do usuário
- Pull-to-refresh
- Estado vazio com ações
- Navega para `ClanDetail` ao tocar

---

### **6. INTEGRAÇÃO COM SISTEMA EXISTENTE**

#### **Context API (Já existente):**
```
src/context/
├── TotemContext.js       # Estado do Totem
├── SecurityContext.js    # Estado de segurança
└── ClanContext.js        # Estado de CLANNs (preparado)
```

**ClanContext** (preparado, mas não usado ainda):
- `myClans` - Array de CLANNs
- `loadMyClans(totemId)` - Carrega do storage
- `addClan()`, `updateClan()`, `removeClan()`
- Será integrado quando substituirmos `TEMP_TOTEM_ID`

---

#### **Services (Já existente):**
```
src/services/
├── clanService.js        # Lógica alternativa (não usado no Sprint 3)
└── clanStorage.js        # Storage alternativo (não usado no Sprint 3)
```

**Nota:** No Sprint 3, usamos `src/clans/ClanStorage.js` diretamente, não os services. Os services foram preparados nos ajustes estruturais mas não estão sendo usados ainda.

---

## 🔄 FLUXO COMPLETO DE USO

### **Criar um CLANN:**
```
1. Usuário abre CreateClanScreen
2. Preenche formulário (nome, ícone, descrição, etc.)
3. Clica "Fundar CLANN"
4. ClanManager.canCreateClan() verifica limite
5. ClanManager.createClan() valida dados
6. ClanStorage.createClan() salva no SQLite
7. Retorna CLANN com invite_code
8. Usuário vê código e pode compartilhar
```

### **Entrar em um CLANN:**
```
1. Usuário abre JoinClanScreen
2. Digita código OU escaneia QR Code
3. ClanManager.joinClan() normaliza código
4. ClanStorage.joinClan() valida:
   - CLANN existe?
   - Já é membro?
   - Tem espaço?
5. Adiciona como membro no SQLite
6. Retorna CLANN atualizado
7. Usuário navega para ClanDetail
```

### **Listar CLANNs:**
```
1. Usuário abre ClanListScreen
2. ClanStorage.getUserClans(totemId) busca no SQLite
3. Retorna array de CLANNs
4. FlatList renderiza ClanCard para cada CLANN
5. Pull-to-refresh recarrega lista
```

---

## 📊 ESTRUTURA DE DADOS

### **Objeto CLANN:**
```javascript
{
  id: "clan_1234567890_abc123",
  name: "Guardiões da Lua",
  icon: "🛡️",
  description: "Descrição do CLANN",
  rules: "Regras do CLANN",
  privacy: "private" | "public",
  max_members: 50,
  created_at: "2024-01-01T00:00:00.000Z",
  created_by: "totem_id_do_criador",
  invite_code: "ABC123",  // 6 caracteres únicos
  metadata: { version: 1, theme: "default" },
  members: 5,  // Contagem
  userRole: "founder" | "admin" | "member",  // Role do usuário atual
  isMember: true  // Se usuário é membro
}
```

### **Objeto Membro:**
```javascript
{
  totem_id: "totem_id_do_membro",
  role: "founder" | "admin" | "member",
  joined_at: "2024-01-01T00:00:00.000Z"
}
```

---

## 🔗 INTEGRAÇÃO COM SPRINTS ANTERIORES

### **Sprint 1 (TOTEM):**
- ✅ CLANNs usam `totem_id` para identificar membros
- ✅ Criador é identificado por `created_by` (totem_id)
- ⚠️ Atualmente usando `TEMP_TOTEM_ID` (placeholder)

### **Sprint 2 (Segurança):**
- ✅ Nenhuma alteração necessária
- ✅ CLANNs são independentes da segurança do Totem
- ✅ Dados armazenados localmente (SQLite)

### **Ajustes Estruturais:**
- ✅ `ClanContext` preparado (não usado ainda)
- ✅ `clanService.js` preparado (não usado ainda)
- ✅ Estrutura pronta para integração futura

---

## 🎯 O QUE ESTÁ FUNCIONANDO

✅ **Criar CLANN:**
- Formulário completo
- Validações
- Geração de código único
- Salvamento no SQLite

✅ **Entrar em CLANN:**
- Por código de 6 caracteres
- Por QR Code (scanner funcional)
- Validações completas

✅ **Listar CLANNs:**
- Lista todos os CLANNs do usuário
- Atualização automática
- Pull-to-refresh

✅ **Persistência:**
- SQLite local
- Relacionamento CLANN ↔ Membros
- Índices para performance

---

## ⚠️ O QUE AINDA É PLACEHOLDER

🔶 **TEMP_TOTEM_ID:**
- Todas as telas usam `'TEMP_TOTEM_ID'`
- Será substituído por `useTotem().totem.totemId` no futuro
- Context API já está preparado

🔶 **Navegações:**
- `ClanDetail` - Tela não criada ainda
- `ClanInvite` - Tela não criada ainda
- Apenas hooks de navegação existem

🔶 **ClanContext:**
- Criado mas não usado
- Telas usam `ClanStorage` diretamente
- Será integrado quando substituirmos `TEMP_TOTEM_ID`

---

## 📁 ESTRUTURA FINAL DE ARQUIVOS

```
src/
├── config/
│   └── ClanTypes.js              # ✅ Dose 1
│
├── clans/
│   ├── ClanStorage.js            # ✅ Dose 2
│   ├── ClanManager.js            # ✅ Dose 3
│   └── __tests__/
│       ├── ClanStorage.test.js
│       └── ClanManager.test.js
│
├── components/
│   ├── ClanCard.js               # ✅ Dose 7
│   ├── ClanIconPicker.js        # ✅ Dose 8
│   └── QRScannerModal.js        # ✅ Dose 9
│
├── screens/
│   ├── CreateClanScreen.js       # ✅ Dose 4
│   ├── JoinClanScreen.js         # ✅ Dose 5
│   └── ClanListScreen.js         # ✅ Dose 6
│
├── context/
│   └── ClanContext.js            # ✅ Preparado (não usado ainda)
│
└── services/
    └── clanService.js            # ✅ Preparado (não usado ainda)
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Substituir TEMP_TOTEM_ID:**
   - Usar `useTotem().totem.totemId` nas telas
   - Integrar com `ClanContext`

2. **Criar telas faltantes:**
   - `ClanDetailScreen` - Detalhes do CLANN
   - `ClanInviteScreen` - Compartilhar código

3. **Integrar Context API:**
   - Usar `ClanContext` em vez de chamadas diretas
   - Sincronizar estado entre telas

4. **Sprint 4 (Chat):**
   - Sistema de mensagens dentro dos CLANNs
   - Criptografia de mensagens
   - Histórico local

---

## 💡 RESUMO EXECUTIVO

**O que foi feito:**
- ✅ Sistema completo de CLANNs (criar, entrar, listar)
- ✅ Persistência SQLite local
- ✅ Interface completa e responsiva
- ✅ Scanner QR Code funcional
- ✅ Validações e regras de negócio

**Como se integra:**
- ✅ Usa Totem ID (placeholder por enquanto)
- ✅ Independente da segurança (Sprint 2)
- ✅ Preparado para Context API
- ✅ Estrutura modular e escalável

**O que falta:**
- 🔶 Substituir `TEMP_TOTEM_ID` por TotemContext
- 🔶 Criar telas de detalhes e convite
- 🔶 Integrar ClanContext nas telas
- 🔶 Chat dentro dos CLANNs (Sprint 4)



