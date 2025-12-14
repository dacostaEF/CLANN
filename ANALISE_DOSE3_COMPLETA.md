# 🔍 ANÁLISE COMPLETA DA DOSE 3

**Data:** Agora  
**Objetivo:** Analisar consistência, riscos e problemas potenciais da Dose 3

---

## 📋 **RESUMO EXECUTIVO**

### **✅ PONTOS POSITIVOS:**
1. ✅ **Funções auxiliares já existem** - Não precisa reimplementar criptografia
2. ✅ **Estrutura isolada** - Não mexe em Chat, CLANN, Governança
3. ✅ **Alinhado com FASE 1** - Finaliza Totem como protocolo de identidade
4. ✅ **Regras claras** - Não altera rotas globais, AuthCheck, PIN

### **⚠️ PONTOS DE ATENÇÃO:**
1. ⚠️ **ImportIdentityScreen** navega para `Home`, mas Dose 3 pede `CreatePin`
2. ⚠️ **TotemContext** precisa ser atualizado após renomear Totem
3. ⚠️ **QR Code para import** não está implementado (só arquivo)
4. ⚠️ **Verificação de integridade** precisa ser criada do zero
5. ⚠️ **Tela "Sobre seu Totem"** precisa ser criada do zero

---

## 🎯 **ANÁLISE POR ITEM DA DOSE 3**

### **1️⃣ RENOMEAR TOTEM**

#### **Status Atual:**
- ✅ `symbolicName` existe no Totem
- ✅ `ProfileScreen.js` já tem campo visual (linha 27: `customName`)
- ✅ `handleSaveName()` existe, mas só mostra `Alert.alert('Em desenvolvimento')`
- ✅ `TotemContext` tem `setTotem()` para atualizar estado

#### **O Que Precisa Ser Feito:**
1. Implementar lógica em `handleSaveName()`:
   - Validar nome (não vazio, tamanho máximo)
   - Carregar Totem atual do `secureStore`
   - Atualizar apenas `symbolicName`
   - Salvar com `saveTotemSecure()`
   - Atualizar `TotemContext` com `setTotem()`

#### **Riscos:**
- 🟢 **BAIXO:** Apenas atualiza `symbolicName`, não mexe em chaves
- 🟢 **BAIXO:** `TotemContext.setTotem()` já existe
- ⚠️ **MÉDIO:** Precisa garantir que `totemId` não seja alterado

#### **Validações Necessárias:**
```javascript
// Validar antes de salvar
if (!newName || newName.trim().length === 0) {
  Alert.alert('Erro', 'Nome não pode estar vazio');
  return;
}
if (newName.length > 50) {
  Alert.alert('Erro', 'Nome muito longo (máximo 50 caracteres)');
  return;
}
```

#### **Fluxo Correto:**
```javascript
const handleSaveName = async () => {
  // 1. Validar nome
  // 2. Carregar Totem atual
  const currentTotem = await loadTotemSecure();
  // 3. Atualizar apenas symbolicName
  const updatedTotem = { ...currentTotem, symbolicName: newName };
  // 4. Salvar
  await saveTotemSecure(updatedTotem);
  // 5. Atualizar TotemContext
  setTotem(updatedTotem);
  // 6. Feedback visual
  Alert.alert('Sucesso', 'Nome do Totem atualizado');
};
```

---

### **2️⃣ EXPORTAR IDENTIDADE (ARQUIVO + QR)**

#### **Status Atual:**
- ✅ `exportTotem()` existe em `ExportTotem.js`
- ✅ `generateQRBackupData()` existe em `QRBackup.js`
- ✅ `TotemExportScreen.js` existe, mas é placeholder
- ✅ `ExportIdentityScreen.js` existe (verificar se está conectado)

#### **O Que Precisa Ser Feito:**
1. Conectar `TotemExportScreen.js` às funções existentes:
   - Botão "Exportar como arquivo" → `exportTotem()` + `shareBackupFile()`
   - Botão "Exportar como QR Code" → `generateQRBackupData()` + exibir QR
2. Criar componente de visualização de QR Code (ou usar biblioteca)
3. Adicionar feedback visual (loading, sucesso, erro)

#### **Riscos:**
- 🟢 **BAIXO:** Funções já existem e são testadas
- ⚠️ **MÉDIO:** QR Code pode ser grande (precisa dividir em chunks)
- 🟢 **BAIXO:** Não mexe em dados, apenas lê

#### **Dependências:**
- Biblioteca de QR Code (ex: `react-native-qrcode-svg` ou `expo-barcode-scanner`)
- Verificar se já está instalada

#### **Validações Necessárias:**
```javascript
// Verificar se Totem existe
const totem = await loadTotemSecure();
if (!totem) {
  Alert.alert('Erro', 'Nenhum Totem encontrado');
  return;
}

// Verificar se PIN está configurado (para AES key)
const aesKey = await getAESKey();
if (!aesKey) {
  Alert.alert('Erro', 'Configure um PIN primeiro');
  return;
}
```

---

### **3️⃣ IMPORTAR / RESTAURAR IDENTIDADE (QR OU ARQUIVO)**

#### **Status Atual:**
- ✅ `importTotem()` existe em `ImportTotem.js`
- ✅ `ImportIdentityScreen.js` existe e funciona
- ❌ **PROBLEMA:** Navega para `Home` após importar (linha 76-79)
- ❌ **FALTA:** Import via QR Code não está implementado

#### **O Que Precisa Ser Feito:**
1. **Corrigir navegação em `ImportIdentityScreen.js`:**
   - Trocar `navigation.reset({ routes: [{ name: 'Home' }] })` por `navigation.replace('CreatePin')`
   - **IMPORTANTE:** Dose 3 pede explicitamente para navegar para `CreatePin`, não `Home`

2. **Adicionar opção de importar via QR Code:**
   - Criar tela ou modal para escanear QR Code
   - Usar `reconstructFromChunks()` se for QR Code múltiplo
   - Validar checksum
   - Descriptografar com PIN
   - Salvar Totem

3. **Atualizar TotemContext após importar:**
   - Chamar `setTotem(importedTotem)` após salvar
   - Chamar `loadTotem()` para garantir sincronização

#### **Riscos:**
- 🟡 **MÉDIO:** Mudança de navegação pode afetar fluxo existente
- 🟡 **MÉDIO:** QR Code precisa de biblioteca de scanner
- 🟢 **BAIXO:** Funções de import já existem e são testadas

#### **Validações Necessárias:**
```javascript
// Verificar formato do backup
if (!backupData.encrypted || !backupData.checksum) {
  throw new Error('Formato de backup inválido');
}

// Validar checksum
if (!validateChecksum(backupData.encrypted, backupData.checksum)) {
  throw new Error('Arquivo corrompido');
}

// Validar integridade do Totem
if (!validateTotem(importedTotem)) {
  throw new Error('Totem inválido');
}
```

#### **Fluxo Correto Após Importar:**
```javascript
// 1. Importar Totem
const totem = await importTotem(fileUri, pin);

// 2. Salvar Totem
await saveTotemSecure(totem);

// 3. Atualizar TotemContext
setTotem(totem);
// OU chamar loadTotem() para garantir sincronização

// 4. Navegar para CreatePin (NÃO Home)
navigation.replace('CreatePin');
```

---

### **4️⃣ VERIFICAÇÃO DE INTEGRIDADE DO TOTEM**

#### **Status Atual:**
- ✅ `validateTotem()` existe em `totem.js`
- ✅ `TotemAuditScreen.js` existe, mas é placeholder
- ❌ **FALTA:** Tela de verificação de integridade

#### **O Que Precisa Ser Feito:**
1. Implementar `TotemAuditScreen.js`:
   - Carregar Totem do `secureStore`
   - Verificar:
     - ✅ Totem válido (`validateTotem()`)
     - ✅ Chaves presentes (`privateKey`, `publicKey`)
     - ✅ Assinatura íntegra (derivar `publicKey` de `privateKey`)
     - ✅ Storage consistente (`loadTotemSecure()` retorna dados válidos)
   - Exibir status visual (✅ ou ❌)
   - Não é auditoria técnica profunda, apenas checkup visual

