import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShoppingBag,
  BadgeDollarSign,
  LogOut,
  FileText,
  Trophy,
  Camera,
  Lock,
} from "lucide-react";
import LoadingComponent from "../../componentes/Loading";
import ErroComponent from "../../componentes/Erro";
import StatCard from "../../componentes/Admin/StatCard";
import ActionCard from "../../componentes/Admin/ActionCard";
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
      logout();
      navigate("/", { replace: true });
    }
  };
  const handleNavegar = (destino) => {
    console.log("🔄 [Dashboard] Navegando para:", destino);

    // ✅ Implementar navegação para perfil
    if (destino === "Perfil") {
      navigate("/admin/perfil");
      return;
    }

    // Para outras páginas, mostrar alert temporário
    alert(`Navegação para ${destino} será implementada no próximo passo!`);
  };

  if (loading) {
    return (
      <LoadingComponent
        loading="Carregando dashboard administrativo..."
        className="bg-gradient-to-br from-green-900 via-black to-green-900"
      />
    );
  }

  if (erro) {
    return (
      <ErroComponent
        erro={{
          mensagem: erro,
          tipo: "conexao",
        }}
        onTentarNovamente={carregarEstatisticas}
        className="bg-gradient-to-br from-green-900 via-black to-green-900"
      />
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
          <div className="justify-end flex p-5 mr-3">
            <button
              onClick={() => navigate("/admin/perfil")}
              className={`group flex items-center mb-12 mr-5 px-6 py-3 rounded-xl transition-all font-semibold transform hover:scale-105
                  bg-yellow-500 text-black shadow-lg shadow-yellow-400/25
               `}
            >
              <Lock className="mr-2" size={20} />
              Atualizar Perfil
            </button>

            <button
              onClick={handleLogout}
              className={`group flex items-center mb-12 px-6 py-3 rounded-xl transition-all font-semibold transform hover:scale-105
                  bg-yellow-500 text-black shadow-lg shadow-yellow-400/25
               `}
            >
              <LogOut className="mr-2" size={20} />
              Sair
            </button>
          </div>
        </div>

        {/* 🎯 CARDS DE ESTATÍSTICAS USANDO STATCARD */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Users}
            value={estatisticas.totalParticipantes}
            label="Total Inscritos"
            color="yellow"
          />

          <StatCard
            icon={BadgeDollarSign}
            value={`R$ ${estatisticas.receita.toFixed(2)}`}
            label="Receita"
            color="green"
          />

          <StatCard
            icon={ShoppingBag}
            value={estatisticas.camisetasReservadas}
            label="Camisetas Reservadas"
            color="yellow"
          />

          <StatCard
            icon={ShoppingBag}
            value={estatisticas.camisetasDisponiveis}
            label="Camisetas Disponíveis"
            color="green"
          />
        </div>

        {/* 🎯 MENU DE AÇÕES USANDO ACTIONCARD */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <ActionCard
            icon={Users}
            title="Participantes"
            description="Gerenciar inscrições, confirmar pagamentos e editar dados dos participantes"
            color="green"
            badge={`${estatisticas.totalParticipantes} inscritos`}
            onClick={() => navigate("/admin/participantes")} // ← NAVEGAÇÃO DIRETA
          />

          <ActionCard
            icon={ShoppingBag}
            title="Estoque"
            description="Controlar camisetas por tamanho e tipo, visualizar reservas"
            color="yellow"
            badge={`${estatisticas.camisetasDisponiveis} disponíveis`}
            onClick={() => navigate("/admin/estoque")}
          />

          <ActionCard
            icon={Trophy}
            title="Hall da Fama"
            description="Gerenciar campeões, resultados e histórico das edições"
            color="green"
            badge="Campeões"
           onClick={() => navigate("/admin/campeoes")}
          />

          <ActionCard
            icon={FileText}
            title="Relatórios"
            description="Exportar listas, gerar estatísticas e relatórios detalhados"
            color="yellow"
            badge="Exportações"
           onClick={() => navigate("/admin/relatorios")}
          />

          <ActionCard
            icon={Camera}
            title="Fotos"
            description="Gerenciar fotos dos participantes e do evento para colocar no site"
            color="green"
            badge="Álbum"
            onClick={() => navigate("/admin/fotos")}
          />
        </div>

        {/* Botão para atualizar dados */}
        <div className="text-center mt-12">
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
