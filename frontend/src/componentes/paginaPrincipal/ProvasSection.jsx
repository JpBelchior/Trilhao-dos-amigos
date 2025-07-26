// src/componentes/paginaPrincipal/ProvasSection.jsx
import React from "react";
import {
  MapPin,
  Bike,
  Mountain,
  Clock,
  Trophy,
  Target,
  Star,
  Zap,
  PointerIcon,
} from "lucide-react";
import TrilhaoMap from "./mapa";

const ProvasSection = () => {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        {/* Mapa Moderno */}
        <div className="mb-20">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-green-900/50 to-black/50 backdrop-blur-lg rounded-3xl p-8 border border-green-400/20">
              <h3 className="text-3xl font-black text-center text-white mb-6">
                <MapPin className="inline mr-3 text-yellow-400" size={32} />
                MAPA DO TRAJETO
              </h3>
              <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-yellow-400/30">
                <TrilhaoMap />
              </div>
              <p className="text-center text-gray-400 mt-6 text-lg">
                <PointerIcon
                  className="inline mr-2 text-yellow-400"
                  size={20}
                />
                Clique nos marcadores para explorar cada ponto da aventura
              </p>
            </div>
          </div>
        </div>

        {/* Cards das Provas Modernos */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Prova 1 - Trilha */}
          <div className="group bg-gradient-to-r from-green-900/40 to-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 hover:border-green-400/60 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-2xl p-6 mr-8 transform group-hover:scale-110 transition-all">
                <Bike size={48} />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-3">
                    PROVA 1
                  </span>
                  <span className="text-yellow-400 text-sm font-semibold">
                    10:30H
                  </span>
                </div>
                <h3 className="text-4xl font-black text-white">TRILHA</h3>
                <p className="text-green-400 text-xl font-semibold">
                  25km de Adrenalina
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-4"></div>
                  <span>
                    <strong className="text-green-400">Largada:</strong> Praça
                    da Matriz - Centro
                  </span>
                </div>
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-4"></div>
                  <span>
                    <strong className="text-yellow-400">Chegada:</strong>{" "}
                    Mirante da Pedra do Baú
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                  <Clock className="mr-4 text-green-400" size={20} />
                  <span>
                    <strong className="text-green-400">Distância:</strong> 25km
                    off-road
                  </span>
                </div>
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                  <Mountain className="mr-4 text-yellow-400" size={20} />
                  <span>
                    <strong className="text-yellow-400">Altitude:</strong>{" "}
                    1.847m
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed text-lg bg-black/20 rounded-xl p-6">
              🏔️ Percurso desafiador pela majestosa Serra da Mantiqueira,
              atravessando cachoeiras cristalinas, mata atlântica preservada e
              trechos técnicos que testam cada fibra do piloto. Uma jornada
              épica por terrenos selvagens que separa aventureiros de lendas.
            </p>
          </div>

          {/* Prova 2 - Subida */}
          <div className="group bg-gradient-to-r from-yellow-900/40 to-black/40 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 hover:border-yellow-400/60 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-br from-green-400 to-green-600 text-black rounded-2xl p-6 mr-8 transform group-hover:scale-110 transition-all">
                <Mountain size={48} />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <span className="bg-yellow-600 text-black px-4 py-1 rounded-full text-sm font-bold mr-3">
                    PROVA 2
                  </span>
                  <span className="text-green-400 text-sm font-semibold">
                    15:30H
                  </span>
                </div>
                <h3 className="text-4xl font-black text-white">
                  MORRO DO DESAFIO
                </h3>
                <p className="text-yellow-400 text-xl font-semibold">
                  A Subida Impossível
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                  <Trophy className="mr-4 text-green-400" size={20} />
                  <span>
                    <strong className="text-green-400">Prêmio:</strong> R$
                    1.000,00
                  </span>
                </div>
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                  <Target className="mr-4 text-yellow-400" size={20} />
                  <span>
                    <strong className="text-yellow-400">Objetivo:</strong>{" "}
                    Chegar ao topo
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                  <Zap className="mr-4 text-green-400" size={20} />
                  <span>
                    <strong className="text-green-400">Dificuldade:</strong>{" "}
                    Extrema
                  </span>
                </div>
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                  <Star className="mr-4 text-yellow-400" size={20} />
                  <span>
                    <strong className="text-yellow-400">Observação:</strong>{" "}
                    Ninguém atingiu o topo
                  </span>
                </div>
              </div>
            </div>

            {/* Categorias Modernizadas */}
            <div className="space-y-6">
              <h4 className="font-black text-white text-2xl flex items-center">
                <Trophy className="mr-3 text-yellow-400" size={28} />
                CATEGORIAS DE COMBATE
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 p-6 rounded-2xl border border-green-400/30 hover:border-green-400/60 transition-all">
                  <strong className="text-green-300 text-xl flex items-center mb-3">
                    MOTOS NACIONAIS
                  </strong>
                  <p className="text-gray-200">
                    Bros, Lander, Crosser, XTZ e os guerreiros brasileiros
                  </p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/30 to-yellow-600 p-6 rounded-2xl border border-yellow-400/30 hover:border-yellow-200/60 transition-all">
                  <strong className="text-yellow-300 text-xl flex items-center mb-3">
                    MOTOS IMPORTADAS
                  </strong>
                  <p className="text-gray-200">
                    Honda, Yamaha, KTM, Husqvarna e outras máquinas de guerra
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProvasSection;
