import React from "react";
import { Shirt, AlertCircle, Gift } from "lucide-react";
import { InputTextarea, SeletorCamisas } from "../form";

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

        <SeletorCamisas
          camisas={formData.camisetasExtras}
          camisaSelecionada={camisetaExtra}
          setCamisaSelecionada={setCamisetaExtra}
          adicionarCamisa={adicionarCamisetaExtra}
          removerCamisa={removerCamisetaExtra}
          getDisponibilidade={verificarDisponibilidade}
          TamanhoCamiseta={TamanhoCamiseta}
          TipoCamiseta={TipoCamiseta}
        />
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