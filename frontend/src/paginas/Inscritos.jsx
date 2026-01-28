import React from "react";
import {
  Users,
  Search,
  Filter,
  MapPin,
  Bike,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

// Componentes
import ErroComponent from "../componentes/Erro";
import LoadingComponent from "../componentes/Loading";

import useInscritos from "../hooks/useInscritos";

const Inscritos = () => {

  const {
    // Estados
    participantesFiltrados,
    participantesPagina,
    loading,
    erro,

    // Filtros
    filtros,
    mostrarFiltros,
    atualizarFiltro,
    limparFiltros,

    // Paginação
    paginaAtual,
    totalPaginas,
    indiceInicio,
    irParaPagina,

    // Funções
    carregarParticipantes,
  } = useInscritos();


  if (loading) {
    return <LoadingComponent loading="Carregando participantes..." />;
  }

  if (erro) {
    return (
      <ErroComponent erro={erro} onTentarNovamente={carregarParticipantes} />
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        
        {/* ========== HEADER ========== */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            <Users className="inline mr-4" size={48} />
            LISTA DE <span className="text-yellow-400">INSCRITOS</span>
          </h1>
          <p className="text-gray-400 text-xl">
            Veja quem vai participar da maior aventura off-road da Serra da
            Mantiqueira
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        {/* ========== FILTROS ========== */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30">
            
            {/* Cabeçalho dos Filtros */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Filter className="text-yellow-400 mr-3" size={24} />
                <h3 className="text-xl font-bold text-white">
                  Filtros de Busca
                </h3>
              </div>
            </div>

            {/* Formulário de Filtros */}
            {mostrarFiltros && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                
                  <div>
                    <label className="block text-gray-300 text-sm mb-2 font-semibold">
                      <Search className="inline mr-2" size={16} />
                      Nome ou Número de Inscrição
                    </label>
                    <input
                      type="text"
                      value={filtros.nome}
                      onChange={(e) => atualizarFiltro("nome", e.target.value)}
                      placeholder="Digite o nome..."
                      className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-green-400 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2 font-semibold">
                      <MapPin className="inline mr-2" size={16} />
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={filtros.cidade}
                      onChange={(e) => atualizarFiltro("cidade", e.target.value)}
                      placeholder="Digite a cidade..."
                      className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-green-400 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2 font-semibold">
                      <Bike className="inline mr-2" size={16} />
                      Categoria da Moto
                    </label>
                    <select
                      value={filtros.categoriaMoto}
                      onChange={(e) =>
                        atualizarFiltro("categoriaMoto", e.target.value)
                      }
                      className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none transition-all"
                    >
                      <option value="todos">Todas as Categorias</option>
                      <option value="nacional">🇧🇷 Nacional</option>
                      <option value="importada">🌍 Importada</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={limparFiltros}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-xl transition-all"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========== LISTA DE PARTICIPANTES ========== */}
        <div className="max-w-6xl mx-auto">
          
          {participantesFiltrados.length === 0 ? (
            <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-12 border border-gray-600/30 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-2xl font-bold text-white mb-2">
                Nenhum participante encontrado
              </h3>
              <p className="text-gray-400">
                Tente ajustar os filtros ou aguarde novas inscrições.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cards de Participantes */}
              {participantesPagina.map((participante, index) => (
                <div
                  key={participante.id}
                  className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 hover:border-green-400/60 transition-all hover:scale-102"
                >
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    
                    <div>
                      <div className="flex items-center">
                        <div className="bg-yellow-500 text-black font-black w-10 h-10 rounded-full flex items-center justify-center text-sm mr-4">
                          #{indiceInicio + index + 1}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">
                            {participante.nome}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {participante.numeroInscricao}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400 flex items-center mb-1">
                        <MapPin className="mr-2 text-yellow-400" size={16} />
                        {participante.cidade} - {participante.estado}
                      </p>
                      <p className="text-white font-semibold">
                        {participante.modeloMoto}
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold border-2 ${
                          participante.categoriaMoto === "nacional"
                            ? "bg-green-900/50 text-green-400 border-green-400/50"
                            : "bg-yellow-900/50 text-yellow-400 border-yellow-400/50"
                        }`}
                      >
                        <Bike className="mr-2" size={14} />
                        {participante.categoriaMoto === "nacional"
                          ? "🇧🇷 Nacional"
                          : "🌍 Importada"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========== PAGINAÇÃO ========== */}
          {totalPaginas > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              
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

              {/* Números de Página */}
              <div className="flex space-x-1">
                {[...Array(totalPaginas)].map((_, i) => {
                  const pagina = i + 1;
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Inscritos;