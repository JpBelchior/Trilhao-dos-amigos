import { useState, useEffect } from "react";
import { apiClient } from "../services/api";
const ANO_PRIMEIRA_EDICAO = 2018;

let cacheEdicao = null;

export const useEdicao = () => {
  const [edicaoAtual, setEdicaoAtual] = useState(cacheEdicao);
  const [loading, setLoading] = useState(!cacheEdicao);

  useEffect(() => {
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
        const numero = ano - 2018 + 1;

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
 

  return { edicaoAtual, loading, anoEhValido };
}

 export function anoEhValido(ano) {
  const anoNumerico = parseInt(ano);
  const anoAtual = new Date().getFullYear();

  return (
    !isNaN(anoNumerico) &&
    anoNumerico >= ANO_PRIMEIRA_EDICAO &&
    anoNumerico <= anoAtual + 1 
  );
}

export function calcularEdicao(ano) {
  const anoNumerico = parseInt(ano);

  if (isNaN(anoNumerico) || anoNumerico < ANO_PRIMEIRA_EDICAO) {
    return { edicao: "", numeroEdicao: 0 };
  }

  const numeroEdicao = anoNumerico - ANO_PRIMEIRA_EDICAO + 1;
  const edicao = `${numeroEdicao}ª Edição`;

  return { edicao, numeroEdicao };
}

export function formatarEdicao(edicao) {
  if (!edicao) return null;

  // Se já vem formatado com "Edição", retornar como está
  if (edicao.toLowerCase().includes('edição') || edicao.toLowerCase().includes('edicao')) {
    return edicao;
  }

  // Extrair apenas os números
  const numero = edicao.toString().replace(/\D/g, '');

  if (!numero) return edicao;
  return `${numero}ª Edição`;
}

