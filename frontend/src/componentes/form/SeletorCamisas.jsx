import React from "react";
import { Shirt, Plus, Trash2 } from "lucide-react";

/**
 * Painel reutilizável de seleção de camisas.
 * Usado em: ComprarCamisa e cadastro (StepCamisetas).
 */
const SeletorCamisas = ({
  camisas,
  camisaSelecionada,
  setCamisaSelecionada,
  adicionarCamisa,
  removerCamisa,
  getDisponibilidade,
  TamanhoCamiseta,
  TipoCamiseta,
  precoCamisa = 50,
}) => {
  const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const tamanhos = Object.values(TamanhoCamiseta);
  const dispSelecionada =
    camisaSelecionada.tamanho && camisaSelecionada.tipo
      ? getDisponibilidade(camisaSelecionada.tamanho, camisaSelecionada.tipo)
      : null;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Tipo */}
        <div>
          <label className="block text-white font-semibold mb-2">Tipo</label>
          <select
            value={camisaSelecionada.tipo}
            onChange={(e) =>
              setCamisaSelecionada((prev) => ({ ...prev, tipo: e.target.value }))
            }
            className="w-full bg-black/50 border border-yellow-400/50 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
          >
            {Object.values(TipoCamiseta).map((tipo) => {
              const disponivel = getDisponibilidade(camisaSelecionada.tamanho, tipo);
              return (
                <option
                  key={tipo}
                  value={tipo}
                  disabled={!!camisaSelecionada.tamanho && disponivel <= 0}
                >
                  {tipo === "manga_curta" ? "Manga Curta" : "Manga Longa"}
                  {camisaSelecionada.tamanho
                    ? ` - ${disponivel} disponíveis${disponivel <= 0 ? " (ESGOTADO)" : ""}`
                    : ""}
                </option>
              );
            })}
          </select>
        </div>

        {/* Tamanho */}
        <div>
          <label className="block text-white font-semibold mb-2">Tamanho</label>
          <select
            value={camisaSelecionada.tamanho}
            onChange={(e) =>
              setCamisaSelecionada((prev) => ({ ...prev, tamanho: e.target.value }))
            }
            className="w-full bg-black/50 border border-yellow-400/50 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
          >
            <option value="">Selecione o tamanho</option>
            {tamanhos.map((tam) => {
              const disponivel = getDisponibilidade(tam, camisaSelecionada.tipo);
              return (
                <option key={tam} value={tam} disabled={disponivel <= 0}>
                  {tam} - {disponivel} disponíveis{disponivel <= 0 ? " (ESGOTADO)" : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Aviso de estoque baixo */}
      {dispSelecionada !== null && dispSelecionada > 0 && dispSelecionada <= 3 && (
        <p className="text-orange-400 text-xs">
          Atenção: apenas {dispSelecionada} unidade{dispSelecionada !== 1 ? "s" : ""} disponível{dispSelecionada !== 1 ? "s" : ""}!
        </p>
      )}

      {/* Botão adicionar */}
      <button
        onClick={adicionarCamisa}
        disabled={!camisaSelecionada.tamanho || dispSelecionada <= 0}
        className={`w-full py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center ${
          camisaSelecionada.tamanho && dispSelecionada > 0
            ? "bg-yellow-500 hover:bg-yellow-600 text-black"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }`}
      >
        <Plus className="mr-2" size={20} />
        Adicionar Camisa (+{fmt(precoCamisa)})
      </button>

      {/* Lista de camisas adicionadas */}
      {camisas.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-yellow-400 flex items-center">
            <Shirt className="mr-2" size={18} />
            Camisas Selecionadas ({camisas.length})
          </h4>
          {camisas.map((camisa, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-black/40 rounded-xl p-4 border border-yellow-400/30 hover:border-yellow-400/50 transition-all"
            >
              <div className="flex items-center space-x-3">
                <Shirt className="text-yellow-400" size={20} />
                <div>
                  <span className="text-white font-semibold">
                    {camisa.tamanho} —{" "}
                    {camisa.tipo === "manga_curta" ? "Manga Curta" : "Manga Longa"}
                  </span>
                  <div className="text-xs text-gray-400">Item #{index + 1}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-green-400 font-bold">{fmt(precoCamisa)}</span>
                <button
                  onClick={() => removerCamisa(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded-lg transition-all"
                  title="Remover camisa"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* Subtotal */}
          <div className="bg-yellow-900/50 rounded-xl p-4 border border-yellow-400/50">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Subtotal:</span>
              <span className="text-yellow-400 font-bold text-lg">
                {fmt(camisas.length * precoCamisa)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeletorCamisas;
