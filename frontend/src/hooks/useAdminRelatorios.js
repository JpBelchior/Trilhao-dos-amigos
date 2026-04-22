import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { calcularEstatisticasAdmin } from "../utils/estatisticas";
import { carregarComLoading } from "../utils/carregarComLoading";

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

  const carregarParticipantes = () =>
    carregarComLoading(setLoading, setErro, async () => {
      const response = await fetchAuth("http://localhost:8000/api/participantes");
      const data = await response.json();
      if (data.sucesso) {
        const participantesData = data.dados.participantes || [];
        setParticipantes(participantesData);
        setEstatisticas(calcularEstatisticasAdmin(participantesData));
      } else {
        throw new Error(data.erro || "Erro ao carregar participantes");
      }
    });

  return {
    participantes,
    loading,
    erro,
    estatisticas,
    carregarParticipantes,
  };
};

export default useAdminRelatorios;