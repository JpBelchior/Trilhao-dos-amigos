// frontend/src/paginas/EdicoesAnteriores.jsx
import React from "react";
import GallerySection from "../componentes/paginaPrincipal/GallerySection";
import HallFamaSection from "../componentes/paginaPrincipal/HallFamaSection";

const EdicoesAnteriores = () => {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Cabeçalho da Página */}
      <div className="pt-32 pb-16 bg-gradient-to-br from-green-900/30 to-black">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            EDIÇÕES <span className="text-yellow-400">ANTERIORES</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Relembre os momentos e veja a evolução do Trilhão ao longo dos anos
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
      {/* Gallery Section - Fotos das edições anteriores */}
      <GallerySection />

      {/* Divisor */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-8"></div>

      {/* Hall da Fama - Campeões históricos */}
      <HallFamaSection />
    </div>
  );
};

export default EdicoesAnteriores;
