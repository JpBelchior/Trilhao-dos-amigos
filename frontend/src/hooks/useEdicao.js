// frontend/src/hooks/useEdicao.js
import { useState, useEffect } from "react";

// Cache simples - evita múltiplas chamadas
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
        const response = await fetch("http://localhost:8000/api/edicao-atual");
        const data = await response.json();

        if (data.sucesso) {
          cacheEdicao = data.dados;
          setEdicaoAtual(data.dados);
        }
      } catch (error) {
        console.error("Erro ao buscar edição:", error);

        // Fallback: calcular aqui mesmo
        const ano = new Date().getFullYear();
        const numero = ano - 2017 + 1;

        cacheEdicao = {
          ano,
          numeroEdicao: numero,
          edicao: `${numero}ª Edição`,
        };

        setEdicaoAtual(cacheEdicao);
      } finally {
        setLoading(false);
      }
    };

    buscarEdicao();
  }, []);

  return { edicaoAtual, loading };
};
