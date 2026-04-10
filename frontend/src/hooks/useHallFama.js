// frontend/src/hooks/useHallFama.js
import { useState, useEffect, useMemo } from "react";
import { apiClient } from "../services/api";

/**
 * 🏆 Hook customizado para gerenciar o Hall da Fama
 * 
 * @returns {Object} Estados e funções necessários para o componente
 */
export const useHallFama = () => {
  // ========================================
  // ESTADOS
  // ========================================
  const [campeoes, setCampeoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [melhorResultado, setMelhorResultado] = useState(null);

  // ========================================
  // CONSTANTES
  // ========================================
  const ALTURA_TOPO = 300; // Altura total do morro em metros

  // ========================================
  // CARREGAR DADOS AO MONTAR
  // ========================================
  useEffect(() => {
    carregarCampeoes();
  }, []);

  // ========================================
  // FUNÇÕES - API
  // ========================================

  /**
   * 📥 Carregar campeões e melhor resultado da API
   * Usando apiClient centralizado para consistência
   */
  const carregarCampeoes = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log("🏆 [useHallFama] Carregando campeões...");

      // Carregar lista de campeões (obrigatório)
      const campeoesData = await apiClient.get("/campeoes");

      if (campeoesData.sucesso) {
        setCampeoes(campeoesData.dados.campeoes);
        console.log(
          `✅ [useHallFama] ${campeoesData.dados.campeoes.length} campeões carregados`
        );
      }

      // Carregar melhor resultado (opcional — pode não existir ainda)
      try {
        const melhorData = await apiClient.get("/campeoes/melhor");
        if (melhorData.sucesso) {
          setMelhorResultado(melhorData.dados.campeao);
          console.log(
            `🥇 [useHallFama] Melhor resultado: ${melhorData.dados.campeao.nome} - ${melhorData.dados.campeao.resultadoAltura}m`
          );
        }
      } catch {
        // Nenhum campeão cadastrado ainda — não é um erro crítico
        setMelhorResultado(null);
      }
    } catch (error) {
      console.error("❌ [useHallFama] Erro ao carregar campeões:", error);
      setErro(error.message || "Erro ao carregar dados dos campeões");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FUNÇÕES - PROCESSAMENTO DE DADOS
  // ========================================

  /**
   * 📊 Organizar campeões por edição
   * Retorna apenas o MELHOR de cada categoria por edição
   * 
   * @returns {Array} Array de edições com melhor nacional e melhor importada
   */
  const organizarPorEdicao = useMemo(() => {
    const edicoes = {};

    campeoes.forEach((campeao) => {
      const edicaoKey = `${campeao.edicao}_${campeao.ano}`;

      // Criar estrutura da edição se não existir
      if (!edicoes[edicaoKey]) {
        edicoes[edicaoKey] = {
          edicao: campeao.edicao,
          ano: campeao.ano,
          melhorNacional: null,
          melhorImportada: null,
        };
      }

      // Para cada categoria, manter apenas o MELHOR (maior altura)
      if (campeao.categoriaMoto === "nacional") {
        if (
          !edicoes[edicaoKey].melhorNacional ||
          campeao.resultadoAltura >
            edicoes[edicaoKey].melhorNacional.resultadoAltura
        ) {
          edicoes[edicaoKey].melhorNacional = campeao;
        }
      } else if (campeao.categoriaMoto === "importada") {
        if (
          !edicoes[edicaoKey].melhorImportada ||
          campeao.resultadoAltura >
            edicoes[edicaoKey].melhorImportada.resultadoAltura
        ) {
          edicoes[edicaoKey].melhorImportada = campeao;
        }
      }
    });

    // Converter para array e ordenar por ano (mais recente primeiro)
    return Object.values(edicoes).sort((a, b) => b.ano - a.ano);
  }, [campeoes]); // Só recalcula quando campeoes mudar

  /**
   * 📏 Calcular distância que faltou para o topo
   * 
   * @param {number} altura - Altura alcançada pelo piloto
   * @returns {string} Distância formatada (ex: "12.5m") ou "CONQUISTOU!"
   */
  const calcularDistanciaFaltou = (altura) => {
    const faltou = ALTURA_TOPO - altura;
    return faltou > 0 ? `${faltou.toFixed(2)}m` : "CONQUISTOU!";
  };

  // ========================================
  // RETORNO DO HOOK
  // ========================================
  return {
    // Estados
    campeoes,
    loading,
    erro,
    melhorResultado,

    // Dados processados
    edicoes: organizarPorEdicao,

    // Funções
    carregarCampeoes,
    calcularDistanciaFaltou,
  };
};

export default useHallFama;