#### **Riscos:**
- 🟢 **BAIXO:** Apenas leitura, não modifica nada
- 🟢 **BAIXO:** Funções de validação já existem
- 🟢 **BAIXO:** Não afeta fluxo existente

#### **Validações Necessárias:**
```javascript
// Verificar Totem existe
const totem = await loadTotemSecure();
if (!totem) {
  return { valid: false, reason: 'Totem não encontrado' };
}

// Verificar chaves presentes
if (!totem.privateKey || !totem.publicKey) {
  return { valid: false, reason: 'Chaves ausentes' };
}

// Verificar integridade criptográfica
if (!validateTotem(totem)) {
  return { valid: false, reason: 'Assinatura inválida' };
}

// Verificar storage consistente
const reloaded = await loadTotemSecure();
if (!reloaded || reloaded.totemId !== totem.totemId) {
  return { valid: false, reason: 'Storage inconsistente' };
}
```

---

### **5️⃣ TELA "SOBRE SEU TOTEM" (EDUCATIVA)**

#### **Status Atual:**
- ❌ **FALTA:** Tela não existe
- ✅ Pode ser criada como nova tela dentro do fluxo do Totem

#### **O Que Precisa Ser Feito:**
1. Criar nova tela `TotemAboutScreen.js`:
   - Conteúdo estático (não puxa dados)
   - Explicar:
     - O que é o Totem
     - Por que ele protege você
     - Diferença entre Totem e conta comum
   - Frase-chave: "Você não tem uma conta. Você tem soberania."
   - Botão de retorno (`navigation.goBack()`)

2. Adicionar rota em `App.js`:
   - `<Stack.Screen name="TotemAbout" component={TotemAboutScreen} />`
   - **IMPORTANTE:** Não alterar rotas existentes, apenas adicionar

3. Conectar botão em `ProfileScreen.js`:
   - Adicionar botão "Sobre seu Totem"
   - Navegar para `TotemAbout`

#### **Riscos:**
- 🟢 **BAIXO:** Tela estática, não mexe em lógica
- 🟢 **BAIXO:** Não afeta fluxo existente
- 🟢 **BAIXO:** Apenas adiciona rota, não modifica existentes

---

## 🚨 **PROBLEMAS POTENCIAIS IDENTIFICADOS**

### **1. ImportIdentityScreen Navega para Home (NÃO CreatePin)**

**Problema:**
- `ImportIdentityScreen.js` linha 76-79 navega para `Home` após importar
- Dose 3 pede explicitamente para navegar para `CreatePin`

**Solução:**
```javascript
// ANTES (errado)
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});

// DEPOIS (correto)
navigation.replace('CreatePin');
```

**Risco:** 🟡 **MÉDIO** - Pode afetar fluxo existente, mas é necessário conforme Dose 3

---

### **2. TotemContext Não Atualiza Após Renomear**

**Problema:**
- Se renomear Totem e não atualizar `TotemContext`, telas podem mostrar nome antigo
- Precisa chamar `setTotem()` após salvar

**Solução:**
```javascript
// Após salvar Totem renomeado
await saveTotemSecure(updatedTotem);
setTotem(updatedTotem); // Atualizar TotemContext
```

**Risco:** 🟢 **BAIXO** - Fácil de corrigir

---

### **3. QR Code para Import Não Está Implementado**

**Problema:**
- `ImportIdentityScreen.js` só importa via arquivo
- Dose 3 pede opção de escanear QR Code

**Solução:**
- Adicionar botão "Escanear QR Code" em `ImportIdentityScreen.js`
- Criar tela/modal para scanner
- Usar `reconstructFromChunks()` se for QR Code múltiplo
- Validar e importar

**Risco:** 🟡 **MÉDIO** - Requer biblioteca de scanner e lógica adicional

---

### **4. TotemContext Não Atualiza Após Importar**

**Problema:**
- `ImportIdentityScreen.js` não atualiza `TotemContext` após importar
- Telas podem mostrar Totem antigo até reload

