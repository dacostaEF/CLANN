# CLÃ - Sprint 1

Sistema de identidade criptográfica e onboarding para o aplicativo CLÃ.

## 📋 Sprint 1 - TOTEM + ONBOARDING

Esta sprint implementa:
- ✅ Sistema de identidade criptográfica (TOTEM)
- ✅ Fluxo completo de onboarding
- ✅ Armazenamento seguro local
- ✅ Testes unitários básicos

## 🚀 Instalação

```bash
npm install
```

## 🏃 Executar

```bash
npm start
```

## 📁 Estrutura do Projeto

```
├── src/
│   ├── crypto/
│   │   ├── totem.js          # Módulo principal do TOTEM
│   │   ├── seed.js           # Gerenciamento de seed e mnemônica
│   │   └── __tests__/
│   │       └── totem.test.js  # Testes do TOTEM
│   ├── storage/
│   │   ├── secureStore.js     # Armazenamento seguro
│   │   └── __tests__/
│   │       └── secureStore.test.js
│   └── screens/
│       ├── onboarding/
│       │   ├── WelcomeScreen.js
│       │   ├── TotemGenerationScreen.js
│       │   ├── RecoveryPhraseScreen.js
│       │   └── ChooseStartScreen.js
│       └── HomeScreen.js
└── App.js                     # App principal
```

## 🔒 TOTEM

O TOTEM é o sistema de identidade criptográfica do CLÃ:

- **Chave privada**: 32 bytes, gerada aleatoriamente
- **Chave pública**: Derivada via secp256k1
- **ID do Totem**: Hash SHA256 da chave pública (16 caracteres)
- **Nome simbólico**: Nome aleatório (ex: "Corvo de Ferro #7F3A")
- **Frase de recuperação**: 12 palavras BIP39

### Funções Principais

- `generateTotem()` - Gera um novo Totem
- `restoreTotem(phrase)` - Restaura Totem a partir da frase
- `signMessage(message, privateKey)` - Assina uma mensagem
- `verifySignature(message, signature, publicKey)` - Verifica assinatura

## 🧪 Testes

```bash
npm test
```

## ⚠️ Escopo da Sprint 1

**Implementado:**
- ✅ TOTEM completo
- ✅ Onboarding completo (4 telas)
- ✅ Armazenamento seguro
- ✅ Testes básicos

**NÃO implementado nesta sprint:**
- ❌ Chat
- ❌ Criptografia de mensagens
- ❌ Sistema de votação
- ❌ Backend
- ❌ Notificações
- ❌ Qualquer função de rede

## 📝 Notas

- Todos os dados do Totem são armazenados localmente via `expo-secure-store`
- Nenhum dado do Totem sai do dispositivo
- A frase de recuperação é determinística e permite restaurar o Totem

