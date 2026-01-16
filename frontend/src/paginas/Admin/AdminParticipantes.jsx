import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  RefreshCw,
  Download,
  UserPlus,
  DollarSign,
} from "lucide-react";

// IMPORTAR COMPONENTES E HOOK QUE CRIAMOS
import useAdminParticipantes from "../../hooks/useAdminParticipantes";
import FiltrosAdminParticipantes from "../../componentes/Admin/FiltrosAdminParticipantes";
import ListaParticipantes from "../../componentes/Admin/ListaParticipantes";
import ModalAdminParticipante from "../../componentes/Admin/ModalAdminParticipante";
import LoadingComponent from "../../componentes/Loading";
import ErroComponent from "../../componentes/Erro";
import StatCard from "../../componentes/Admin/StatCard";
import ModalCriarUsuario from "../../componentes/Admin/ModalCriarUsuario";

const AdminParticipantes = () => {
  const navigate = useNavigate();

  const {
    // Estados principais
    participantes,
    participantesFiltrados,
    participantesPagina,
    loading,
    erro,
    operacaoLoading,

    // Filtros
    filtros,
    atualizarFiltro,
    limparFiltros,

    // Paginação
    paginaAtual,
    totalPaginas,
    itensPorPagina,
    irParaPagina,
    alterarItensPorPagina,

    // Estatísticas
    estatisticas,

    // Modal
    participanteSelecionado,
    modalAberto,
    selecionarParticipante,
    fecharModal,

    // Ações administrativas
    confirmarPagamento,
    excluirParticipante,
    recarregarDados,
    criarUsuario,
  } = useAdminParticipantes();

  const [modalCriarAberto, setModalCriarAberto] = useState(false);

  // 4️⃣ ADICIONAR FUNÇÕES PARA CONTROLAR O MODAL DE CRIAÇÃO
  // Abrir modal de criação
  const abrirModalCriacao = () => {
    setModalCriarAberto(true);
  };

  // Fechar modal de criação
  const fecharModalCriacao = () => {
    setModalCriarAberto(false);
  };

  // Lidar com sucesso na criação
  const handleCriarSuccess = async (dadosUsuario) => {
    const resultado = await criarUsuario(dadosUsuario);
    return resultado;
  };

  // Calcular índice inicial para numeração
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;

  // Função para lidar com sucesso no modal
  const handleModalSuccess = async (dadosAtualizados) => {
    console.log("✅ [AdminParticipantes] Modal success:", dadosAtualizados);

    // Recarregar dados para garantir sincronização
    await recarregarDados();

    // Fechar modal
    fecharModal();
  };

  // Função para lidar com exclusão no modal
  const handleModalDelete = async (participanteId) => {
    console.log(
      "🗑️ [AdminParticipantes] Participante excluído:",
      participanteId
    );

    // Recarregar dados
    await recarregarDados();

    // Fechar modal
    fecharModal();
  };

  // Função para exportar lista (futura implementação)
  const exportarLista = () => {
    alert("📊 Exportação será implementada na próxima versão!");
  };

  if (loading) return <LoadingComponent />;
  if (erro) return <ErroComponent erro={erro} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-8">
      <div className="container mx-auto px-6">
        {/* HEADER DA PÁGINA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div className="flex items-center mb-4 lg:mb-0">
            <button
              onClick={() => navigate("/admin")}
              className="bg-black/40 backdrop-blur-lg p-3 rounded-xl border border-green-400/30 hover:border-green-400/60 transition-all mr-4"
            >
              <ArrowLeft className="text-green-400" size={24} />
            </button>

            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                <Users className="inline mr-3" size={40} />
                GERENCIAR PARTICIPANTES
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400"></div>
            </div>
          </div>

          <div className="flex space-x-4">
            {/* NOVO BOTÃO - Criar Participante */}
            <button
              onClick={abrirModalCriacao}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center"
            >
              <UserPlus className="mr-2" size={20} />
              Criar Participante
            </button>

            <button
              onClick={recarregarDados}
              disabled={loading}
              className={`font-bold py-3 px-6 rounded-xl transition-all flex items-center ${
                loading
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <RefreshCw className="mr-2" size={20} />
              Atualizar
            </button>
          </div>
        </div>

        {/* CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={Users}
            value={estatisticas.total}
            label="Total de Participantes"
            color="white"
          />

          <StatCard
            icon={Users}
            value={estatisticas.confirmados}
            label="Confirmados"
            color="green"
          />

          <StatCard
            icon={Users}
            value={estatisticas.pendentes}
            label="Pendentes"
            color="yellow"
          />

          <StatCard
            icon={Users}
            value={estatisticas.cancelados}
            label="Cancelados"
            color="white"
          />

          <StatCard
            icon={DollarSign}
            value={`R$ ${estatisticas.receita.toFixed(2)}`}
            label="Receita Confirmada"
            color="green"
          />
        </div>

        {/* COMPONENTE DE FILTROS */}
        <FiltrosAdminParticipantes
          filtros={filtros}
          atualizarFiltro={atualizarFiltro}
          limparFiltros={limparFiltros}
          totalEncontrados={participantesFiltrados.length}
          estatisticas={estatisticas}
        />

        {/* COMPONENTE LISTA DE PARTICIPANTES */}
        <div className="mb-8">
          <ListaParticipantes
            participantesPagina={participantesPagina}
            indiceInicio={indiceInicio}
            selecionarParticipante={selecionarParticipante}
            confirmarPagamento={confirmarPagamento}
            excluirParticipante={excluirParticipante}
            operacaoLoading={operacaoLoading}
          />
        </div>

        {/* PAGINAÇÃO */}
        {totalPaginas > 1 && (
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              {/* INFO DA PAGINAÇÃO */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  Mostrando {indiceInicio + 1} a{" "}
                  {Math.min(
                    indiceInicio + itensPorPagina,
                    participantesFiltrados.length
                  )}{" "}
                  de {participantesFiltrados.length}
                </span>

                <select
                  value={itensPorPagina}
                  onChange={(e) =>
                    alterarItensPorPagina(Number(e.target.value))
                  }
                  className="bg-black/40 text-white border border-green-400/30 rounded-lg px-3 py-1 text-sm"
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>

              {/* BOTÕES DE NAVEGAÇÃO */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => irParaPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    paginaAtual === 1
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  ← Anterior
                </button>

                <span className="text-gray-400 px-4">
                  Página {paginaAtual} de {totalPaginas}
                </span>

                <button
                  onClick={() => irParaPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    paginaAtual === totalPaginas
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  Próximo →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE EDIÇÃO/VISUALIZAÇÃO */}

        <ModalCriarUsuario
          isOpen={modalCriarAberto}
          onClose={fecharModalCriacao}
          onSuccess={handleCriarSuccess}
          operacaoLoading={operacaoLoading}
        />
        <ModalAdminParticipante
          participante={participanteSelecionado}
          isOpen={modalAberto}
          onClose={fecharModal}
          onSuccess={handleModalSuccess}
          onDelete={handleModalDelete}
        />

        {/* RODAPÉ COM INFORMAÇÕES ÚTEIS */}
        <div className="mt-12 bg-green-900/30 rounded-2xl p-6 border border-green-400/30">
          <h4 className="text-lg font-bold text-green-400 mb-3">
            Dicas de Gerenciamento
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <p>
                • <strong>Clique em "Editar Dados"</strong> para modificar nome,
                moto, status ou observações
              </p>
              <p>
                • <strong>Use os filtros</strong> para encontrar participantes
                específicos rapidamente
              </p>
              <p>
                • <strong>Status Pendente:</strong> pode confirmar pagamento ou
                excluir participante
              </p>
            </div>
            <div>
              <p>
                • <strong>Status Confirmado:</strong> participante está inscrito
                e pode participar
              </p>
              <p>
                • <strong>Exclusão:</strong> remove permanentemente e libera
                camisetas reservadas
              </p>
              <p>
                • <strong>Dados sensíveis</strong> (CPF, email) são protegidos
                contra alteração
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminParticipantes;