**Solução:**
```javascript
// Após importar Totem
await saveTotemSecure(totem);
setTotem(totem); // Atualizar TotemContext
// OU chamar loadTotem() para garantir sincronização
```

**Risco:** 🟢 **BAIXO** - Fácil de corrigir

---

## 📊 **ANÁLISE DE RISCOS GERAIS**

### **✅ RISCOS BAIXOS:**
1. ✅ Renomear Totem (apenas atualiza `symbolicName`)
2. ✅ Exportar Identidade (apenas lê dados)
3. ✅ Verificação de Integridade (apenas leitura)
4. ✅ Tela "Sobre seu Totem" (estática)

### **⚠️ RISCOS MÉDIOS:**
1. ⚠️ Importar Identidade (muda navegação, precisa atualizar TotemContext)
2. ⚠️ QR Code para import (requer biblioteca e lógica adicional)

### **🔴 RISCOS ALTOS:**
- Nenhum identificado

---

## 🎯 **CHECKLIST DE IMPLEMENTAÇÃO**

### **✅ Pré-requisitos:**
- [ ] Verificar se biblioteca de QR Code está instalada
- [ ] Verificar se biblioteca de scanner está instalada
- [ ] Confirmar que `TotemContext` está disponível em todas as telas

### **✅ Implementação:**
- [ ] 1. Renomear Totem
  - [ ] Implementar `handleSaveName()` em `ProfileScreen.js`
  - [ ] Validar nome antes de salvar
  - [ ] Atualizar `TotemContext` após salvar
  - [ ] Testar persistência após F5

- [ ] 2. Exportar Identidade
  - [ ] Conectar `TotemExportScreen.js` a `exportTotem()`
  - [ ] Conectar `TotemExportScreen.js` a `generateQRBackupData()`
  - [ ] Criar componente de visualização de QR Code
  - [ ] Adicionar feedback visual (loading, sucesso, erro)

- [ ] 3. Importar Identidade
  - [ ] Corrigir navegação em `ImportIdentityScreen.js` (Home → CreatePin)
  - [ ] Adicionar opção de importar via QR Code
  - [ ] Atualizar `TotemContext` após importar
  - [ ] Testar fluxo completo

- [ ] 4. Verificação de Integridade
  - [ ] Implementar `TotemAuditScreen.js`
  - [ ] Verificar Totem válido
  - [ ] Verificar chaves presentes
  - [ ] Verificar assinatura íntegra
  - [ ] Verificar storage consistente

- [ ] 5. Tela "Sobre seu Totem"
  - [ ] Criar `TotemAboutScreen.js`
  - [ ] Adicionar rota em `App.js`
  - [ ] Conectar botão em `ProfileScreen.js`

### **✅ Validação:**
- [ ] Totem mantém o mesmo `totemId` após renomear
- [ ] Nome do Totem persiste após F5
- [ ] Export gera arquivo e QR
- [ ] Import restaura Totem corretamente
- [ ] PIN é solicitado após restauração
- [ ] Nenhum fluxo do Chat foi alterado

---

## 🧠 **RECOMENDAÇÕES FINAIS**

### **✅ IMPLEMENTAÇÃO SEGURA:**
1. ✅ Seguir ordem obrigatória (1 → 2 → 3 → 4 → 5)
2. ✅ Confirmar renderização antes de seguir
3. ✅ Testar cada item isoladamente
4. ✅ Não antecipar etapas futuras

### **⚠️ PONTOS DE ATENÇÃO:**
1. ⚠️ **ImportIdentityScreen:** Corrigir navegação para `CreatePin`
2. ⚠️ **TotemContext:** Sempre atualizar após modificar Totem
3. ⚠️ **QR Code:** Verificar se biblioteca está instalada antes de implementar

### **🎯 CONCLUSÃO:**
- ✅ **Dose 3 é SEGURA** - Não mexe em Chat, CLANN, Governança
- ✅ **Funções auxiliares existem** - Não precisa reimplementar
- ⚠️ **Alguns ajustes necessários** - Mas são simples e isolados
- ✅ **Risco geral: BAIXO** - Implementação pode ser feita com segurança

---

**Status:** ✅ Análise completa - Pronto para implementação quando autorizado




