# 🛡️ MANIFESTO TÉCNICO DO CLANN
## Constituição Técnica do Sistema de Soberania Digital

**Versão:** 1.0  
**Data:** 2025  
**Status:** Fundacional — Imutável

---

## 📜 PREÂMBULO

O CLANN não é um chat. O CLANN é um sistema de **soberania digital** onde a conversa é consequência, não objetivo.

Este manifesto estabelece os **princípios técnicos fundamentais** que regem o desenvolvimento do CLANN. Qualquer implementação que viole estes princípios **não é CLANN**.

---

## 🎯 PRINCÍPIO FUNDAMENTAL

> **"No CLANN, o servidor não confia em ninguém — e ninguém confia no servidor."**

Esta frase resolve 90% das decisões técnicas.

---

## 🔐 ARTIGO I: SOBERANIA DO TOTEM

### Seção 1.1: Totem como Autoridade Única

- ✅ **O Totem é a única autoridade de identidade no CLANN.**
- ✅ **O Totem existe e opera exclusivamente no dispositivo local.**
- ✅ **O Totem não depende de servidor para existir ou funcionar.**
- ❌ **Servidor nunca valida, autentica ou autoriza Totem.**
- ❌ **Servidor nunca conhece chave privada do Totem.**
- ❌ **Servidor nunca é fonte de verdade sobre identidade.**

### Seção 1.2: Validação Local

- ✅ **Toda validação de identidade ocorre localmente.**
- ✅ **PIN é validado exclusivamente no dispositivo.**
- ✅ **Chaves criptográficas nunca saem do dispositivo.**
- ❌ **Servidor nunca recebe PIN, hash de PIN ou tentativas.**
- ❌ **Servidor nunca bloqueia ou desbloqueia acesso.**

### Seção 1.3: Persistência Local

- ✅ **Totem persiste localmente (SecureStore/expo-secure-store).**
- ✅ **PIN persiste localmente.**
- ✅ **Dados críticos nunca dependem de servidor.**
- ❌ **Servidor nunca armazena identidade do usuário.**
- ❌ **Servidor nunca cria ou gerencia sessão de identidade.**

---

## 📦 ARTIGO II: GATEWAY COMO TRANSPORTE CEGO

### Seção 2.1: Função do Gateway

- ✅ **Gateway é apenas transporte de mensagens.**
- ✅ **Gateway roteia mensagens por `clannId`.**
- ✅ **Gateway pode cair, reiniciar ou limpar cache sem afetar identidade.**
- ❌ **Gateway não autentica usuários.**
- ❌ **Gateway não valida assinaturas.**
- ❌ **Gateway não é árbitro de disputas.**
- ❌ **Gateway não conhece regras de governança.**

### Seção 2.2: Roteamento

- ✅ **Gateway lê campos públicos do envelope:**
  - `clannId` (para roteamento)
  - `fromTotemId` (público, não verificado)
  - `payload` (opaco)
  - `signature` (não validada pelo Gateway)
- ✅ **Gateway encaminha mensagens para Totens conectados ao `clannId`.**
- ❌ **Gateway não verifica se `totemId` é verdadeiro.**
- ❌ **Gateway não valida assinatura.**
- ❌ **Gateway não rejeita mensagens por conteúdo ou origem.**

### Seção 2.3: Membros do CLANN

- ✅ **Gateway pode saber:**
  - `clannId`
  - Lista de `totemId` ativos/conectados (apenas para roteamento)
- ❌ **Gateway não sabe:**
  - Quem é dono/admin
  - Quem tem poder
  - Regras internas
  - Hierarquia de membros

---

## ✍️ ARTIGO III: ASSINATURA E VALIDAÇÃO

### Seção 3.1: Assinatura de Mensagens

- ✅ **Toda mensagem é assinada localmente pelo Totem.**
- ✅ **Assinatura usa chave privada do Totem.**
- ✅ **Assinatura é incluída no envelope da mensagem.**
- ❌ **Gateway não valida assinatura.**
- ❌ **Gateway não rejeita mensagens por assinatura inválida.**

### Seção 3.2: Validação pelo Receptor

- ✅ **Totens receptores validam assinatura localmente.**
- ✅ **Totens receptores verificam `fromTotemId` contra lista local de membros.**
- ✅ **Mensagens com assinatura inválida são descartadas localmente.**
- ✅ **Mensagens de Totens não autorizados são descartadas localmente.**
- ❌ **Gateway nunca toma decisão sobre validade de mensagem.**

---

## 🎫 ARTIGO IV: CONVITES E AUTORIZAÇÃO

### Seção 4.1: Natureza do Convite

- ✅ **Convite autoriza entrada no CLANN, não autentica identidade.**
- ✅ **Código de convite é associado a `clannId`.**
- ✅ **Código de convite pode ter validade/limite.**
- ❌ **Gateway não valida Totem do convidado.**
- ❌ **Gateway não cria identidade.**
- ❌ **Gateway não autentica convidado.**

### Seção 4.2: Fluxo de Convite

1. **Criador gera código curto associado a `clannId`.**
2. **Convidado cria seu próprio Totem (localmente).**
3. **Convidado insere código.**
4. **Gateway verifica se código existe e está válido.**
5. **Gateway responde com `clannId`.**
6. **Totem do convidado passa a escutar o CLANN.**
7. **Governança local decide o resto.**

