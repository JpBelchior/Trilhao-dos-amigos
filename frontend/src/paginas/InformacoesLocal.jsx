import React from "react";
import EstruturaSection from "../componentes/paginaPrincipal/EstruturaSection";

const InformacoesLocal = () => {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Cabeçalho da Página */}
      <div className="pt-32 pb-16 bg-gradient-to-br from-green-900/30 to-black">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            INFORMAÇÕES DO <span className="text-yellow-400">LOCAL</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Estrutura completa para você e sua família aproveitarem o Trilhão
            dos Amigos da melhor forma possível!
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>
      </div>

      {/* Seção da Estrutura - Local, alimentação, cronograma */}
      <EstruturaSection />
    </div>
  );
};

export default InformacoesLocal;
