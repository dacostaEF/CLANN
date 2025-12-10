import MessagesStorage from './MessagesStorage';

/**
 * Lógica de negócio para mensagens dos CLANNs
 * Encapsula validações e operações do MessagesStorage
 * 
 * Sprint 4: Chat básico funcional
 */
class MessagesManager {
  constructor() {
    this.storage = MessagesStorage;
    this.initialized = false;
  }

  // ---------------------------------------------------------
  // Inicialização
  // ---------------------------------------------------------
  async init() {
    if (this.initialized) {
      return Promise.resolve(true);
    }
    
    try {
      await this.storage.init();
      this.initialized = true;
      return Promise.resolve(true);
    } catch (error) {
      console.error('Erro ao inicializar MessagesManager:', error);
      throw error;
    }
  }

  // ---------------------------------------------------------
  // Adicionar mensagem com validação
  // ---------------------------------------------------------
  async addMessage(clanId, authorTotem, text) {
    // Validações
    if (!clanId) {
      throw new Error('clanId é obrigatório');
    }

    if (!authorTotem || typeof authorTotem !== 'string' || authorTotem.trim() === '') {
      throw new Error('authorTotem é obrigatório e deve ser uma string válida');
    }

    if (!text || typeof text !== 'string') {
      throw new Error('text é obrigatório e deve ser uma string');
    }

    const trimmedText = text.trim();
    
    if (trimmedText === '') {
      throw new Error('Mensagem não pode estar vazia');
    }

    if (trimmedText.length > 5000) {
      throw new Error('Mensagem não pode exceder 5000 caracteres');
    }

    // Garantir que está inicializado
    if (!this.initialized) {
      await this.init();
    }

    // Adicionar timestamp e salvar
    try {
      const message = await this.storage.addMessage(
        parseInt(clanId),
        authorTotem.trim(),
        trimmedText
      );
      return message;
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
      throw new Error(`Erro ao adicionar mensagem: ${error.message}`);
    }
  }

  // ---------------------------------------------------------
  // Buscar mensagens ordenadas
  // ---------------------------------------------------------
  async getMessages(clanId) {
    if (!clanId) {
      throw new Error('clanId é obrigatório');
    }

    // Garantir que está inicializado
    if (!this.initialized) {
      await this.init();
    }

    try {
      const messages = await this.storage.getMessages(parseInt(clanId));
      
      // Retornar array formatado (já vem ordenado do storage)
      return messages.map(msg => ({
        id: msg.id,
        clanId: msg.clan_id,
        authorTotem: msg.author_totem,
        message: msg.message,
        timestamp: msg.timestamp
      }));
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw new Error(`Erro ao buscar mensagens: ${error.message}`);
    }
  }

  // ---------------------------------------------------------
  // Deletar mensagem
  // ---------------------------------------------------------
  async deleteMessage(messageId) {
    if (!messageId) {
      throw new Error('messageId é obrigatório');
    }

    // Garantir que está inicializado
    if (!this.initialized) {
      await this.init();
    }

    try {
      await this.storage.deleteMessage(messageId);
      return true;
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      throw new Error(`Erro ao deletar mensagem: ${error.message}`);
    }
  }

  // ---------------------------------------------------------
  // Limpar mensagens de um CLANN
  // ---------------------------------------------------------
  async clearMessages(clanId) {
    if (!clanId) {
      throw new Error('clanId é obrigatório');
    }

    // Garantir que está inicializado
    if (!this.initialized) {
      await this.init();
    }

    try {
      await this.storage.clearMessages(parseInt(clanId));
      return true;
    } catch (error) {
      console.error('Erro ao limpar mensagens:', error);
      throw new Error(`Erro ao limpar mensagens: ${error.message}`);
    }
  }
}

export default new MessagesManager();

