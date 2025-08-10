// frontend/src/componentes/Cadastro/DadosMoto.jsx
import React from "react";
import { Bike } from "lucide-react";
import { InputTexto, SeletorCategoriaMoto } from "../form";

const StepDadosMoto = ({ formData, atualizarFormData, CategoriaMoto }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        <Bike className="inline mr-3" size={32} />
        Sua Moto
      </h2>

      <InputTexto
        label="Modelo da Moto"
        value={formData.modeloMoto}
        onChange={(valor) => atualizarFormData({ modeloMoto: valor })}
        placeholder="Ex: Honda Bros 160, KTM 350 EXC-F, Yamaha Lander"
        required
      />

      <SeletorCategoriaMoto
        value={formData.categoriaMoto}
        onChange={(categoria) =>
          atualizarFormData({ categoriaMoto: categoria })
        }
        size="large"
      />
    </div>
  );
};

export default StepDadosMoto;
