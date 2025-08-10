// frontend/src/componentes/Cadastro/Camisetas.jsx
import React from "react";
import {
  Shirt,
  AlertCircle,
  Gift,
  MedalIcon,
  BadgeDollarSign,
} from "lucide-react";
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
        Camisetas
      </h2>

      {/* Camiseta Grátis */}
      <div className="bg-green-900/30 rounded-2xl p-6 border border-green-400/30">
        <h3 className="text-xl font-bold text-green-400 mb-4">
          <Gift className="inline mr-2 mb-1" size={20} />
          Camiseta Grátis
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 mb-2">Tamanho</label>
            <select
              value={formData.tamanhoCamiseta}
              onChange={(e) =>
                atualizarFormData({ tamanhoCamiseta: e.target.value })
              }
              className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
            >
              {Object.values(TamanhoCamiseta).map((tamanho) => (
                <option key={tamanho} value={tamanho}>
                  {tamanho} -{" "}
                  {verificarDisponibilidade(tamanho, formData.tipoCamiseta)}{" "}
                  disponíveis
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Tipo</label>
            <select
              value={formData.tipoCamiseta}
              onChange={(e) =>
                atualizarFormData({ tipoCamiseta: e.target.value })
              }
              className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
            >
              {Object.values(TipoCamiseta).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo === "manga_curta" ? "Manga Curta" : "Manga Longa"} -{" "}
                  {verificarDisponibilidade(formData.tamanhoCamiseta, tipo)}{" "}
                  disponíveis
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Alerta se camiseta indisponível */}
        {verificarDisponibilidade(
          formData.tamanhoCamiseta,
          formData.tipoCamiseta
        ) <= 0 && (
          <div className="bg-red-900/30 border border-red-400/50 rounded-xl p-4 flex items-center">
            <AlertCircle className="text-red-400 mr-3" size={20} />
            <span className="text-red-300">
              ⚠️ Esta camiseta não está disponível. Escolha outro tamanho ou
              tipo.
            </span>
          </div>
        )}
      </div>

      {/* Camisetas Extras */}
      <div className="bg-yellow-900/30 rounded-2xl p-6 border border-yellow-400/30">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">
          <BadgeDollarSign className="inline mr-2 mb-1" size={20} />
          Camisetas Extras (R$ 50,00 cada)
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 mb-2">Tamanho</label>
            <select
              value={camisetaExtra.tamanho}
              onChange={(e) =>
                setCamisetaExtra((prev) => ({
                  ...prev,
                  tamanho: e.target.value,
                }))
              }
              className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
            >
              {Object.values(TamanhoCamiseta).map((tamanho) => (
                <option key={tamanho} value={tamanho}>
                  {tamanho} -{" "}
                  {verificarDisponibilidade(tamanho, camisetaExtra.tipo)}{" "}
                  disponíveis
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Tipo</label>
            <select
              value={camisetaExtra.tipo}
              onChange={(e) =>
                setCamisetaExtra((prev) => ({ ...prev, tipo: e.target.value }))
              }
              className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
            >
              {Object.values(TipoCamiseta).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo === "manga_curta" ? "Manga Curta" : "Manga Longa"} -{" "}
                  {verificarDisponibilidade(camisetaExtra.tamanho, tipo)}{" "}
                  disponíveis
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={adicionarCamisetaExtra}
          disabled={
            verificarDisponibilidade(
              camisetaExtra.tamanho,
              camisetaExtra.tipo
            ) <= 0
          }
          className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
            verificarDisponibilidade(
              camisetaExtra.tamanho,
              camisetaExtra.tipo
            ) > 0
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          Adicionar Camiseta
        </button>

        {/* Lista de camisetas extras adicionadas */}
        {formData.camisetasExtras.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-bold text-yellow-400">Camisetas Extras:</h4>
            {formData.camisetasExtras.map((extra, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-black/30 rounded-xl p-3"
              >
                <span className="text-white">
                  {extra.tamanho} -{" "}
                  {extra.tipo === "manga_curta" ? "Manga Curta" : "Manga Longa"}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 font-bold">R$ 50,00</span>
                  <button
                    onClick={() => removerCamisetaExtra(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Observações - USANDO COMPONENTE REUTILIZÁVEL */}
      <InputTextarea
        label="Observações (opcional)"
        value={formData.observacoes}
        onChange={(valor) => atualizarFormData({ observacoes: valor })}
        placeholder="Alguma observação especial..."
        rows={3}
      />
    </div>
  );
};

export default StepCamisetas;