---

## 💾 ARTIGO V: PERSISTÊNCIA E NÍVEIS

### Seção 5.1: CLANN Livre (Free)

- ✅ **Roteamento em tempo real apenas.**
- ✅ **Se receptor estiver offline → mensagem perdida.**
- ✅ **Zero persistência no Gateway.**
- ✅ **Zero histórico central.**
- ✅ **Soberania total.**

### Seção 5.2: CLANN Premium

- ✅ **Gateway pode guardar mensagens criptografadas.**
- ✅ **Persistência por tempo limitado.**
- ✅ **Payload é opaco (Gateway não tem chave).**
- ✅ **Gateway apenas entrega "pacote", não lê conteúdo.**
- ✅ **Monetização sem quebrar soberania.**

### Seção 5.3: CLANN Institucional (Futuro)

- ⚠️ **A definir mantendo soberania.**

---

## 🏛️ ARTIGO VI: GOVERNANÇA

### Seção 6.1: Governança Local

- ✅ **Governança é aplicada localmente pelo cliente.**
- ✅ **Regras são criptográficas e verificáveis.**
- ✅ **Conselho de Anciões opera localmente.**
- ✅ **Aprovações são validadas localmente.**
- ❌ **Gateway não conhece regras de governança.**
- ❌ **Gateway não aplica regras.**
- ❌ **Gateway não arbitra disputas.**

### Seção 6.2: Enforcement Local

- ✅ **Bloqueio de ações proibidas ocorre localmente.**
- ✅ **Validação de permissões ocorre localmente.**
- ✅ **Watermark e rastreamento são aplicados localmente.**
- ❌ **Gateway não bloqueia ou permite ações.**

---

## 🚫 ARTIGO VII: PROIBIÇÕES ABSOLUTAS

### Seção 7.1: Autenticação no Servidor

- ❌ **Servidor nunca autentica usuário.**
- ❌ **Servidor nunca valida PIN.**
- ❌ **Servidor nunca cria sessão de identidade.**
- ❌ **Servidor nunca emite tokens de autenticação.**
- ❌ **Servidor nunca é fonte de verdade sobre identidade.**

### Seção 7.2: Validação no Servidor

- ❌ **Servidor nunca valida assinatura de mensagem.**
- ❌ **Servidor nunca valida Totem.**
- ❌ **Servidor nunca valida permissões.**
- ❌ **Servidor nunca rejeita mensagem por conteúdo ou origem.**

### Seção 7.3: Armazenamento de Identidade

- ❌ **Servidor nunca armazena identidade do usuário.**
- ❌ **Servidor nunca armazena PIN ou hash de PIN.**
- ❌ **Servidor nunca armazena tentativas de PIN.**
- ❌ **Servidor nunca armazena chaves privadas.**

---

## ✅ ARTIGO VIII: ARQUITETURA MÍNIMA DO GATEWAY

### Seção 8.1: Endpoints REST

1. **POST /messages** — Recebe mensagem assinada, roteia por `clannId`
2. **GET /messages/:clannId** — Busca mensagens (apenas Premium)
3. **POST /invites/validate** — Valida código de convite, retorna `clannId`

### Seção 8.2: WebSocket

- **Evento: `message`** — Recebe mensagem, encaminha para Totens do `clannId`
- **Evento: `typing`** — Encaminha indicador de digitação (opcional)
- **Evento: `online`** — Encaminha status online/offline (opcional)

### Seção 8.3: Regras do Gateway

- ✅ **Zero autenticação.**
- ✅ **Zero sessão.**
- ✅ **Zero validação de identidade.**
- ✅ **Apenas roteamento cego.**

---

## 🎯 ARTIGO IX: TESTE DE CONFORMIDADE

Qualquer implementação deve responder "SIM" a todas estas perguntas:

1. ✅ O Totem funciona completamente offline?
2. ✅ O servidor pode cair sem afetar identidade?
3. ✅ O servidor nunca conhece PIN?
4. ✅ O servidor nunca valida assinatura?
5. ✅ O servidor nunca autentica usuário?
6. ✅ A governança funciona localmente?
7. ✅ Mensagens são validadas pelo receptor?

Se qualquer resposta for "NÃO", a implementação **não é CLANN**.

---

## 📋 ARTIGO X: EVOLUÇÃO E MANUTENÇÃO

### Seção 10.1: Alterações

- ⚠️ **Este manifesto pode ser expandido, nunca reduzido.**
- ⚠️ **Novos artigos podem ser adicionados.**
- ❌ **Artigos existentes não podem ser removidos.**
- ❌ **Princípios fundamentais não podem ser alterados.**

### Seção 10.2: Interpretação

- ✅ **Em caso de dúvida, aplicar o Princípio Fundamental.**
- ✅ **Quando houver conflito, soberania do Totem prevalece.**
- ✅ **Servidor sempre é suspeito até prova contrária.**

---

## 🏁 CONCLUSÃO

O CLANN nasceu diferente. Este manifesto protege essa diferença.

**Qualquer implementação que viole estes princípios não é CLANN.**

---

**Frase-âncora para todas as decisões técnicas:**

> *"No CLANN, o servidor não confia em ninguém — e ninguém confia no servidor."*

---

**Fim do Manifesto Técnico do CLANN**


