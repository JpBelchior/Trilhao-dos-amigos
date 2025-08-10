// frontend/src/paginas/Admin/AdminParticipantes.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  RefreshCw,
  Download,
  UserPlus,
  DollarSign,
  TrendingUp,
} from "lucide-react";

// IMPORTAR COMPONENTES E HOOK QUE CRIAMOS
import useAdminParticipantes from "../../hooks/useAdminParticipantes";
import FiltrosAdminParticipantes from "../../componentes/Admin/FiltrosAdminParticipantes";
import ListaParticipantes from "../../componentes/Admin/ListaParticipantes";
import ModalAdminParticipante from "../../componentes/Admin/ModalAdminParticipante";
import LoadingComponent from "../../componentes/Loading";
import ErroComponent from "../../componentes/Erro";
import StatCard from "../../componentes/Admin/StatCard";

const AdminParticipantes = () => {
  const navigate = useNavigate();

  // USAR HOOK CUSTOMIZADO QUE CRIAMOS
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
    cancelarParticipante,
    recarregarDados,
  } = useAdminParticipantes();

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
    // TODO: Implementar exportação CSV/PDF
  };

  // Se estiver carregando
  if (loading) {
    return (
      <LoadingComponent
        loading="Carregando participantes..."
        className="bg-gradient-to-br from-green-900 via-black to-green-900"
      />
    );
  }

  // Se houve erro
  if (erro) {
    return (
      <ErroComponent
        erro={{
          mensagem: erro,
          tipo: "conexao",
        }}
        onTentarNovamente={recarregarDados}
        className="bg-gradient-to-br from-green-900 via-black to-green-900"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        {/* CABEÇALHO */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
          <div>
            <h1 className="text-5xl font-black text-white mb-4">
              GERENCIAR <span className="text-yellow-400">PARTICIPANTES</span>
            </h1>
            <p className="text-gray-400 text-xl">
              Visualize, edite e gerencie todas as inscrições do Trilhão dos
              Amigos
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mt-4"></div>
          </div>

          {/* BOTÕES DE AÇÃO DO CABEÇALHO */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-0">
            <button
              onClick={() => navigate("/admin")}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center"
            >
              <ArrowLeft className="mr-2" size={20} />
              Voltar ao Dashboard
            </button>

            <button
              onClick={exportarLista}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center"
            >
              <Download className="mr-2" size={20} />
              Exportar Lista
            </button>

            <button
              onClick={recarregarDados}
              disabled={loading || operacaoLoading}
              className={`font-bold py-3 px-6 rounded-xl transition-all flex items-center ${
                loading || operacaoLoading
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
            cancelarParticipante={cancelarParticipante}
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
                  de {participantesFiltrados.length} participantes
                </span>

                {/* SELECT ITENS POR PÁGINA */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">
                    Itens por página:
                  </span>
                  <select
                    value={itensPorPagina}
                    onChange={(e) =>
                      alterarItensPorPagina(Number(e.target.value))
                    }
                    className="bg-black/50 border border-gray-600 rounded-xl px-3 py-1 text-white text-sm focus:border-yellow-400 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* CONTROLES DE PAGINAÇÃO */}
              <div className="flex items-center space-x-2">
                {/* Botão Anterior */}
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

                {/* Números das Páginas */}
                <div className="flex space-x-1">
                  {[...Array(totalPaginas)].map((_, i) => {
                    const pagina = i + 1;
                    // Mostrar apenas páginas próximas à atual
                    if (
                      pagina === 1 ||
                      pagina === totalPaginas ||
                      (pagina >= paginaAtual - 2 && pagina <= paginaAtual + 2)
                    ) {
                      return (
                        <button
                          key={pagina}
                          onClick={() => irParaPagina(pagina)}
                          className={`px-3 py-2 rounded-xl font-bold transition-all ${
                            paginaAtual === pagina
                              ? "bg-yellow-500 text-black"
                              : "bg-black/40 text-white hover:bg-gray-700"
                          }`}
                        >
                          {pagina}
                        </button>
                      );
                    } else if (
                      pagina === paginaAtual - 3 ||
                      pagina === paginaAtual + 3
                    ) {
                      return (
                        <span key={pagina} className="px-2 py-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Botão Próximo */}
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
            💡 Dicas de Gerenciamento
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
                cancelar inscrição
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
