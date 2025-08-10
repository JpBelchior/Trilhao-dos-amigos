import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  LogOut,
  Settings,
  FileText,
  Trophy,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
const AdminDashboard = () => {
  const { gerente, logout, fetchAuth } = useAuth();
  const navigate = useNavigate();
  // Estados do dashboard
  const [estatisticas, setEstatisticas] = useState({
    totalParticipantes: 0,
    participantesConfirmados: 0,
    participantesPendentes: 0,
    receita: 0,
    camisetasReservadas: 0,
    camisetasDisponiveis: 0,
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  useEffect(() => {
    carregarEstatisticas();
  }, []);
  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      setErro(null);
      console.log("📊 [Dashboard] Carregando estatísticas...");

      // Carregar participantes usando fetchAuth (requisição autenticada)
      const participantesResponse = await fetchAuth(
        "http://localhost:8000/api/participantes"
      );
      const participantesData = await participantesResponse.json();

      // Carregar estoque
      const estoqueResponse = await fetchAuth(
        "http://localhost:8000/api/estoque/resumo"
      );
      const estoqueData = await estoqueResponse.json();

      if (participantesData.sucesso && estoqueData.sucesso) {
        const participantes = participantesData.dados.participantes || [];
        const confirmados = participantes.filter(
          (p) => p.statusPagamento === "confirmado"
        );
        const pendentes = participantes.filter(
          (p) => p.statusPagamento === "pendente"
        );

        // Calcular receita total
        const receita = confirmados.reduce((total, p) => {
          return total + parseFloat(p.valorInscricao || 0);
        }, 0);

        setEstatisticas({
          totalParticipantes: participantes.length,
          participantesConfirmados: confirmados.length,
          participantesPendentes: pendentes.length,
          receita: receita,
          camisetasReservadas: estoqueData.dados.totalReservadas || 0,
          camisetasDisponiveis: estoqueData.dados.totalDisponiveis || 0,
        });

        console.log("✅ [Dashboard] Estatísticas carregadas:", {
          total: participantes.length,
          confirmados: confirmados.length,
          receita: receita,
        });
      } else {
        throw new Error("Erro ao carregar dados do servidor");
      }
    } catch (error) {
      console.error("❌ [Dashboard] Erro ao carregar estatísticas:", error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair da área administrativa?")) {
      console.log("👋 [Dashboard] Fazendo logout...");
      logout();
      navigate("/", { replace: true });
    }
  };
  const handleNavegar = (destino) => {
    console.log("🔄 [Dashboard] Navegando para:", destino);
    // Por enquanto, apenas log. Implementaremos as páginas depois
    alert(`Navegação para ${destino} será implementada no próximo passo!`);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 max-w-md mx-auto">
            <RefreshCw
              className="animate-spin mx-auto text-green-400 mb-4"
              size={48}
            />
            <h2 className="text-2xl font-bold text-white mb-2">
              Carregando Dashboard
            </h2>
            <p className="text-gray-400">Buscando dados do sistema...</p>
          </div>
        </div>
      </div>
    );
  }
  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-red-400/30 max-w-md mx-auto">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-white mb-2">
              Erro no Dashboard
            </h2>
            <p className="text-gray-400 mb-4">{erro}</p>
            <button
              onClick={carregarEstatisticas}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header do Admin */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-5xl font-black text-white mb-4">
              PAINEL <span className="text-yellow-400">ADMINISTRATIVO</span>
            </h1>
            <p className="text-gray-400 text-xl">
              Bem-vindo(a),{" "}
              <span className="text-yellow-400 font-bold">{gerente?.nome}</span>
            </p>
            <p className="text-gray-500 text-sm">
              Últimas atualizações: {new Date().toLocaleString()}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center mt-4 md:mt-0"
          >
            <LogOut className="mr-2" size={20} />
            Sair
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center hover:border-green-400/60 transition-all">
            <Users className="mx-auto text-green-400 mb-2" size={32} />
            <div className="text-3xl font-black text-white mb-1">
              {estatisticas.totalParticipantes}
            </div>
            <div className="text-gray-300 text-sm">Total Inscritos</div>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center hover:border-green-400/60 transition-all">
            <Users className="mx-auto text-green-400 mb-2" size={32} />
            <div className="text-3xl font-black text-green-400 mb-1">
              {estatisticas.participantesConfirmados}
            </div>
            <div className="text-gray-300 text-sm">Confirmados</div>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/30 text-center hover:border-yellow-400/60 transition-all">
            <Users className="mx-auto text-yellow-400 mb-2" size={32} />
            <div className="text-3xl font-black text-yellow-400 mb-1">
              {estatisticas.participantesPendentes}
            </div>
            <div className="text-gray-300 text-sm">Pendentes</div>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center hover:border-green-400/60 transition-all">
            <DollarSign className="mx-auto text-green-400 mb-2" size={32} />
            <div className="text-2xl font-black text-green-400 mb-1">
              R$ {estatisticas.receita.toFixed(2)}
            </div>
            <div className="text-gray-300 text-sm">Receita</div>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/30 text-center hover:border-yellow-400/60 transition-all">
            <ShoppingBag className="mx-auto text-yellow-400 mb-2" size={32} />
            <div className="text-3xl font-black text-yellow-400 mb-1">
              {estatisticas.camisetasReservadas}
            </div>
            <div className="text-gray-300 text-sm">Camisetas Reservadas</div>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center hover:border-green-400/60 transition-all">
            <ShoppingBag className="mx-auto text-green-400 mb-2" size={32} />
            <div className="text-3xl font-black text-green-400 mb-1">
              {estatisticas.camisetasDisponiveis}
            </div>
            <div className="text-gray-300 text-sm">Camisetas Disponíveis</div>
          </div>
        </div>

        {/* Menu de Ações Principais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => handleNavegar("Participantes")}
            className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 hover:border-green-400/60 transition-all cursor-pointer transform hover:scale-105"
          >
            <Users className="text-green-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Participantes</h3>
            <p className="text-gray-400 text-sm mb-4">
              Gerenciar inscrições, confirmar pagamentos e editar dados dos
              participantes
            </p>
            <div className="bg-green-600/20 rounded-xl p-2 text-center">
              <span className="text-green-400 font-bold">
                {estatisticas.participantesConfirmados} confirmados
              </span>
            </div>
          </div>

          <div
            onClick={() => handleNavegar("Estoque")}
            className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 hover:border-yellow-400/60 transition-all cursor-pointer transform hover:scale-105"
          >
            <ShoppingBag className="text-yellow-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Estoque</h3>
            <p className="text-gray-400 text-sm mb-4">
              Controlar camisetas por tamanho e tipo, visualizar reservas
            </p>
            <div className="bg-yellow-600/20 rounded-xl p-2 text-center">
              <span className="text-yellow-400 font-bold">
                {estatisticas.camisetasDisponiveis} disponíveis
              </span>
            </div>
          </div>

          <div
            onClick={() => handleNavegar("Campeões")}
            className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 hover:border-green-400/60 transition-all cursor-pointer transform hover:scale-105"
          >
            <Trophy className="text-green-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Hall da Fama</h3>
            <p className="text-gray-400 text-sm mb-4">
              Gerenciar campeões, resultados e histórico das edições
            </p>
            <div className="bg-green-600/20 rounded-xl p-2 text-center">
              <span className="text-green-400 font-bold">Campeões</span>
            </div>
          </div>

          <div
            onClick={() => handleNavegar("Relatórios")}
            className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 hover:border-yellow-400/60 transition-all cursor-pointer transform hover:scale-105"
          >
            <FileText className="text-yellow-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Relatórios</h3>
            <p className="text-gray-400 text-sm mb-4">
              Exportar listas, gerar estatísticas e relatórios detalhados
            </p>
            <div className="bg-yellow-600/20 rounded-xl p-2 text-center">
              <span className="text-yellow-400 font-bold">Exportações</span>
            </div>
          </div>
        </div>

        {/* Botão para atualizar dados */}
        <div className="text-center mt-12">
          <button
            onClick={carregarEstatisticas}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center mx-auto"
          >
            <RefreshCw className="mr-2" size={20} />
            Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
