// frontend/src/services/participanteService.js
import { apiClient } from './api';

/**
 * Service para operações relacionadas a Participantes
 * Centraliza todas as chamadas de API para participantes
 */
export const participanteService = {
  /**
   * Validar dados do participante (antes de criar)
   * POST /participantes/validar
   */
  validarDados: async (dadosParticipante) => {
    try {
      const response = await apiClient.post('/participantes/validar', dadosParticipante);
      return {
        sucesso: true,
        dados: response.dados,
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: error.message,
      };
    }
  },

  /**
   * Criar participante (status PENDENTE)
   * POST /participantes/criar
   */
  criar: async (dadosParticipante) => {
    try {
      const response = await apiClient.post('/participantes/criar', dadosParticipante);
      
      if (response.sucesso) {
        return {
          sucesso: true,
          dados: response.dados,
        };
      } else {
        return {
          sucesso: false,
          erro: response.erro,
          detalhes: response.detalhes,
        };
      }
    } catch (error) {
      return {
        sucesso: false,
        erro: 'Erro ao criar participante',
        detalhes: error.message,
      };
    }
  },

  /**
   * Buscar participante por ID
   * GET /participantes/:id
   */
  buscarPorId: async (id) => {
    try {
      const response = await apiClient.get(`/participantes/${id}`);
      return {
        sucesso: true,
        dados: response.dados,
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: 'Participante não encontrado',
        detalhes: error.message,
      };
    }
  },

  /**
   * Buscar participante por número de inscrição
   * GET /participantes/inscricao/:numeroInscricao
   */
  buscarPorInscricao: async (numeroInscricao) => {
    try {
      const response = await apiClient.get(`/participantes/inscricao/${numeroInscricao}`);
      return {
        sucesso: true,
        dados: response.dados,
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: 'Inscrição não encontrada',
        detalhes: error.message,
      };
    }
  },

  /**
   * Verificar disponibilidade de camisetas
   * POST /participantes/verificar-disponibilidade
   */
  verificarDisponibilidade: async (dadosCamisetas) => {
    try {
      const response = await apiClient.post('/participantes/verificar-disponibilidade', dadosCamisetas);
      return {
        sucesso: true,
        disponivel: response.dados?.disponivel || false,
        mensagem: response.mensagem,
      };
    } catch (error) {
      return {
        sucesso: false,
        disponivel: false,
        erro: error.message,
      };
    }
  },
};

export default participanteService;