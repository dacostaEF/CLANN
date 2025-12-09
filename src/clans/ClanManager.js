import ClanStorage from './ClanStorage';
import { validateClanName, validateClanDescription } from '../config/ClanTypes';

export default class ClanManager {
  // Cria novo CLANN
  static async createClan(clanData, creatorTotemId) {
    // Validações
    const nameError = validateClanName(clanData.name);
    if (nameError) throw new Error(nameError);
    
    const descError = validateClanDescription(clanData.description);
    if (descError) throw new Error(descError);
    
    // Cria CLANN
    return await ClanStorage.createClan(clanData, creatorTotemId);
  }

  // Entra em CLANN
  static async joinClan(inviteCode, totemId) {
    // Normaliza código (maiúsculas, sem espaços)
    const normalizedCode = inviteCode.toUpperCase().replace(/\s/g, '');
    
    if (!normalizedCode.match(/^[A-Z0-9]{6}$/)) {
      throw new Error('Código inválido. Use 6 letras/números.');
    }
    
    return await ClanStorage.joinClan(normalizedCode, totemId);
  }

  // Busca CLANN por código
  static async findClanByCode(inviteCode) {
    // Implementação simplificada - busca local
    // Em versão futura, buscará em servidor
    return null; // Placeholder
  }

  // Verifica se usuário pode criar mais CLANNs
  static async canCreateClan(totemId) {
    const userClans = await ClanStorage.getUserClans(totemId);
    
    // Limite de 5 CLANNs por usuário
    if (userClans.length >= 5) {
      return {
        canCreate: false,
        reason: 'Limite de CLANNs atingido (máximo 5)'
      };
    }
    
    return { canCreate: true };
  }

  // Atualiza informações do CLANN
  static async updateClan(clanId, updates, requesterTotemId) {
    // Verifica permissões
    const clan = await ClanStorage.getClanById(clanId, requesterTotemId);
    
    if (!clan.isMember) {
      throw new Error('Você não é membro deste CLANN');
    }
    
    if (clan.userRole !== 'founder' && clan.userRole !== 'admin') {
      throw new Error('Apenas fundadores e admins podem editar o CLANN');
    }
    
    // Validações
    if (updates.name) {
      const nameError = validateClanName(updates.name);
      if (nameError) throw new Error(nameError);
    }
    
    if (updates.description) {
      const descError = validateClanDescription(updates.description);
      if (descError) throw new Error(descError);
    }
    
    // Atualiza (implementação simplificada)
    // Em produção, usar ClanStorage.updateClan()
    return { success: true, clanId };
  }
}

