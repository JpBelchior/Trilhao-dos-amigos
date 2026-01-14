import { useState, useEffect } from "react";
import { apiClient } from "../services/api";

let cacheEdicao = null;

export const useEdicao = () => {
  const [edicaoAtual, setEdicaoAtual] = useState(cacheEdicao);
  const [loading, setLoading] = useState(!cacheEdicao);

  useEffect(() => {
    // Se já tem cache, não faz nada
    if (cacheEdicao) {
      return;
    }

    // Buscar da API
    const buscarEdicao = async () => {
      try {
        console.log("🔄 [useEdicao] Buscando edição atual...");

        const data = await apiClient.get("/edicao-atual");

        if (data.sucesso) {
          cacheEdicao = data.dados;
          setEdicaoAtual(data.dados);
          console.log("✅ [useEdicao] Edição carregada:", data.dados);
        }
      } catch (error) {
        console.error("❌ [useEdicao] Erro ao buscar edição:", error);

        // Fallback: calcular aqui mesmo
        const ano = new Date().getFullYear();
        const numero = ano - 2017 + 1;

        const dadosFallback = {
          ano,
          numeroEdicao: numero,
          edicao: `${numero}ª Edição`,
        };

        cacheEdicao = dadosFallback;
        setEdicaoAtual(dadosFallback);

        console.log("🔧 [useEdicao] Usando dados fallback:", dadosFallback);
      } finally {
        setLoading(false);
      }
    };

    buscarEdicao();
  }, []);

  return { edicaoAtual, loading };
};
