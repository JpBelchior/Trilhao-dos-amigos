import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Edit3,
  Save,
  X,
  Loader2,
} from "lucide-react";
import LoadingComponent from "../../componentes/Loading";
import ErroComponent from "../../componentes/Erro";
import ExpandToggleButton from "../../componentes/ExpandToggleButton";
import TabelaCamisasReservadas from "../../componentes/Admin/EntrgasCamisas";
import { useEstoque } from "../../hooks/useEstoque";

/**
 * 📦 Página de Gestão de Estoque
 * 
 * Exibe estoque de camisetas com possibilidade de edição
 * e sincronização automática com reservas.
 * 
 * RESPONSABILIDADE: Apenas UI/Renderização
 * LÓGICA: Está no hook useEstoque
 */
const EstoqueAdmin = () => {
  const navigate = useNavigate();

  // ========================================
  // HOOK COM TODA A LÓGICA
  // ========================================
  const {
    // Dados
    resumoEstoque,
    estoqueOrdenado,

    // Estados
    loading,
    erro,
    sincronizandoEstoque,
    estoqueExpandido,

    // Estados de edição
    editando,
    novaQuantidade,

    // Funções de UI
    setEstoqueExpandido,
    setNovaQuantidade,

    // Funções de edição
    iniciarEdicao,
    cancelarEdicao,
    salvarAlteracaoEstoque,

    // Funções de API
    carregarDados,
    sincronizarEstoque,

    // Constantes
    TipoCamiseta,
  } = useEstoque();

  // ========================================
  // RENDERIZAÇÃO CONDICIONAL
  // ========================================

  if (loading) {
    return (
      <LoadingComponent
        loading="Carregando dados do estoque..."
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
        onTentarNovamente={carregarDados}
        className="bg-gradient-to-br from-green-900 via-black to-green-900"
      />
    );
  }

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        
        {/* ========== HEADER ========== */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate("/admin")}
                className="mr-4 p-2 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-5xl font-black text-white">
                GESTÃO DE <span className="text-yellow-400">ESTOQUE</span>
              </h1>
            </div>
            <p className="text-gray-400 text-xl">
              Controle do estoque e das entregas
            </p>
          </div>

          <div className="flex gap-4">

            <button
              onClick={sincronizarEstoque}
              disabled={sincronizandoEstoque}
              className={`font-bold py-3 px-6 rounded-xl transition-all flex items-center ${
                sincronizandoEstoque
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
              }`}
            >
              {sincronizandoEstoque ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Package className="mr-2" size={20} />
                  Sincronizar Estoque
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========== RESUMO DO ESTOQUE ========== */}
        <div className="bg-black/30 border border-green-500/30 rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">
              Controle de Estoque
            </h2>
            <ExpandToggleButton
              isExpanded={estoqueExpandido}
              onToggle={() => setEstoqueExpandido(!estoqueExpandido)}
              label="Detalhes do Estoque"
              variant="yellow"
              size="medium"
            />
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-black/50 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Tipos de Camisa
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {resumoEstoque.totalProdutos || 0}
                  </p>
                </div>
                <Package className="text-green-400" size={32} />
              </div>
            </div>

            <div className="bg-black/50 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Camisas disponíveis
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {resumoEstoque.totalDisponiveis || 0}
                  </p>
                </div>
                <ShoppingBag className="text-green-400" size={32} />
              </div>
            </div>

            <div className="bg-black/50 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Total Reservado
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {resumoEstoque.totalReservadas || 0}
                  </p>
                </div>
                <ShoppingBag className="text-yellow-400" size={32} />
              </div>
            </div>
          </div>

          {/* Tabela detalhada (expandível) */}
          {estoqueExpandido && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-4 px-4 text-gray-300">Tipo</th>
                    <th className="text-left py-4 px-4 text-gray-300">Tamanho</th>
                    <th className="text-center py-4 px-4 text-gray-300">Total</th>
                    <th className="text-center py-4 px-4 text-gray-300">Reservado</th>
                    <th className="text-center py-4 px-4 text-gray-300">Disponível</th>
                    <th className="text-center py-4 px-4 text-gray-300">Status</th>
                    <th className="text-center py-4 px-4 text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {estoqueOrdenado.map((item) => (
                    <tr
                      key={`${item.tipo}-${item.tamanho}`}
                      className="border-b border-gray-700 hover:bg-gray-800/30"
                    >
                      {/* Tipo */}
                      <td className="py-4 px-4 text-white font-medium">
                        {TipoCamiseta[item.tipo]}
                      </td>

                      {/* Tamanho */}
                      <td className="py-4 px-4 text-white font-bold">
                        {item.tamanho}
                      </td>

                      {/* Total */}
                      <td className="text-center py-4 px-4">
                        {editando?.tamanho === item.tamanho &&
                        editando?.tipo === item.tipo ? (
                          <input
                            type="number"
                            value={novaQuantidade}
                            onChange={(e) => setNovaQuantidade(e.target.value)}
                            className="w-20 bg-gray-800 text-white text-center py-1 px-2 rounded border border-gray-600"
                            min="0"
                          />
                        ) : (
                          <span className="text-white font-bold">
                            {item.quantidadeTotal}
                          </span>
                        )}
                      </td>

                      {/* Reservadas */}
                      <td className="text-center py-4 px-4 text-red-400 font-bold">
                        {item.quantidadeReservada}
                      </td>

                      {/* Disponíveis */}
                      <td className="text-center py-4 px-4 text-green-400 font-bold">
                        {item.quantidadeDisponivel}
                      </td>

                      {/* Status */}
                      <td className="text-center py-4 px-4">
                        {item.quantidadeDisponivel === 0 ? (
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            ESGOTADO
                          </span>
                        ) : item.quantidadeDisponivel < 5 ? (
                          <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                            BAIXO
                          </span>
                        ) : (
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                            OK
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="text-center py-4 px-4">
                        {editando?.tamanho === item.tamanho &&
                        editando?.tipo === item.tipo ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={salvarAlteracaoEstoque}
                              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={cancelarEdicao}
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              iniciarEdicao(
                                item.tamanho,
                                item.tipo,
                                item.quantidadeTotal
                              )
                            }
                            className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========== TABELA DE ENTREGAS ========== */}
        <TabelaCamisasReservadas />
      </div>
    </div>
  );
};

export default EstoqueAdmin;