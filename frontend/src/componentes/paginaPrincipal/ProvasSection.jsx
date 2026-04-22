import React from "react";
import {
  MapPin,
  Bike,
  Mountain,
  Clock,
  Trophy,
  Target,
  Pin,
  ArrowUpRight,
  PointerIcon,
  Flag,
  MoveHorizontal,
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
              <h3 className="text-3xl font-black text-center text-white mb-2">
                <MapPin className="inline mr-3 text-yellow-400" size={32} />
                PRÉVIA DO TRAJETO
              </h3>
              <p className="text-center text-gray-400 mb-6">
                O mapa está incompleto — mostramos só um pedacinho.
                O resto você descobre chegando lá e vivendo esse dia!
              </p>
              <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-yellow-400/30">
                <TrilhaoMap />
              </div>
              <p className="text-center text-gray-500 mt-6 text-sm italic">
                <PointerIcon
                  className="inline mr-2 text-yellow-400"
                  size={16}
                />
                Clique nos marcadores para ver os pontos que revelamos
              </p>
            </div>
          </div>
        </div>

        {/* Cards das Provas Modernos */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Prova 1 - Trilha */}
          <div className="group bg-gradient-to-r from-green-900/40 to-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 hover:border-green-400/60 transition-all transform hover:scale-105 ">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-2xl p-6 mr-8 transform group-hover:scale-110 transition-all">
                <Bike size={48} />
              </div>
                <div>
                <div className="flex items-center mb-2">
                  <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold mr-3">
                    PROVA 1
                  </span>
                  <span className="text-yellow-400 text-sm font-semibold">
                    9:30H
                  </span>
                </div>
                <h3 className="text-4xl font-black text-white">
                  TRILHÃO
                </h3>
                <p className="text-yellow-400 text-xl font-semibold">
                 50 Km de Adrenalina
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                   <div ><Flag className="mr-4 text-yellow-400" size={20} /></div>
                  <span>
                    <strong className="text-yellow-400">Largada:</strong> Centro Comunitário
                  </span>
                </div>
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                  <div ><Clock className="mr-4 text-yellow-400" size={20} /></div>
                  <span>
                    <strong className="text-yellow-400">Tempo:</strong>{" "}
                   5H de Trilha
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                 <MoveHorizontal className="mr-4 text-yellow-400" size={20} />
                  <span>
                    <strong className="text-yellow-400">Distancia:</strong> 50 Km Off Road
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
            <div className="space-y-6">
              <h4 className=" font-semibold text-gray-200 text-xl flex items-center">
               DESCRIÇÃO:
              </h4>
            <p className="text-gray-300 leading-relaxed text-lg bg-black/20 rounded-xl p-6">
              Percurso desafiador pela Serra da Mantiqueira,
              atravessando cachoeiras , muita mata e
              trechos estreitos e com muito barro que testam cada fibra do piloto. Uma jornada
              por terrenos traçoeiros que separa aventureiros de lendas.
            </p>
            </div>
          </div>

          {/* Prova 2 - Subida */}
          <div className="group bg-gradient-to-r from-green-900/40 to-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 hover:border-green-400/60 transition-all transform hover:scale-105 ">
            <div className="flex items-center mb-8">
               <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-2xl p-6 mr-8 transform group-hover:scale-110 transition-all">
                <Mountain size={48} />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold mr-3">
                    PROVA 2
                  </span>
                  <span className="text-yellow-400 text-sm font-semibold">
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
                  <Trophy className="mr-4 text-yellow-400" size={20} />
                  <span>
                    <strong className="text-yellow-400">Prêmio:</strong> R$
                    1.500,00
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
                  <ArrowUpRight className="mr-4 text-yellow-400" size={20} />
                  <span>
                    <strong className="text-yellow-400">Altura:</strong>{" "}
                    300 m
                  </span>
                </div>
                <div className="flex items-center text-white bg-black/30 rounded-xl p-4">
                  <Pin className="mr-4 text-yellow-400" size={20} />
                  <span>
                    <strong className="text-yellow-400">Observação:</strong>{" "}
                    Ninguém atingiu o topo
                  </span>
                </div>
              </div>
            </div>

            {/* Categorias Modernizadas */}
            <div className="space-y-6">
              <h4 className=" font-semibold text-gray-200 text-xl flex items-center">
                CATEGORIAS:
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <p className="text-gray-300 leading-relaxed text-lg bg-black/20 rounded-xl p-6">
                  <strong className="text-yellow-300 text-xl flex items-center mb-3">
                    MOTOS NACIONAIS
                  </strong>
                  <p className="text-gray-200">
                    Bros, Lander, Crosser, XTZ...
                  </p>
                </p>
                <p className="text-gray-300 leading-relaxed text-lg bg-black/20 rounded-xl p-6">
                  <strong className="text-yellow-300 text-xl flex items-center mb-3">
                    MOTOS IMPORTADAS
                  </strong>
                  <p className="text-gray-200">
                    Honda, Yamaha, KTM, Husqvarna... 
                  </p>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProvasSection;
