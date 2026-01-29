import React from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  User,
  MapPin,
} from "lucide-react";
import LoadingComponent from "../Loading";
import ErroComponent from "../Erro";
import ExpandToggleButton from "../ExpandToggleButton";
import { useEntregasCamisas } from "../../hooks/useEntregasCamisas";

/**
 * 📦 Componente de Entregas de Camisetas
 */
const TabelaCamisasReservadas = () => {
 
  const {
    // Dados
    participantesFiltrados,

    // Estados
    loading,
    erro,
    expandido,
    filtroNome,
    loadingButtons,

    // Estatísticas
    estatisticas,

    // Funções de UI
    setExpandido,
    setFiltroNome,

    // Funções de API
    carregarDados,
    toggleEntrega,

    // Constantes
    TipoCamiseta,
  } = useEntregasCamisas();

  // ========================================
  // COMPONENTES INTERNOS (APENAS UI)
  // ========================================

  const BotaoEntregaPrincipal = ({ participante }) => {
    const camisetaPrincipal = participante.camisetas?.find(
      (c) => c.isPrincipal
    );

    if (!camisetaPrincipal) return null;

    const buttonKey = `${participante.id}-${camisetaPrincipal.id}`;
    const isLoading = loadingButtons[buttonKey];
    const entregue = camisetaPrincipal.entregue;

    const handleClick = () => {
      toggleEntrega(participante.id, camisetaPrincipal.id); 
    };

    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
          isLoading
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : entregue
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-yellow-600 hover:bg-yellow-700 text-white"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin inline-block w-3 h-3 mr-1" />
            Processando...
          </>
        ) : (
          <>
            {camisetaPrincipal.tamanho} - {TipoCamiseta[camisetaPrincipal.tipo]}
          </>
        )}
      </button>
    );
  };

  const BotaoEntregaExtra = ({ participante, camisetaExtra }) => {
    const buttonKey = `${participante.id}-${camisetaExtra.id}`;
    const isLoading = loadingButtons[buttonKey];
    const entregue = camisetaExtra.entregue;

    const handleClick = () => {
      toggleEntrega(participante.id, camisetaExtra.id);
    };

    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
          isLoading
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : entregue
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-yellow-600 hover:bg-yellow-700 text-white"
        }`}
      >
        {isLoading ? (
          <Loader2 className="animate-spin inline-block w-3 h-3 mr-1" />
        ) : (
          <>
            {camisetaExtra.tamanho} - {TipoCamiseta[camisetaExtra.tipo]}
          </>
        )}
      </button>
    );
  };

  if (loading) {
    return <LoadingComponent loading="Carregando entregas de camisetas..." />;
  }

  if (erro) {
    return (
      <ErroComponent erro={erro} onTentarNovamente={carregarDados} />
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 mb-8">
      {/* ========== HEADER ========== */}
      <div className=" mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            Controle de Entregas
          </h2>
          <ExpandToggleButton
            isExpanded={expandido}
            onToggle={() => setExpandido(!expandido)}
            expandedText="Ocultar"
            collapsedText="Mostrar"
            label="Detalhes das Entregas"
            variant="yellow"
            size="medium"
          />
        </div>
      </div>

      {/* ========== ESTATÍSTICAS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Reservadas</p>
          <p className="text-white text-2xl font-bold">
            {estatisticas.totalReservadas}
          </p>
        </div>
        <div className="bg-black/50 p-4 rounded-lg border border-green-700">
          <p className="text-gray-400 text-sm mb-1">Entregues</p>
          <p className="text-white text-2xl font-bold">
            {estatisticas.totalEntregues}
          </p>
        </div>
        <div className="bg-black/50 p-4 rounded-lg border border-yellow-700">
          <p className="text-gray-400 text-sm mb-1">Para Entrega</p>
          <p className="text-white text-2xl font-bold">
            {estatisticas.paraEntrega}
          </p>
        </div>
        <div className="bg-black/50 p-4 rounded-lg border border-blue-700">
          <p className="text-gray-400 text-sm mb-1">Progresso</p>
          <p className="text-white text-2xl font-bold">
            {estatisticas.percentualEntregue}%
          </p>
        </div>
      </div>

      {expandido && (
        <>
          {/* ========== FILTROS ========== */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome ou número de inscrição..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {/* ========== TABELA ========== */}
          {participantesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-400 text-lg">
                {filtroNome.trim()
                  ? "Nenhum participante encontrado"
                  : "Nenhuma camiseta reservada"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-4 px-4 text-gray-300">
                      <User className="inline mr-2" size={16} />
                      Participante
                    </th>
                    <th className="text-left py-4 px-4 text-gray-300">
                      <MapPin className="inline mr-2" size={16} />
                      Localização
                    </th>
                    <th className="text-center py-4 px-4 text-gray-300">
                      Camiseta Principal
                    </th>
                    <th className="text-center py-4 px-4 text-gray-300">
                      Camisetas Extras
                    </th>
                    <th className="text-center py-4 px-4 text-gray-300">
                      Status Geral
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participantesFiltrados.map((participante) => {
                    const camisetas = participante.camisetas || [];
                    const camisetaPrincipal = camisetas.find((c) => c.isPrincipal);
                    const camisetasExtras = camisetas.filter((c) => !c.isPrincipal);

                    const principalEntregue = camisetaPrincipal?.entregue || false;
                    const todasExtrasEntregues =
                      camisetasExtras.length === 0 ||
                      camisetasExtras.every((c) => c.entregue);
                    const todasEntregues =
                      principalEntregue && todasExtrasEntregues;

                    return (
                      <tr
                        key={participante.id}
                        className="border-b border-gray-700 hover:bg-gray-800/30"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">
                              {participante.nome}
                            </p>
                            <p className="text-gray-400 text-sm">
                              #{participante.numeroInscricao}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {participante.cidade}, {participante.estado}
                        </td>
                        <td className="text-center py-4 px-4">
                          <div className="flex flex-col items-center gap-2">
                            <BotaoEntregaPrincipal participante={participante} />
                            <span
                              className={`text-xs font-bold ${
                                principalEntregue
                                  ? "text-green-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              {principalEntregue ? "ENTREGUE" : "PENDENTE"}
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          {camisetasExtras.length === 0 ? (
                            <span className="text-gray-500 text-sm">
                              Sem extras
                            </span>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              {camisetasExtras.map((extra) => (
                                <div
                                  key={extra.id}
                                  className="flex items-center gap-2"
                                >
                                  <BotaoEntregaExtra
                                    participante={participante}
                                    camisetaExtra={extra}
                                  />
                                  <span
                                    className={`text-xs font-bold ${
                                      extra.entregue
                                        ? "text-green-400"
                                        : "text-yellow-400"
                                    }`}
                                  >
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="text-center py-4 px-4">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`px-3 py-1 rounded text-xs font-bold ${
                                todasEntregues
                                  ? "bg-green-500 text-white"
                                  : "bg-orange-500 text-white"
                              }`}
                            >
                              {todasEntregues ? " COMPLETO" : " PENDENTE"}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {camisetas.length} camiseta
                              {camisetas.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TabelaCamisasReservadas;