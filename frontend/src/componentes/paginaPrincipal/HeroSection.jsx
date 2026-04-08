import React from "react";
import { useEdicao } from "../../hooks/useEdicao";
import {useImageRetry} from "../../hooks/useImageRetry";
import { Signpost } from "lucide-react";

const HeroSection = ({ isVisible, scrollY }) => {
  const { edicaoAtual, loading } = useEdicao();
  const { abrirNoGoogleMaps, formatarCoordenadas } = useImageRetry();
    const coordenadas = {
      lat: -22.3121252, 
      lng: -44.8171325  ,
    };

  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden px-4">
  {/* Background */}
  <div
    className="absolute inset-0 bg-gradient-to-br from-black via-green-950 to-black"
    style={{ transform: `translateY(${scrollY * 0.5}px)` }}
  />

  <div
    className={`relative z-20 text-center text-white w-full max-w-6xl transition-all duration-1000 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
    }`}
  >
    {/* Título */}
    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-white to-green-400 bg-clip-text text-transparent">
      TRILHÃO DOS AMIGOS
    </h1>

    {/* Subtítulo */}
    <div className="flex items-center justify-center mb-8">
      <div className="h-1 w-10 md:w-20 bg-gradient-to-r from-transparent to-yellow-400" />
      <h2 className="text-lg sm:text-xl md:text-3xl font-light mx-4 md:mx-6 tracking-widest">
        SERRA DA MANTIQUEIRA
      </h2>
      <div className="h-1 w-10 md:w-20 bg-gradient-to-l from-transparent to-green-400" />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
      <div className="bg-black/40 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-4">
        <div className="text-2xl md:text-3xl font-black text-yellow-400">50KM</div>
        <div className="text-sm text-gray-300">Trilha Off-Road</div>
      </div>

      <div className="bg-black/40 backdrop-blur-lg border border-green-400/30 rounded-2xl p-4">
        <div className="text-2xl md:text-3xl font-black text-green-400">
          {loading ? "..." : `${edicaoAtual?.numeroEdicao}º`}
        </div>
        <div className="text-sm text-gray-300">Edição</div>
      </div>

      <div className="bg-black/40 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-4">
        <div className="text-2xl md:text-3xl font-black text-yellow-400">R$1.5K</div>
        <div className="text-sm text-gray-300">Prêmio Máximo</div>
      </div>
    </div>

    {/* Texto */}
    <div className="text-base sm:text-lg md:text-2xl mb-10 leading-relaxed space-y-6 max-w-4xl mx-auto">
      <p className="text-yellow-400 font-bold text-lg sm:text-xl md:text-2xl">
        VOCÊ TEM CORAGEM DE ENFRENTAR ESSE DESAFIO?
      </p>

      <p className="text-gray-300">
        Uma trilha pelos morros de Itamonte. Estradas de terra, vegetação e
        travessias de rios testam sua capacidade de pilotar! Além disso, há um
        obstáculo:{" "}
        <span className="text-green-400 font-bold">O Morro do Desafio</span>.
      </p>

      <p className="text-yellow-300 font-bold text-base md:text-xl">
        <Signpost className="inline mr-2" size={20} />
        9 EDIÇÕES • DEZENAS DE PILOTOS • NOVOS DESAFIOS TODO ANO
        <Signpost className="inline ml-2" size={20} />
      </p>

      <p className="text-gray-300">
        Endereço:{" "}
        <span className="text-yellow-300 font-semibold">
          Centro Comunitário, Ilha Grande, Itamonte/MG
        </span>
        <br />
        Datas:
        <span className="text-yellow-300 font-semibold"> 27 e 28 de Julho</span>
      </p>

      {/* Botão */}
      <button
        onClick={() => abrirNoGoogleMaps(coordenadas.lat, coordenadas.lng)}
        className="bg-black/40 rounded-xl p-3 mt-4 w-full max-w-xs mx-auto hover:bg-green-600/30 transition-all cursor-pointer border border-green-400/30 hover:border-green-400/60 group"
      >
        <p className="text-green-400 font-bold group-hover:text-green-300">
          Ver Localização no Mapa
        </p>
      </button>
    </div>
  </div>
</div>

  );
};

export default HeroSection;
