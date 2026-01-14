// frontend/src/componentes/Cadastro/Camisetas.jsx
import React from "react";
import { Shirt, AlertCircle, Gift, Plus, Trash2 } from "lucide-react";
import { InputTextarea } from "../form";

const StepCamisetas = ({
  formData,
  atualizarFormData,
  camisetaExtra,
  setCamisetaExtra,
  verificarDisponibilidade,
  adicionarCamisetaExtra,
  removerCamisetaExtra,
  TamanhoCamiseta,
  TipoCamiseta,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        <Shirt className="inline mr-3 mb-1" size={32} />
        Escolha de Camisetas
      </h2>

      {/* ====================================== */}
      {/* CAMISETA GRÁTIS - INCLUÍDA NA INSCRIÇÃO */}
      {/* ====================================== */}
      <div className="bg-green-900/30 rounded-2xl p-6 border-2 border-green-400/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-green-400 flex items-center">
            <Gift className="mr-2" size={24} />
            Camiseta Grátis
          </h3>
          <span className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold">
            INCLUSA
          </span>
        </div>

        <p className="text-gray-300 mb-4 text-sm">
          Escolha o tamanho e tipo da sua camiseta grátis (já inclusa na inscrição)
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* TAMANHO DA CAMISETA GRÁTIS */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Tamanho <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.tamanhoCamiseta}
              onChange={(e) =>
                atualizarFormData({ tamanhoCamiseta: e.target.value })
              }
              className="w-full bg-black/50 border border-green-400/50 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/30"
            >
              {Object.values(TamanhoCamiseta).map((tamanho) => {
                const disponivel = verificarDisponibilidade(
                  tamanho,
                  formData.tipoCamiseta
                );
                return (
                  <option
                    key={tamanho}
                    value={tamanho}
                    disabled={disponivel <= 0}
                  >
                    {tamanho} - {disponivel} disponíveis
                    {disponivel <= 0 ? " (ESGOTADO)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* TIPO DA CAMISETA GRÁTIS */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Tipo <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.tipoCamiseta}
              onChange={(e) =>
                atualizarFormData({ tipoCamiseta: e.target.value })
              }
              className="w-full bg-black/50 border border-green-400/50 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/30"
            >
              {Object.values(TipoCamiseta).map((tipo) => {
                const disponivel = verificarDisponibilidade(
                  formData.tamanhoCamiseta,
                  tipo
                );
                return (
                  <option key={tipo} value={tipo} disabled={disponivel <= 0}>
                    {tipo === "manga_curta" ? "Manga Curta" : "Manga Longa"} -{" "}
                    {disponivel} disponíveis
                    {disponivel <= 0 ? " (ESGOTADO)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* ALERTA SE CAMISETA GRÁTIS INDISPONÍVEL */}
        {verificarDisponibilidade(
          formData.tamanhoCamiseta,
          formData.tipoCamiseta
        ) <= 0 && (
          <div className="mt-4 bg-red-900/30 border border-red-400/50 rounded-xl p-4 flex items-center">
            <AlertCircle className="text-red-400 mr-3" size={20} />
            <span className="text-red-300">
              ⚠️ Esta combinação não está disponível. Escolha outro tamanho ou
              tipo.
            </span>
          </div>
        )}
      </div>

      {/* ====================================== */}
      {/* CAMISETAS EXTRAS - OPCIONAL */}
      {/* ====================================== */}
      <div className="bg-yellow-900/30 rounded-2xl p-6 border-2 border-yellow-400/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-yellow-400 flex items-center">
            <Shirt className="mr-2" size={24} />
            Camisetas Extras
          </h3>
          <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
            R$ 50,00 cada
          </span>
        </div>

        <p className="text-gray-300 mb-4 text-sm">
          Quer mais camisetas? Adicione quantas quiser (pode repetir tamanho/tipo)
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* TAMANHO DA CAMISETA EXTRA */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Tamanho
            </label>
            <select
              value={camisetaExtra.tamanho}
              onChange={(e) =>
                setCamisetaExtra((prev) => ({
                  ...prev,
                  tamanho: e.target.value,
                }))
              }
              className="w-full bg-black/50 border border-yellow-400/50 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
            >
              {Object.values(TamanhoCamiseta).map((tamanho) => {
                const disponivel = verificarDisponibilidade(
                  tamanho,
                  camisetaExtra.tipo
                );
                return (
                  <option
                    key={tamanho}
                    value={tamanho}
                    disabled={disponivel <= 0}
                  >
                    {tamanho} - {disponivel} disponíveis
                    {disponivel <= 0 ? " (ESGOTADO)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* TIPO DA CAMISETA EXTRA */}
          <div>
            <label className="block text-white font-semibold mb-2">Tipo</label>
            <select
              value={camisetaExtra.tipo}
              onChange={(e) =>
                setCamisetaExtra((prev) => ({ ...prev, tipo: e.target.value }))
              }
              className="w-full bg-black/50 border border-yellow-400/50 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
            >
              {Object.values(TipoCamiseta).map((tipo) => {
                const disponivel = verificarDisponibilidade(
                  camisetaExtra.tamanho,
                  tipo
                );
                return (
                  <option key={tipo} value={tipo} disabled={disponivel <= 0}>
                    {tipo === "manga_curta" ? "Manga Curta" : "Manga Longa"} -{" "}
                    {disponivel} disponíveis
                    {disponivel <= 0 ? " (ESGOTADO)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* BOTÃO ADICIONAR CAMISETA EXTRA */}
        <button
          onClick={adicionarCamisetaExtra}
          disabled={
            verificarDisponibilidade(
              camisetaExtra.tamanho,
              camisetaExtra.tipo
            ) <= 0
          }
          className={`w-full py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center ${
            verificarDisponibilidade(
              camisetaExtra.tamanho,
              camisetaExtra.tipo
            ) > 0
              ? "bg-yellow-500 hover:bg-yellow-600 text-black"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Plus className="mr-2" size={20} />
          Adicionar Camiseta Extra (+R$ 50,00)
        </button>

        {/* LISTA DE CAMISETAS EXTRAS ADICIONADAS */}
        {formData.camisetasExtras.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-bold text-yellow-400 mb-3 flex items-center">
              <Shirt className="mr-2" size={18} />
              Camisetas Extras Selecionadas ({formData.camisetasExtras.length})
            </h4>
            {formData.camisetasExtras.map((extra, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-black/40 rounded-xl p-4 border border-yellow-400/30 hover:border-yellow-400/50 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Shirt className="text-yellow-400" size={20} />
                  <div>
                    <span className="text-white font-semibold">
                      {extra.tamanho} -{" "}
                      {extra.tipo === "manga_curta"
                        ? "Manga Curta"
                        : "Manga Longa"}
                    </span>
                    <div className="text-xs text-gray-400">
                      Item #{index + 1}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-green-400 font-bold">R$ 50,00</span>
                  <button
                    onClick={() => removerCamisetaExtra(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded-lg transition-all"
                    title="Remover camiseta"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {/* TOTAL DE EXTRAS */}
            <div className="mt-4 bg-yellow-900/50 rounded-xl p-4 border border-yellow-400/50">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">
                  Subtotal Extras:
                </span>
                <span className="text-yellow-400 font-bold text-lg">
                  R$ {(formData.camisetasExtras.length * 50.0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OBSERVAÇÕES */}
      <InputTextarea
        label="Observações (opcional)"
        value={formData.observacoes}
        onChange={(valor) => atualizarFormData({ observacoes: valor })}
        placeholder="Alguma observação especial sobre sua inscrição ou camisetas..."
        rows={3}
      />

      {/* RESUMO FINAL */}
      <div className="bg-gradient-to-r from-green-900/40 to-yellow-900/40 rounded-2xl p-6 border-2 border-green-400/50">
        <h4 className="text-lg font-bold text-white mb-3">
          📋 Resumo do Pedido
        </h4>
        <div className="space-y-2 text-gray-300">
          <div className="flex justify-between">
            <span>Inscrição + 1 Camiseta Grátis:</span>
            <span className="font-semibold">R$ 100,00</span>
          </div>
          {formData.camisetasExtras.length > 0 && (
            <div className="flex justify-between">
              <span>
                {formData.camisetasExtras.length} Camiseta
                {formData.camisetasExtras.length > 1 ? "s" : ""} Extra
                {formData.camisetasExtras.length > 1 ? "s" : ""}:
              </span>
              <span className="font-semibold">
                R$ {(formData.camisetasExtras.length * 50.0).toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="flex justify-between text-xl">
              <span className="font-bold text-white">TOTAL:</span>
              <span className="font-bold text-green-400">
                R${" "}
                {(100.0 + formData.camisetasExtras.length * 50.0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepCamisetas;