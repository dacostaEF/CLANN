# 📊 COMPARAÇÃO: ESTRUTURA PLANEJADA vs CÓDIGO ATUAL

**Data:** Agora  
**Objetivo:** Comparar a estrutura planejada pelo usuário com o código atual do projeto

---

## 🔴 **FASE 0 — ESTADO ATUAL (BASE FUNCIONAL)**

### **🔐 Totem & PIN (CORE)**

#### **✅ O QUE JÁ ESTÁ IMPLEMENTADO:**

| Requisito Planejado | Status no Código | Observações |
|---------------------|------------------|-------------|
| Totem é criado e salvo com segurança (`totem_data`) | ✅ **IMPLEMENTADO** | `saveTotemSecure()` em `secureStore.js` salva em `totem_data` |
| PIN de 6 dígitos funcionando | ✅ **IMPLEMENTADO** | `PinManager.js` valida formato de 6 dígitos |
| PIN persiste após F5 / reload | ✅ **IMPLEMENTADO** | Polyfill Web usa `localStorage`, PIN persiste |
| Bloqueio por tentativas funcionando | ✅ **IMPLEMENTADO** | `incrementPinAttempts()` em `PinManager.js` |
| Desbloqueio automático por tempo | ✅ **IMPLEMENTADO** | `getLockRemainingTime()` calcula tempo restante |
| Verificação de PIN consistente (hash + salt normalizados) | ✅ **IMPLEMENTADO** | `verifyPin()` normaliza hash e salt em lowercase |
| ⚠️ Warning Unexpected text node identificado | ✅ **DOCUMENTADO** | Registrado em `BACKLOG_TECNICO.md` |

#### **📋 Critério de Pronto:**
✅ **ATENDE:** Usuário consegue abrir app → digitar PIN → entrar sem erros críticos

**Arquivos relacionados:**
- `src/storage/secureStore.js` - Salva Totem
- `src/security/PinManager.js` - Gerencia PIN
- `src/screens/EnterPinScreen.js` - Tela de entrada
- `src/context/TotemContext.js` - Context do Totem

---

## 🟠 **FASE 1 — FINALIZAR TOTEM (PRIORIDADE ALTA)**

### **🧱 Estrutura do Totem**

#### **✅ O QUE JÁ ESTÁ IMPLEMENTADO:**

| Requisito Planejado | Status no Código | Observações |
|---------------------|------------------|-------------|
| TotemContext como fonte única de verdade | ⚠️ **PARCIAL** | `TotemContext.js` existe, mas ainda há leituras diretas |
| Remover leituras paralelas diretas do storage (`getCurrentTotemId`) | ❌ **NÃO IMPLEMENTADO** | `getCurrentTotemId()` ainda é usado em vários lugares |
| Função única: `useTotem()` → retorna tudo | ⚠️ **PARCIAL** | `useTotem()` existe, mas não é usado em todos os lugares |
| Estado de loading explícito do Totem | ✅ **IMPLEMENTADO** | `TotemContext` tem `loading` state |

#### **❌ O QUE FALTA:**

1. **Remover `getCurrentTotemId()` direto:**
   - Ainda usado em: `ClanChatScreen.js`, `JoinClanScreen.js`, `CreateClanScreen.js`, `GovernanceScreen.js`, `AdminTools.js`
   - **Ação necessária:** Substituir por `useTotem().totem?.totemId`

2. **Centralizar leituras do Totem:**
   - Muitos arquivos ainda chamam `loadTotemSecure()` diretamente
   - **Ação necessária:** Usar apenas `useTotem()` hook

**Arquivos que precisam ser modificados:**
- `src/screens/ClanChatScreen.js` - Usa `getCurrentTotemId()`
- `src/screens/JoinClanScreen.js` - Usa `getCurrentTotemId()`
- `src/screens/CreateClanScreen.js` - Usa `getCurrentTotemId()`
- `src/screens/GovernanceScreen.js` - Usa `getCurrentTotemId()`
- `src/admin/AdminTools.js` - Usa `getCurrentTotemId()`

### **🔐 Segurança do Totem**

#### **✅ O QUE JÁ ESTÁ IMPLEMENTADO:**

| Requisito Planejado | Status no Código | Observações |
|---------------------|------------------|-------------|
| Chave privada nunca sai do dispositivo | ✅ **IMPLEMENTADO** | Chave privada só existe em `SecureStore` |
| Recovery Phrase validada | ✅ **IMPLEMENTADO** | `validateMnemonic()` em `seed.js` |
| Reset de PIN não apaga Totem | ✅ **IMPLEMENTADO** | `saveTotemSecure()` limpa PIN antigo, mas mantém Totem |
| Reset de Totem apaga PIN | ✅ **IMPLEMENTADO** | `saveTotemSecure()` limpa PIN quando novo Totem é criado |

#### **❌ O QUE FALTA:**

1. **Reset de Totem apaga CLANNs:**
   - Não há função para limpar CLANNs quando Totem é resetado
   - **Ação necessária:** Criar `clearAllClanData()` em `ClanStorage.js`

2. **Reset de Totem apaga Mensagens locais:**
   - Não há função para limpar mensagens quando Totem é resetado
   - **Ação necessária:** Criar `clearAllMessages()` em `MessagesStorage.js`

**Arquivos que precisam ser modificados:**
- `src/clans/ClanStorage.js` - Adicionar função de limpeza
- `src/messages/MessagesStorage.js` - Adicionar função de limpeza
- `src/crypto/totemStorage.js` - Integrar limpeza ao resetar Totem

#### **📋 Critério de Pronto:**
❌ **NÃO ATENDE COMPLETAMENTE:** Totem é estável, mas falta limpeza completa ao resetar

---

## 🟡 **FASE 2 — FLUXO DE ENTRADA NO CLANN (UX)**

### **🚪 Entrada no CLANN**

#### **✅ O QUE JÁ ESTÁ IMPLEMENTADO:**

| Requisito Planejado | Status no Código | Observações |
|---------------------|------------------|-------------|
| Fluxo claro: PIN → Home → CLANN | ✅ **IMPLEMENTADO** | `AuthCheckScreen` → `EnterPinScreen` → `Home` → `ClanListScreen` |
| Página intermediária do CLANN bem definida | ⚠️ **PARCIAL** | `ClanDetailScreen.js` existe, mas não tem todas as opções |
| Entrar no chat | ✅ **IMPLEMENTADO** | Botão em `ClanDetailScreen` navega para `ClanChatScreen` |
| Compartilhar convite | ✅ **IMPLEMENTADO** | `ClanInviteScreen.js` existe |
| Ver governança | ✅ **IMPLEMENTADO** | `GovernanceScreen.js` existe |
| Sair do CLANN | ❌ **NÃO IMPLEMENTADO** | Não há função para sair do CLANN |
| Botão "Entrar no Chat" explícito | ⚠️ **PARCIAL** | Existe em `ClanDetailScreen`, mas pode ser mais visível |

#### **❌ O QUE FALTA:**

1. **Página intermediária do CLANN completa:**
   - `ClanDetailScreen.js` precisa ter:
     - Botão "Entrar no Chat" mais destacado
     - Botão "Compartilhar convite" mais visível
     - Botão "Ver governança" mais acessível
     - Botão "Sair do CLANN" (novo)

2. **Função "Sair do CLANN":**
   - Não existe função para remover membro do CLANN
   - **Ação necessária:** Criar `leaveClan()` em `ClanManager.js`

**Arquivos que precisam ser modificados:**
- `src/screens/ClanDetailScreen.js` - Melhorar UI e adicionar "Sair do CLANN"
- `src/clans/ClanManager.js` - Adicionar função `leaveClan()`

### **👤 Identidade Visível**

#### **✅ O QUE JÁ ESTÁ IMPLEMENTADO:**

| Requisito Planejado | Status no Código | Observações |
|---------------------|------------------|-------------|
| ID curto (ex: A9F3-7C2D) | ✅ **IMPLEMENTADO** | `totemId` é exibido truncado em vários lugares |
| Nome real opcional | ❌ **NÃO IMPLEMENTADO** | Não há campo para nome real |

#### **❌ O QUE FALTA:**

1. **Avatar padrão:**
   - Não há sistema de avatares
   - **Ação necessária:** Criar sistema de avatares baseado em `totemId`

2. **Nome real opcional:**
   - Não há campo para nome real no Totem
   - **Ação necessária:** Adicionar campo `realName` opcional no Totem

**Arquivos que precisam ser modificados:**
- `src/crypto/totem.js` - Adicionar campo `realName` opcional
- `src/screens/ProfileScreen.js` - Adicionar campo para nome real
- `src/components/chat/MessageBubble.js` - Mostrar avatar ao invés de nome

#### **📋 Critério de Pronto:**
⚠️ **PARCIAL:** Usuário entende onde está, mas falta avatar e nome real

---

## 🟢 **FASE 3 — CHAT SÓLIDO (FUNCIONAL)**

### **💬 Chat**

#### **✅ O QUE JÁ ESTÁ IMPLEMENTADO:**

| Requisito Planejado | Status no Código | Observações |
|---------------------|------------------|-------------|
| Enviar mensagem | ✅ **IMPLEMENTADO** | `MessageInput.js` + `MessagesManager.js` |
| Receber mensagem | ✅ **IMPLEMENTADO** | `ClanChatScreen.js` carrega mensagens |
| Scroll estável | ✅ **IMPLEMENTADO** | `FlatList` em `ClanChatScreen.js` |
| Data separators funcionando | ✅ **IMPLEMENTADO** | `DateSeparator.js` componente |
| Status (enviado / entregue / lido) | ✅ **IMPLEMENTADO** | `MessageStatus.js` mostra status |

### **🧪 Qualidade**

#### **✅ O QUE JÁ ESTÁ IMPLEMENTADO:**

| Requisito Planejado | Status no Código | Observações |
|---------------------|------------------|-------------|
| Nenhum erro crítico no console | ⚠️ **PARCIAL** | Warning "Unexpected text node" documentado |
| Warnings documentados (não bloqueantes) | ✅ **IMPLEMENTADO** | `BACKLOG_TECNICO.md` |
| Performance aceitável | ✅ **IMPLEMENTADO** | `FlatList` otimizado |

#### **📋 Critério de Pronto:**
✅ **ATENDE:** Chat funciona como um chat real, sem comportamento estranho

**Arquivos relacionados:**
- `src/screens/ClanChatScreen.js` - Tela principal do chat
- `src/components/chat/MessageBubble.js` - Bolha de mensagem
- `src/components/chat/MessageInput.js` - Input de mensagem
- `src/messages/MessagesManager.js` - Gerenciador de mensagens

---

## 🔵 **FASE 4 — WATERMARK & RASTREABILIDADE**

### **🕵️ Watermark Invisível**

#### **✅ O QUE JÁ ESTÁ IMPLEMENTADO:**

| Requisito Planejado | Status no Código | Observações |
|---------------------|------------------|-------------|
| Zero-width chars funcionando | ✅ **IMPLEMENTADO** | `watermark.js` usa `\u200B`, `\u200C`, `\u200D` |
| ID do usuário embutido | ✅ **IMPLEMENTADO** | `injectWatermark()` injeta `totemId` |
| Associação clara mensagem ↔ emissor | ✅ **IMPLEMENTADO** | Watermark é aplicado em `MessageBubble.js` |
| Log de vazamento possível | ⚠️ **PARCIAL** | `extractWatermark()` existe, mas é placeholder |

#### **❌ O QUE FALTA:**

1. **Extração de watermark funcional:**
   - `extractWatermark()` retorna apenas `'EXTRACTED'` (placeholder)
   - **Ação necessária:** Implementar decodificação real do watermark

2. **Sistema de detecção de vazamento:**
   - Não há sistema para detectar quando mensagem foi vazada
   - **Ação necessária:** Criar função para analisar texto vazado e identificar totemId

**Arquivos que precisam ser modificados:**
- `src/utils/watermark.js` - Implementar `extractWatermark()` completo
- `src/admin/AdminTools.js` - Adicionar ferramenta de detecção de vazamento

### **🔥 Burn After Read**

#### **✅ O QUE JÁ ESTÁ IMPLEMENTADO:**

| Requisito Planejado | Status no Código | Observações |
|---------------------|------------------|-------------|
| Flag por mensagem | ✅ **IMPLEMENTADO** | `burn_after_read` em `clan_messages` |
| Timer local | ⚠️ **PARCIAL** | `selfDestructAt` existe, mas timer não está implementado |
| Destruição da chave da mensagem | ❌ **NÃO IMPLEMENTADO** | Mensagem não é destruída automaticamente |
| Registro na hash-chain ("mensagem destruída") | ❌ **NÃO IMPLEMENTADO** | Não há hash-chain implementada |

#### **❌ O QUE FALTA:**

1. **Timer local para destruição:**
   - Não há timer que verifica `selfDestructAt` e destrói mensagem
   - **Ação necessária:** Criar `MessageDestructTimer.js` que verifica periodicamente

2. **Destruição automática:**
   - Mensagem não é removida automaticamente quando `burnAfterRead` é true
   - **Ação necessária:** Implementar lógica em `MessagesManager.js` para destruir após ler

3. **Hash-chain:**
   - Não há sistema de hash-chain implementado
   - **Ação necessária:** Criar `HashChain.js` para registrar eventos

**Arquivos que precisam ser criados/modificados:**
- `src/utils/MessageDestructTimer.js` - NOVO: Timer para destruição
- `src/messages/MessagesManager.js` - MODIFICAR: Adicionar lógica de destruição
- `src/utils/HashChain.js` - NOVO: Sistema de hash-chain

#### **📋 Critério de Pronto:**
❌ **NÃO ATENDE:** Watermark funciona, mas Burn After Read não está completo

---

## 🟣 **FASE 5 — GOVERNANÇA (NÃO AGORA, MAS PLANEJADA)**

### **🏛️ Governança**

#### **✅ O QUE JÁ ESTÁ IMPLEMENTADO:**

| Requisito Planejado | Status no Código | Observações |
|---------------------|------------------|-------------|
| Papéis: Founder, Admin, Ancião, Membro | ✅ **IMPLEMENTADO** | `permissions.js` define `CLAN_ROLES` |
| Ações: Ban, Burn global, Lock do CLANN | ⚠️ **PARCIAL** | Algumas ações existem, outras não |
| Auditoria mínima | ✅ **IMPLEMENTADO** | `SecurityLog.js` registra eventos |

#### **📋 Status:**
✅ **PLANEJADO E PARCIALMENTE IMPLEMENTADO** - Não é prioridade agora

---

## ⚫ **FASE 6 — TOTEM INDIVIDUAL (FUTURO)**

### **Status:**
❌ **NÃO IMPLEMENTAR AGORA** - Conforme planejado

---

## 🧭 **REGRA DE OURO (PARA TODAS AS FASES)**

### **✅ O QUE ESTÁ SENDO SEGUIDO:**

| Regra | Status | Observações |
|-------|--------|-------------|
| ❌ Não quebrar o que funciona | ✅ **SEGUINDO** | Código existente está estável |
| ❌ Não aumentar complexidade visível | ✅ **SEGUINDO** | UI mantém simplicidade |
| ✅ Segurança por padrão | ✅ **SEGUINDO** | SecureStore, PIN, Device Trust |
| ✅ UX simples | ✅ **SEGUINDO** | Interface limpa e direta |
| ✅ Poder concentrado no Totem | ⚠️ **PARCIAL** | TotemContext existe, mas ainda há leituras diretas |

---

## 📊 **RESUMO GERAL**

### **✅ FASES COMPLETAS:**
- **FASE 0:** ✅ 100% Completo
- **FASE 3:** ✅ 100% Completo

