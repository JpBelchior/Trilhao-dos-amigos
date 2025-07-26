// src/componentes/cadastro/StepCamisetas.jsx
import React from "react";
import {
  Shirt,
  AlertCircle,
  Gift,
  MedalIcon,
  BadgeDollarSign,
} from "lucide-react";

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
          Camiseta Grátis (incluída na inscrição)
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
              <option value={TipoCamiseta.MANGA_CURTA}>
                Manga Curta -{" "}
                {verificarDisponibilidade(
                  formData.tamanhoCamiseta,
                  TipoCamiseta.MANGA_CURTA
                )}{" "}
                disponíveis
              </option>
              <option value={TipoCamiseta.MANGA_LONGA}>
                Manga Longa -{" "}
                {verificarDisponibilidade(
                  formData.tamanhoCamiseta,
                  TipoCamiseta.MANGA_LONGA
                )}{" "}
                disponíveis
              </option>
            </select>
          </div>
        </div>

        {verificarDisponibilidade(
          formData.tamanhoCamiseta,
          formData.tipoCamiseta
        ) <= 0 && (
          <div className="bg-red-900/50 border border-red-400 rounded-xl p-4">
            <AlertCircle className="inline mr-2 mb-1 text-red-400" size={20} />
            <span className="text-red-300">
              Esta camiseta não está disponível no estoque!
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

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 mb-2">Tamanho</label>
            <select
              value={camisetaExtra.tamanho}
              onChange={(e) =>
                setCamisetaExtra({ ...camisetaExtra, tamanho: e.target.value })
              }
              className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
            >
              {Object.values(TamanhoCamiseta).map((tamanho) => (
                <option key={tamanho} value={tamanho}>
                  {tamanho}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Tipo</label>
            <select
              value={camisetaExtra.tipo}
              onChange={(e) =>
                setCamisetaExtra({ ...camisetaExtra, tipo: e.target.value })
              }
              className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
            >
              <option value={TipoCamiseta.MANGA_CURTA}>Manga Curta</option>
              <option value={TipoCamiseta.MANGA_LONGA}>Manga Longa</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={adicionarCamisetaExtra}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-xl transition-all"
            >
              Adicionar
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Disponível:{" "}
          {verificarDisponibilidade(camisetaExtra.tamanho, camisetaExtra.tipo)}{" "}
          unidades
        </p>

        {/* Lista de Extras Adicionadas */}
        {formData.camisetasExtras.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-white">
              Camisetas extras selecionadas:
            </h4>
            {formData.camisetasExtras.map((extra, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-black/40 rounded-xl p-3"
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

      {/* Observações */}
      <div>
        <label className="block text-gray-300 mb-2">
          Observações (opcional)
        </label>
        <textarea
          value={formData.observacoes}
          onChange={(e) => atualizarFormData({ observacoes: e.target.value })}
          className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
          rows="3"
          placeholder="Alguma observação especial..."
        />
      </div>
    </div>
  );
};

export default StepCamisetas;
