import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  ArrowLeft,
  RefreshCw,
  PlusCircle,
  Filter,
  Award,
  Target,
} from "lucide-react";

import useAdminCampeoes from "../../hooks/useAdminCampeoes";
import LoadingComponent from "../../componentes/Loading";
import ErroComponent from "../../componentes/Erro";
import StatCard from "../../componentes/Admin/StatCard";
import ModalCampeao from "../../componentes/Admin/ModalCampeao";
import ModalCriarCampeao from "../../componentes/Admin/ModalCriarCampeao";

const AdminCampeoes = () => {
  const navigate = useNavigate();

  const {
    campoesPagina,
    loading,
    erro,
    operacaoLoading,
    estatisticas,
    modalAberto,
    modalCriarAberto,
    campeaoSelecionado,
    selecionarCampeao,
    abrirModalCriacao,
    fecharModal,
    filtros,
    atualizarFiltro,
    limparFiltros,
    paginaAtual,
    totalPaginas,
    itensPorPagina,
    irParaPagina,
    alterarItensPorPagina,
    editarCampeao,
    excluirCampeao,
    recarregarDados,
  } = useAdminCampeoes();

  const handleEditarSuccess = async () => {
    console.log("✅ [AdminCampeoes] Campeão editado com sucesso");
    await recarregarDados();
    fecharModal();
  };

  const handleCriarSuccess = async () => {
    console.log("✅ [AdminCampeoes] Campeão criado com sucesso");
    await recarregarDados();
    fecharModal();
  };

  const handleExcluirSuccess = async () => {
    console.log("✅ [AdminCampeoes] Campeão excluído com sucesso");
    await recarregarDados();
    fecharModal();
  };


  if (loading) return <LoadingComponent />;
  if (erro) return <ErroComponent erro={erro} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-8">
      <div className="container mx-auto px-6">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-2">
          <div className="flex items-center mb-4 lg:mb-0">
            <button
              onClick={() => navigate("/admin")}
              className="bg-black/40 backdrop-blur-lg p-3 rounded-xl border border-green-400/30 hover:border-green-400/60 transition-all mr-4"
            >
              <ArrowLeft className="text-green-400" size={24} />
            </button>

            <div>
              <h1 className="text-3xl font-black text-white mb-2">
                Hall da Fama
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400"></div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={abrirModalCriacao}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center"
            >
              <PlusCircle className="mr-2" size={20} />
              Adicionar Campeão
            </button>
          </div>
        </div>
        <p className="text-gray-400 text-xl mb-5">
              Controle dos campeoes das edições anteriores
            </p>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={Trophy}
            value={estatisticas.total}
            label="Total de Campeões"
            color="yellow"
          />

          <StatCard
            icon={Award}
            value={estatisticas.nacionais}
            label="Categoria Nacional"
            color="green"
          />

          <StatCard
            icon={Award}
            value={estatisticas.importadas}
            label="Categoria Importada"
            color="yellow"
          />

          <StatCard
            icon={Target}
            value={`${estatisticas.mediaNacional}m`}
            label="Média Nacional"
            color="green"
          />

          <StatCard
            icon={Target}
            value={`${estatisticas.mediaImportada}m`}
            label="Média Importada"
            color="yellow"
          />
        </div>
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Filter className="mr-2 text-yellow-400" size={24} />
              Filtros
            </h3>
            {(filtros.nome || filtros.categoria || filtros.ano || filtros.edicao) && (
              <button
                onClick={limparFiltros}
                className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm font-medium"
              >
                Limpar Filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro Nome */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Nome</label>
              <input
                type="text"
                value={filtros.nome}
                onChange={(e) => atualizarFiltro("nome", e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-green-400 focus:outline-none"
              />
            </div>

            {/* Filtro Categoria */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Categoria</label>
              <select
                value={filtros.categoria}
                onChange={(e) => atualizarFiltro("categoria", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-green-400 focus:outline-none"
              >
                <option value="">Todas</option>
                <option value="nacional">Nacional</option>
                <option value="importada">Importada</option>
              </select>
            </div>

            {/* Filtro Ano */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Ano</label>
              <input
                type="text"
                value={filtros.ano}
                onChange={(e) => atualizarFiltro("ano", e.target.value)}
                placeholder="Ex: 2024"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-green-400 focus:outline-none"
              />
            </div>

            {/* Filtro Edição */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Edição</label>
              <input
                type="text"
                value={filtros.edicao}
                onChange={(e) => atualizarFiltro("edicao", e.target.value)}
                placeholder="Ex: 8ª Edição"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-green-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30 mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
            <span>
              <Trophy className="inline mr-2 text-yellow-400" size={24} />
              Campeões Cadastrados
            </span>
            <span className="text-gray-400 text-sm">
              {campoesPagina.length} de {estatisticas.total}
            </span>
          </h3>

          {campoesPagina.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto text-gray-600 mb-4" size={64} />
              <p className="text-gray-400 text-lg">Nenhum campeão encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campoesPagina.map((campeao, index) => (
                <div
                  key={campeao.id}
                  onClick={() => selecionarCampeao(campeao)}
                  className="bg-gradient-to-r from-green-900/30 to-yellow-900/30 rounded-xl p-4 border border-green-400/20 hover:border-yellow-400/50 transition-all cursor-pointer group"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Número */}
                    <div className="col-span-1 text-center">
                      <div className="bg-yellow-500 text-black font-black w-10 h-10 rounded-full  flex items-center justify-center text-sm">
                        #{(paginaAtual - 1) * itensPorPagina + index + 1}
                      </div>
                    </div>

                    {/* Nome + Categoria */}
                    <div className="col-span-3">
                      <h4 className="text-white font-bold group-hover:text-yellow-400 transition-colors">
                        {campeao.nome}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {campeao.categoriaMoto === "nacional" ? "🇧🇷 Nacional" : "🌎 Importada"}
                      </p>
                    </div>

                    {/* Resultado */}
                    <div className="col-span-2 text-center">
                      <div className="bg-green-600/30 rounded-lg px-3 py-1 inline-block">
                        <span className="text-green-400 font-bold text-lg">
                          {campeao.resultadoAltura}m
                        </span>
                      </div>
                    </div>

                    {/* Moto */}
                    <div className="col-span-2">
                      <p className="text-gray-300 text-sm">{campeao.modeloMoto}</p>
                    </div>

                    {/* Edição */}
                    <div className="col-span-2">
                      <p className="text-yellow-400 font-semibold">{campeao.edicao}</p>
                      <p className="text-gray-400 text-xs">{campeao.ano}</p>
                    </div>

                    {/* Local */}
                    <div className="col-span-2">
                      <p className="text-gray-300 text-sm">
                        {campeao.cidade}/{campeao.estado}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              {/* Info */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <select
                  value={itensPorPagina}
                  onChange={(e) => alterarItensPorPagina(Number(e.target.value))}
                  className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-green-400 focus:outline-none"
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>

              {/* Botões */}
              <div className="flex space-x-3">
                <button
                  onClick={() => irParaPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    paginaAtual === 1
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => irParaPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
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
        
        <ModalCampeao
          campeao={campeaoSelecionado}
          isOpen={modalAberto}
          onClose={fecharModal}
          onSuccess={handleEditarSuccess}
          onDelete={handleExcluirSuccess}
          editarCampeao={editarCampeao}
          excluirCampeao={excluirCampeao}
          operacaoLoading={operacaoLoading}
        />

        <ModalCriarCampeao
          isOpen={modalCriarAberto}
          onClose={fecharModal}
          onSuccess={handleCriarSuccess}
          operacaoLoading={operacaoLoading}
        />
      </div>
    </div>
  );
};

export default AdminCampeoes;