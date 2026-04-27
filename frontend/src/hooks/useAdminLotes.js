import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "/api";

export const useAdminLotes = () => {
  const { fetchAuth } = useAuth();

  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [operacaoLoading, setOperacaoLoading] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [loteSelecionado, setLoteSelecionado] = useState(null); // null = criar, objeto = editar

  useEffect(() => {
    carregarLotes();
  }, []);

  // Status vem do backend — apenas filtra localmente para o card de destaque
  const loteAtivo = lotes.find((l) => l.status === "ATIVO") || null;

  const carregarLotes = async () => {
    try {
      setLoading(true);
      setErro(null);

      const response = await fetchAuth(`${API_URL}/lotes`);
      const data = await response.json();

      if (data.sucesso) {
        setLotes(data.dados.lotes || []);
      } else {
        throw new Error(data.erro || "Erro ao carregar lotes");
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const criarLote = async (dadosLote) => {
    try {
      setOperacaoLoading(true);

      const response = await fetchAuth(`${API_URL}/lotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosLote),
      });
      const data = await response.json();

      if (data.sucesso) {
        await carregarLotes();
        return { sucesso: true };
      } else {
        throw new Error(data.erro || "Erro ao criar lote");
      }
    } catch (error) {
      return { sucesso: false, erro: error.message };
    } finally {
      setOperacaoLoading(false);
    }
  };

  const editarLote = async (id, dadosLote) => {
    try {
      setOperacaoLoading(true);

      const response = await fetchAuth(`${API_URL}/lotes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosLote),
      });
      const data = await response.json();

      if (data.sucesso) {
        await carregarLotes();
        return { sucesso: true };
      } else {
        throw new Error(data.erro || "Erro ao editar lote");
      }
    } catch (error) {
      return { sucesso: false, erro: error.message };
    } finally {
      setOperacaoLoading(false);
    }
  };

  const excluirLote = async (id) => {
    try {
      setOperacaoLoading(true);

      const response = await fetchAuth(`${API_URL}/lotes/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.sucesso) {
        setLotes((prev) => prev.filter((l) => l.id !== id));
        return { sucesso: true };
      } else {
        throw new Error(data.erro || "Erro ao excluir lote");
      }
    } catch (error) {
      return { sucesso: false, erro: error.message };
    } finally {
      setOperacaoLoading(false);
    }
  };

  const abrirModalCriacao = () => {
    setLoteSelecionado(null);
    setModalAberto(true);
  };

  const selecionarLote = (lote) => {
    setLoteSelecionado(lote);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setLoteSelecionado(null);
    setModalAberto(false);
  };

  return {
    lotes,
    loteAtivo,
    loading,
    erro,
    operacaoLoading,
    modalAberto,
    loteSelecionado,
    carregarLotes,
    criarLote,
    editarLote,
    excluirLote,
    abrirModalCriacao,
    selecionarLote,
    fecharModal,
  };
};

export default useAdminLotes;
