// frontend/src/hooks/useAdminRelatorios.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * 📊 Hook customizado para gerenciamento de relatórios
 */
export const useAdminRelatorios = () => {
  const { fetchAuth } = useAuth();

  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Estatísticas simples
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    confirmados: 0,
    pendentes: 0,
  });

  useEffect(() => {
    carregarParticipantes();
  }, []);

  const carregarParticipantes = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log("📊 [AdminRelatorios] Carregando participantes...");

      const response = await fetchAuth("http://localhost:8000/api/participantes");
      const data = await response.json();

      if (data.sucesso) {
        const participantesData = data.dados.participantes || [];
        setParticipantes(participantesData);
        calcularEstatisticas(participantesData);

        console.log(`✅ [AdminRelatorios] ${participantesData.length} participantes carregados`);
      } else {
        throw new Error(data.erro || "Erro ao carregar participantes");
      }
    } catch (error) {
      console.error("❌ [AdminRelatorios] Erro ao carregar:", error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (dados) => {
    const total = dados.length;
    const confirmados = dados.filter((p) => p.statusPagamento === "confirmado").length;
    const pendentes = dados.filter((p) => p.statusPagamento === "pendente").length;

    setEstatisticas({ total, confirmados, pendentes });
  };

  return {
    participantes,
    loading,
    erro,
    estatisticas,
    carregarParticipantes,
  };
};

export default useAdminRelatorios;