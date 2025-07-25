// src/componentes/cadastro/StepDadosMoto.jsx
import React from "react";
import { Bike } from "lucide-react";

const StepDadosMoto = ({ formData, atualizarFormData, CategoriaMoto }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        <Bike className="inline mr-3" size={32} />
        Sua Moto
      </h2>

      <div>
        <label className="block text-gray-300 mb-2">Modelo da Moto *</label>
        <input
          type="text"
          value={formData.modeloMoto}
          onChange={(e) => atualizarFormData({ modeloMoto: e.target.value })}
          className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
          placeholder="Ex: Honda Bros 160, KTM 350 EXC-F, Yamaha Lander"
        />
      </div>

      <div>
        <label className="block text-gray-300 mb-4">Categoria da Moto *</label>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() =>
              atualizarFormData({ categoriaMoto: CategoriaMoto.NACIONAL })
            }
            className={`p-6 rounded-2xl border-2 transition-all ${
              formData.categoriaMoto === CategoriaMoto.NACIONAL
                ? "border-green-400 bg-green-900/30"
                : "border-gray-600 bg-black/30 hover:border-gray-400"
            }`}
          >
            <h3 className="text-xl font-bold text-green-400 mb-2">
              🇧🇷 NACIONAL
            </h3>
            <p className="text-gray-300 text-sm">
              Bros, Lander, Crosser, XTZ, XR, NX, XT, CG, Titan
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              atualizarFormData({ categoriaMoto: CategoriaMoto.IMPORTADA })
            }
            className={`p-6 rounded-2xl border-2 transition-all ${
              formData.categoriaMoto === CategoriaMoto.IMPORTADA
                ? "border-yellow-400 bg-yellow-900/30"
                : "border-gray-600 bg-black/30 hover:border-gray-400"
            }`}
          >
            <h3 className="text-xl font-bold text-yellow-400 mb-2">
              🌍 IMPORTADA
            </h3>
            <p className="text-gray-300 text-sm">
              KTM, Husqvarna, Honda CRF, Yamaha WR, Kawasaki KLX
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepDadosMoto;
