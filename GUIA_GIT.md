# 🔧 Guia: Configurar Repositório Git para CLÃ

## ⚠️ PROBLEMA IDENTIFICADO

O Git está detectando um repositório no diretório **home** (`C:\Users\Dell\.git`) em vez de criar um repositório isolado no diretório do projeto.

## ✅ SOLUÇÃO

Execute os comandos abaixo **DENTRO do diretório do projeto**:

```
C:\Users\Dell\Dropbox\! 000 ByPass\Pessoal\Familia\Plano B\!00_APP\!99_CLÃ
```

### Passo a Passo:

1. **Abra o PowerShell ou CMD no diretório do projeto**

2. **Execute os comandos:**

```powershell
# Navegar para o diretório do projeto
cd "C:\Users\Dell\Dropbox\! 000 ByPass\Pessoal\Familia\Plano B\!00_APP\!99_CLÃ"

# Remover .git se existir no diretório do projeto
if (Test-Path .git) { Remove-Item -Path .git -Recurse -Force }

# Limpar variáveis de ambiente
$env:GIT_DIR = $null
$env:GIT_WORK_TREE = $null

# Inicializar novo repositório
git init --initial-branch=main

# Verificar se está correto (deve mostrar o caminho do projeto)
git rev-parse --show-toplevel

# Adicionar arquivos do projeto
git add App.js app.json babel.config.js jest.config.js package.json README.md .gitignore
git add src/
git add assets/

# Ver status
git status

# Fazer commit
git commit -m "Sprint 1: TOTEM + Onboarding - Implementação completa"
```

### Ou use o script automático:

```powershell
cd "C:\Users\Dell\Dropbox\! 000 ByPass\Pessoal\Familia\Plano B\!00_APP\!99_CLÃ"
.\setup-git.ps1
```

## 📋 Arquivos que devem ser commitados:

- ✅ `App.js`
- ✅ `app.json`
- ✅ `babel.config.js`
- ✅ `jest.config.js`
- ✅ `package.json`
- ✅ `README.md`
- ✅ `.gitignore`
- ✅ `src/` (toda a pasta)
- ✅ `assets/` (pasta)

## ❌ Arquivos que NÃO devem ser commitados:

- ❌ `node_modules/` (já no .gitignore)
- ❌ `.expo/` (já no .gitignore)
- ❌ Arquivos temporários do Word (`~$*.docx`)
- ❌ Arquivos `.tmp`

## 🚀 Após o commit:

1. Criar repositório no GitHub
2. Adicionar remote:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/cla-app.git
   ```
3. Fazer push:
   ```bash
   git push -u origin main
   ```





