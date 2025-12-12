# Backlog Técnico - CLANN

## Issues Conhecidos

### [LOW] RN Web warning: Unexpected text node in <View>
- **Prioridade**: Baixa (Cosmetic)
- **Tipo**: Dev-only warning
- **Status**: Registrado para investigação futura
- **Descrição**: 
  - Warning do React Native Web: "Unexpected text node: . A text node cannot be a child of a <View>"
  - Aparece somente ao entrar no CHAT (não ocorre no PIN)
  - Não afeta funcionamento do app
  - Provável causa: whitespace ou renderização condicional JSX gerando text node

- **Investigação realizada**:
  - ✅ Verificado ChatHeader.js - corrigido espaço em branco (linha 74-78)
  - ✅ Verificado MessageBubble.js - adicionada normalização de watermarkedMessage
  - ✅ Verificado ClanChatScreen.js - normalizado authorName
  - ✅ Verificado MessageInput.js - sem problemas encontrados
  - ✅ Verificado DateSeparator.js - sem problemas encontrados
  - ✅ Verificado todos os .map() do chat - sem retornos JSX inválidos
  - ⚠️ Warning ainda persiste (pode ser whitespace sutil ou outro componente)

- **Próximos passos** (quando houver tempo):
  - Investigar whitespace entre tags JSX em componentes do chat
  - Verificar componentes filhos renderizados dinamicamente
  - Considerar usar React.Fragment explicitamente onde necessário

- **Data de registro**: 2025-01-XX
- **Última atualização**: 2025-01-XX

---

