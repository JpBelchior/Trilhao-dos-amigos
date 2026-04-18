import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PlusCircle,
  Layers,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import useAdminLotes from "../../hooks/useAdminLotes";
import LoadingComponent from "../../componentes/Loading";
import ErroComponent from "../../componentes/Erro";
import ModalLote from "../../componentes/Admin/ModalLote";

// ─── helpers ────────────────────────────────────────────────────────────────

const formatarData = (dataISO) => {
  if (!dataISO) return "-";
  // dataISO vem como "YYYY-MM-DD" do backend
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
};

const formatarPreco = (preco) =>
  Number(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const BadgeStatus = ({ status }) => {
  const cfg = {
    ATIVO:     { icon: CheckCircle, cor: "bg-green-500/20 text-green-400 border-green-500/40" },
    FUTURO:    { icon: Clock,       cor: "bg-blue-500/20  text-blue-400  border-blue-500/40"  },
    ENCERRADO: { icon: XCircle,     cor: "bg-gray-500/20  text-gray-400  border-gray-500/40"  },
  };
  const { icon: Icon, cor } = cfg[status] ?? cfg.ENCERRADO;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${cor}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

// ─── componente principal ────────────────────────────────────────────────────

const AdminLotes = () => {
  const navigate = useNavigate();

  const {
    lotes,
    loteAtivo,
    loading,
    erro,
    operacaoLoading,
    modalAberto,
    loteSelecionado,
    criarLote,
    editarLote,
    excluirLote,
    abrirModalCriacao,
    selecionarLote,
    fecharModal,
    carregarLotes,
  } = useAdminLotes();

  const handleExcluir = async (lote) => {
    if (!window.confirm(`Deseja excluir o Lote ${lote.numero}? Esta ação não pode ser desfeita.`)) return;
    const resultado = await excluirLote(lote.id);
    if (!resultado.sucesso) {
      alert(`Erro ao excluir: ${resultado.erro}`);
    }
  };

  if (loading) return <LoadingComponent loading="Carregando lotes..." />;
  if (erro) return <ErroComponent erro={{ mensagem: erro }} onTentarNovamente={carregarLotes} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-8">
      <div className="container mx-auto px-6">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-2">
          <div className="flex items-center mb-4 lg:mb-0">
            <button
              onClick={() => navigate("/admin")}
              className="bg-black/40 backdrop-blur-lg p-3 rounded-xl border border-green-400/30 hover:border-green-400/60 transition-all mr-4"
            >
              <ArrowLeft className="text-green-400" size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white mb-2">Gestão dos Lotes</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400" />
            </div>
          </div>

          <button
            onClick={abrirModalCriacao}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center"
          >
            <PlusCircle className="mr-2" size={20} />
            Novo Lote
          </button>
        </div>

        <p className="text-gray-400 text-xl mb-8">
          Configure períodos com preços diferenciados para cada lote
        </p>

        {/* ── Card lote ativo ── */}
        {loteAtivo ? (
          <div className="mb-8 bg-green-900/30 border border-green-400/40 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-xl">
                <CheckCircle className="text-green-400" size={28} />
              </div>
              <div>
                <p className="text-green-400 text-sm font-semibold uppercase tracking-wider">Lote Ativo Agora</p>
                <h2 className="text-white text-2xl font-black">Lote {loteAtivo.numero}</h2>
                <p className="text-gray-400 text-sm">
                  {formatarData(loteAtivo.dataInicio)} até {formatarData(loteAtivo.dataFim)}
                </p>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Inscrição</p>
                <p className="text-yellow-400 text-2xl font-black">{formatarPreco(loteAtivo.precoInscricao)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Camisa</p>
                <p className="text-yellow-400 text-2xl font-black">{formatarPreco(loteAtivo.precoCamisa)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-yellow-900/20 border border-yellow-500/40 rounded-2xl p-5 flex items-center gap-4">
            <XCircle className="text-yellow-400 flex-shrink-0" size={24} />
            <p className="text-yellow-300 font-semibold">
              Nenhum lote ativo no momento. As inscrições usarão os preços padrão (R$&nbsp;100,00 / R$&nbsp;50,00).
            </p>
          </div>
        )}

        {/* ── Tabela ── */}
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl border border-green-400/30 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-green-400/20">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Layers className="mr-2 text-yellow-400" size={22} />
              Todos os Lotes
            </h3>
            <span className="text-gray-400 text-sm">{lotes.length} lote(s)</span>
          </div>

          {lotes.length === 0 ? (
            <div className="text-center py-16">
              <Layers className="mx-auto text-gray-600 mb-4" size={56} />
              <p className="text-gray-400 text-lg mb-2">Nenhum lote cadastrado</p>
              <p className="text-gray-500 text-sm mb-6">
                Crie o primeiro lote para definir preços por período
              </p>
              <button
                onClick={abrirModalCriacao}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto"
              >
                <PlusCircle size={18} />
                Criar Primeiro Lote
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-green-400/20">
                    <th className="text-left py-4 px-6 text-gray-400 text-sm font-semibold">Nº</th>
                    <th className="text-left py-4 px-6 text-gray-400 text-sm font-semibold">Período</th>
                    <th className="text-left py-4 px-6 text-gray-400 text-sm font-semibold">Inscrição</th>
                    <th className="text-left py-4 px-6 text-gray-400 text-sm font-semibold">Camisa</th>
                    <th className="text-center py-4 px-6 text-gray-400 text-sm font-semibold">Status</th>
                    <th className="text-center py-4 px-6 text-gray-400 text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.map((lote) => (
                    <tr
                      key={lote.id}
                      className="border-b border-green-400/10 hover:bg-green-900/10 transition-colors"
                    >
                      {/* Número */}
                      <td className="py-4 px-6">
                        <span className="bg-yellow-500 text-black font-black text-sm px-3 py-1 rounded-full">
                          {lote.numero}
                        </span>
                      </td>

                      {/* Período */}
                      <td className="py-4 px-6">
                        <p className="text-white text-sm">{formatarData(lote.dataInicio)}</p>
                        <p className="text-gray-500 text-xs">até {formatarData(lote.dataFim)}</p>
                      </td>

                      {/* Preço Inscrição */}
                      <td className="py-4 px-6">
                        <span className="text-green-400 font-bold">
                          {formatarPreco(lote.precoInscricao)}
                        </span>
                      </td>

                      {/* Preço Camisa */}
                      <td className="py-4 px-6">
                        <span className="text-green-400 font-bold">
                          {formatarPreco(lote.precoCamisa)}
                        </span>
                      </td>

                      {/* Status — vem do backend */}
                      <td className="py-4 px-6 text-center">
                        <BadgeStatus status={lote.status} />
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => selecionarLote(lote)}
                            disabled={operacaoLoading}
                            className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-colors disabled:opacity-50"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleExcluir(lote)}
                            disabled={operacaoLoading}
                            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors disabled:opacity-50"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal criar / editar ── */}
      <ModalLote
        isOpen={modalAberto}
        lote={loteSelecionado}
        onClose={fecharModal}
        criarLote={criarLote}
        editarLote={editarLote}
        operacaoLoading={operacaoLoading}
      />
    </div>
  );
};

export default AdminLotes;
