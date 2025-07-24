// src/componentes/paginaPrincipal/HeroSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Flashlight, Signpost, Trophy, Zap } from "lucide-react";

const HeroSection = ({ isVisible, scrollY }) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background com Parallax */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black via-green-950 to-black"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      ></div>

      <div
        className={`relative z-20 text-center text-white px-6 max-w-6xl transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h1 className="text-7xl md:text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-white to-green-400 bg-clip-text text-transparent">
          TRILHÃO DOS AMIGOS
        </h1>

        <div className="flex items-center justify-center mb-8">
          <div className="h-1 w-20 bg-gradient-to-r from-transparent to-yellow-400"></div>
          <h2 className="text-2xl md:text-4xl font-light mx-6 tracking-widest">
            SERRA DA MANTIQUEIRA
          </h2>
          <div className="h-1 w-20 bg-gradient-to-l from-transparent to-green-400"></div>
        </div>

        {/* Stats em Cards Flutuantes */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          <div className="bg-black/40 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-4">
            <div className="text-3xl font-black text-yellow-400">43KM</div>
            <div className="text-sm text-gray-300">Trilha Off-Road</div>
          </div>
          <div className="bg-black/40 backdrop-blur-lg border border-green-400/30 rounded-2xl p-4">
            <div className="text-3xl font-black text-green-400">9º</div>
            <div className="text-sm text-gray-300">Edição</div>
          </div>
          <div className="bg-black/40 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-4">
            <div className="text-3xl font-black text-yellow-400">R$1K</div>
            <div className="text-sm text-gray-300">Prêmio Máximo</div>
          </div>
        </div>

        {/* Texto Principal Modernizado */}
        <div className="text-xl md:text-2xl mb-10 leading-relaxed space-y-6 max-w-4xl mx-auto">
          <p className="text-yellow-400 font-bold text-2xl">
            VOCÊ TEM CORAGEM DE ENFRENTAR A ESSE DESAFIO?
          </p>
          <p className="text-gray-300">
            40km de trilha pelos montes de Itamonte. Estradas de terra, e
            vegetação que testam sua capacidade de pilotar! Além disso, para os
            mais corajosos, ainda há um desafio:{" "}
            <span className="text-green-400 font-bold">O Morro do Desafio</span>{" "}
            - o qual ninguem alcançou o topo.
          </p>
          <p className="text-yellow-300 font-bold text-xl">
            <Signpost className="inline mr-2" size={24} />8 EDIÇÕES • DEZENAS DE
            PILOTOS • NOVOS DESAFIOS TODO ANO
            <Signpost className="inline ml-2" size={24} />
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
