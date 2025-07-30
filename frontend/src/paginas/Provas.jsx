// frontend/src/paginas/Provas.jsx
import React from "react";
import ProvasSection from "../componentes/paginaPrincipal/ProvasSection";

const Provas = () => {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Cabeçalho da Página */}
      <div className="pt-32 pb-16 bg-gradient-to-br from-green-900/30 to-black">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            PROVAS & <span className="text-yellow-400">TRAJETOS</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Conheça os desafios que esperam por você: a trilha e o Morro do
            Desafio
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>
      </div>

      {/* Seção das Provas - Trilha e Morro do Desafio */}
      <ProvasSection />
    </div>
  );
};

export default Provas;