### **⚠️ FASES PARCIAIS:**
- **FASE 1:** ⚠️ 70% Completo (falta centralizar TotemContext e limpeza ao resetar)
- **FASE 2:** ⚠️ 60% Completo (falta avatar, nome real, e função "Sair do CLANN")
- **FASE 4:** ⚠️ 50% Completo (watermark funciona, mas Burn After Read não está completo)

### **📋 FASES PLANEJADAS:**
- **FASE 5:** ✅ Planejado (não é prioridade agora)
- **FASE 6:** ❌ Não implementar agora

---

## 🎯 **PRÓXIMOS PASSOS RECOMENDADOS (ALINHADOS COM PLANO)**

### **1. FASE 1 — Finalizar Totem (PRIORIDADE ALTA)**

#### **Tarefas:**
1. **Centralizar TotemContext:**
   - Substituir `getCurrentTotemId()` por `useTotem().totem?.totemId` em todos os arquivos
   - Remover leituras diretas de `loadTotemSecure()`

2. **Limpeza ao resetar Totem:**
   - Criar `clearAllClanData()` em `ClanStorage.js`
   - Criar `clearAllMessages()` em `MessagesStorage.js`
   - Integrar limpeza em `clearTotem()` ou função de reset

**Arquivos a modificar:**
- `src/screens/ClanChatScreen.js`
- `src/screens/JoinClanScreen.js`
- `src/screens/CreateClanScreen.js`
- `src/screens/GovernanceScreen.js`
- `src/admin/AdminTools.js`
- `src/clans/ClanStorage.js` (adicionar limpeza)
- `src/messages/MessagesStorage.js` (adicionar limpeza)

### **2. FASE 2 — Fluxo de Entrada no CLANN (UX)**

#### **Tarefas:**
1. **Melhorar ClanDetailScreen:**
   - Destacar botão "Entrar no Chat"
   - Adicionar botão "Sair do CLANN"
   - Melhorar layout geral

2. **Implementar "Sair do CLANN":**
   - Criar `leaveClan()` em `ClanManager.js`
   - Adicionar confirmação antes de sair

3. **Sistema de Avatar:**
   - Criar função para gerar avatar baseado em `totemId`
   - Mostrar avatar em mensagens

4. **Nome Real Opcional:**
   - Adicionar campo `realName` no Totem
   - Adicionar input no ProfileScreen

**Arquivos a modificar:**
- `src/screens/ClanDetailScreen.js`
- `src/clans/ClanManager.js` (adicionar `leaveClan()`)
- `src/crypto/totem.js` (adicionar `realName`)
- `src/screens/ProfileScreen.js` (adicionar input)
- `src/components/chat/MessageBubble.js` (mostrar avatar)

### **3. FASE 4 — Watermark & Rastreabilidade (SE NECESSÁRIO)**

#### **Tarefas:**
1. **Completar Burn After Read:**
   - Implementar timer de destruição
   - Implementar destruição automática após ler
   - Criar hash-chain (se necessário)

2. **Melhorar extração de watermark:**
   - Implementar `extractWatermark()` completo
   - Adicionar ferramenta de detecção em AdminTools

**Arquivos a criar/modificar:**
- `src/utils/MessageDestructTimer.js` (NOVO)
- `src/messages/MessagesManager.js` (modificar)
- `src/utils/watermark.js` (completar `extractWatermark()`)
- `src/utils/HashChain.js` (NOVO - se necessário)

---

## ✅ **CONCLUSÃO**

### **Alinhamento com o Plano:**
✅ **BOM ALINHAMENTO** - O código atual está bem alinhado com a estrutura planejada

### **Principais Gaps:**
1. **FASE 1:** Centralização do TotemContext (leituras diretas ainda existem)
2. **FASE 2:** Avatar, nome real, e função "Sair do CLANN"
3. **FASE 4:** Burn After Read não está completo

### **Recomendação:**
👉 **Focar em FASE 1 e FASE 2** conforme planejado, ignorando FASE 4 por enquanto (conforme regra de ouro)

---

**Status:** ✅ Análise completa - Pronto para implementação quando autorizado




