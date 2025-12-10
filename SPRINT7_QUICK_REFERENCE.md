# 🚀 SPRINT 7 - REFERÊNCIA RÁPIDA

## 📁 Arquivos Principais

### Módulos de Governança:
- `src/clans/RulesEngine.js` - Motor de regras
- `src/clans/RuleTemplates.js` - Templates e categorias
- `src/clans/ApprovalEngine.js` - Sistema de aprovações
- `src/clans/ApprovalExecutor.js` - Execução automática
- `src/clans/CouncilManager.js` - Conselho de anciões
- `src/clans/RuleEnforcement.js` - Aplicação de regras
- `src/clans/GovernanceStats.js` - Estatísticas

### Interface:
- `src/screens/GovernanceScreen.js` - Tela principal

---

## 🔧 Funções Principais

### RulesEngine:
```javascript
getRules(clanId)
getActiveRules(clanId)
createRule(clanId, text, category, templateId, creatorTotem)
editRule(ruleId, newText, editorTotem)
approveRule(ruleId, approverTotem)
toggleRule(ruleId, enabled)
deleteRule(ruleId, deleterTotem)
getRulesHash(clanId)
getRulesByCategory(clanId, category)
getRuleHistory(ruleId)
```

### ApprovalEngine:
```javascript
createApprovalRequest(clanId, actionType, actionData, requestedBy)
getPendingApprovals(clanId, status)
approveRequest(approvalId, approverTotem)
rejectRequest(approvalId, rejectorTotem)
cancelRequest(approvalId, requesterTotem)
```

### CouncilManager:
```javascript
initCouncil(clanId, founderTotem)
getCouncil(clanId)
isElder(clanId, totemId)
addElder(clanId, newElderTotem, requestedBy, requireApproval)
removeElder(clanId, elderTotem, requestedBy, requireApproval)
setApprovalsRequired(clanId, approvalsRequired, updatedBy)
getClanMembers(clanId)
```

### ApprovalExecutor:
```javascript
executeApprovedAction(approval)
checkAndExecuteApprovedActions(clanId)
```

### RuleEnforcement:
```javascript
checkAction(clanId, actionType, context)
enforceAndExecute(clanId, actionType, context, actionFn)
hasPermission(clanId, userTotem, userRole, actionType)
getRelevantRules(clanId, actionType)
```

### GovernanceStats:
```javascript
getGovernanceStats(clanId)
getQuickStats(clanId)
```

---

## 📊 Tabelas do Banco

1. **clan_rules** - Regras
2. **rule_templates** - Templates
3. **rule_history** - Histórico
4. **clan_council** - Conselho
5. **pending_approvals** - Aprovações

---

## 🎯 Tipos de Ações

### ApprovalEngine:
- `RULE_CREATE`, `RULE_EDIT`, `RULE_DELETE`
- `MEMBER_PROMOTE`, `MEMBER_DEMOTE`, `MEMBER_REMOVE`
- `COUNCIL_ELDER_ADD`, `COUNCIL_ELDER_REMOVE`
- `CLAN_SETTINGS_CHANGE`, `CUSTOM`

### RuleEnforcement:
- `SEND_MESSAGE`, `EDIT_MESSAGE`, `DELETE_MESSAGE`
- `JOIN_CLAN`, `LEAVE_CLAN`, `REMOVE_MEMBER`
- `CREATE_RULE`, `EDIT_RULE`, `DELETE_RULE`
- `ADD_ELDER`, `REMOVE_ELDER`
- `CHANGE_SETTINGS`, `UPLOAD_FILE`
- `CREATE_EVENT`, `CREATE_POLL`

---

## 🔐 Segurança

- Todas as ações registradas no Security Log
- Hash-chain para integridade
- Multi-assinatura para ações críticas
- Enforcement automático de regras

---

## ✅ Status

Todas as etapas 1-6 implementadas e funcionais!

