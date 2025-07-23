import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Trophy,
  Calendar,
  Utensils,
  Clock,
  Mountain,
  Bike,
  Users,
  UserPlus,
  Zap,
  Target,
  Star,
  Play,
  PointerIcon,
  CopySlashIcon,
} from "lucide-react";
import TrilhaoMap from "../componentes/paginaPrincipal/mapa";

const TrilhaoHomepage = () => {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  // Efeito de scroll parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fotos das edições anteriores
  const editionPhotos = [
    {
      src: "/api/placeholder/800/500",
      title: "15ª Edição - 2024",
      description: "Mais de 100 participantes enfrentaram o desafio",
      stats: "100+ Pilotos • 25km • 4h de Duração",
    },
    {
      src: "/api/placeholder/800/500",
      title: "14ª Edição - 2023",
      description: "Trilha desafiadora na Serra da Mantiqueira",
      stats: "180 Pilotos • Chuva • Lama Extrema",
    },
    {
      src: "/api/placeholder/800/500",
      title: "13ª Edição - 2022",
      description: "Subida no Barranco ",
      stats: "150 Pilotos • Recorde de Altura • R$ 1.000",
    },
    {
      src: "/api/placeholder/800/500",
      title: "12ª Edição - 2021",
      description: "Primeiro evento pós-pandemia",
      stats: "120 Pilotos • Subidas Ingrimes • Emoção Pura",
    },
  ];

  const nextPhoto = () => {
    setCurrentPhoto((prev) => (prev + 1) % editionPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhoto(
      (prev) => (prev - 1 + editionPhotos.length) % editionPhotos.length
    );
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Navigation Bar Modernizada */}

      {/* Hero Section Ultra Moderno */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background com Parallax */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-black via-green-950 to-black"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        ></div>

        {/* Overlay animado */}

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
              <div className="text-3xl font-black text-yellow-400">25KM</div>
              <div className="text-sm text-gray-300">Trilha Off-Road</div>
            </div>
            <div className="bg-black/40 backdrop-blur-lg border border-green-400/30 rounded-2xl p-4">
              <div className="text-3xl font-black text-green-400">3º</div>
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
              25km de trilha pelos montes de Itamonte. Estradas de terra, e
              vegetação que testam sua capacidade de pilotar! Além disso para os
              mais corajosos ainda há um desafio:{" "}
              <span className="text-green-400 font-bold">O Barranco</span> - o
              qual ninguem alcançou o topo.
            </p>
            <p className="text-yellow-300 font-bold text-xl">
              ⚡ MAIS DE 3 EDIÇÕES • DEZENAS DE PILOTOS • NOVOS DESAFIOS
            </p>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent "></div>
      {/* Stats Section Moderna */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <h3 className="text-4xl md:text-3xl font-black text-center text-yellow-400 mb-12">
            O QUE VOCÊ ENCONTRA NO TRILHÃO :
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-all">
                <Users className="text-black" size={40} />
              </div>
              <div className="text-4xl font-black text-white mb-2">200+</div>
              <div className="text-yellow-400 font-medium">
                Pilotos por Edição
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-400 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-all">
                <Mountain className="text-black" size={40} />
              </div>
              <div className="text-4xl font-black text-white mb-2">1.847M</div>
              <div className="text-green-400 font-medium">Altitude Máxima</div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-all">
                <Trophy className="text-black" size={40} />
              </div>
              <div className="text-4xl font-black text-white mb-2">R$1.000</div>
              <div className="text-yellow-400 font-medium">Prêmio Máximo</div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-400 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-all">
                <Target className="text-black" size={40} />
              </div>
              <div className="text-4xl font-black text-white mb-2">25KM</div>
              <div className="text-green-400 font-medium">Trilha </div>
            </div>
          </div>
        </div>
      </section>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-8"></div>
      {/* Galeria Moderna */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              <span className="text-yellow-400">EDIÇÕES PASSADAS</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto"></div>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={editionPhotos[currentPhoto].src}
                alt={editionPhotos[currentPhoto].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-transparent to-slate-100"></div>

              {/* Info Overlay Moderna */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black font-bold rounded-full mb-4">
                      <Trophy className="mr-2" size={16} />
                      {editionPhotos[currentPhoto].stats}
                    </div>
                    <h3 className="text-white text-4xl font-black mb-2">
                      {editionPhotos[currentPhoto].title}
                    </h3>
                    <p className="text-gray-300 text-xl">
                      {editionPhotos[currentPhoto].description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controles Modernos */}
            <button
              onClick={prevPhoto}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-lg hover:bg-yellow-500 text-white p-4 rounded-2xl transition-all hover:scale-110 border border-white/20"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-lg hover:bg-yellow-500 text-white p-4 rounded-2xl transition-all hover:scale-110 border border-white/20"
            >
              <ChevronRight size={28} />
            </button>

            {/* Indicadores Modernos */}
            <div className="flex justify-center mt-8 space-x-3">
              {editionPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhoto(index)}
                  className={`h-3 rounded-full transition-all ${
                    index === currentPhoto
                      ? "bg-yellow-400 w-8"
                      : "bg-white/30 w-3 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-8"></div>
      {/* Provas Section Ultra Moderna */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              <span className="text-yellow-400">PROVAS</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Dois desafios que levam sua determinação ao limite
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
          </div>

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
                      <strong className="text-green-400">Distância:</strong>{" "}
                      25km off-road
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
                  <h3 className="text-4xl font-black text-white">O BARRANCO</h3>
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
                      <strong className="text-yellow-400">Status:</strong> 0
                      conquistadores
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
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-8"></div>
      {/* Local e Estrutura Moderna */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              BASE DE <span className="text-yellow-400">OPERAÇÕES</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Estrutura completa para uma experiência inesquecível
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Localização */}
            <div className="group bg-gradient-to-br from-green-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 hover:border-green-400/60 transition-all transform hover:scale-105">
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all">
                <MapPin className="text-black" size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-6 text-center">
                LOCALIZAÇÃO
              </h3>
              <div className="text-gray-300 space-y-3 text-center">
                <p className="text-yellow-400 font-bold text-lg">
                  Centro de Eventos
                </p>
                <p className="text-white font-semibold">Fazenda do Trilhão</p>
                <p>Estrada da Mantiqueira, Km 15</p>
                <p>Itamonte - MG</p>
                <div className="bg-black/40 rounded-xl p-3 mt-4">
                  <p className="text-green-400 font-bold">
                    📍 GPS: -22.2875, -44.8647
                  </p>
                </div>
              </div>
            </div>

            {/* Alimentação */}
            <div className="group bg-gradient-to-br from-yellow-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 hover:border-yellow-400/60 transition-all transform hover:scale-105">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all">
                <Utensils className="text-black" size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-6 text-center">
                GASTRONOMIA
              </h3>
              <div className="text-gray-300 space-y-3">
                <div className="bg-black/40 rounded-xl p-3 flex justify-between items-center">
                  <span>
                    🍖{" "}
                    <strong className="text-yellow-400">Churrasquinho</strong>
                  </span>
                  <span className="text-green-400 font-bold">R$ 8</span>
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex justify-between items-center">
                  <span>
                    🌭{" "}
                    <strong className="text-yellow-400">Cachorro-quente</strong>
                  </span>
                  <span className="text-green-400 font-bold">R$ 6</span>
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex justify-between items-center">
                  <span>
                    🥪{" "}
                    <strong className="text-yellow-400">
                      Sanduíche Natural
                    </strong>
                  </span>
                  <span className="text-green-400 font-bold">R$ 10</span>
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex justify-between items-center">
                  <span>
                    🧊{" "}
                    <strong className="text-yellow-400">Bebidas Geladas</strong>
                  </span>
                  <span className="text-green-400 font-bold">R$ 4</span>
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex justify-between items-center">
                  <span>
                    ☕ <strong className="text-yellow-400">Café da Roça</strong>
                  </span>
                  <span className="text-green-400 font-bold">R$ 3</span>
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex justify-between items-center">
                  <span>
                    🍰{" "}
                    <strong className="text-yellow-400">Doces Caseiros</strong>
                  </span>
                  <span className="text-green-400 font-bold">R$ 5</span>
                </div>
              </div>
            </div>

            {/* Estrutura */}
            <div className="group bg-gradient-to-br from-green-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 hover:border-green-400/60 transition-all transform hover:scale-105">
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all">
                <Calendar className="text-black" size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-6 text-center">
                INFRAESTRUTURA
              </h3>
              <div className="text-gray-300 space-y-3">
                <div className="bg-black/40 rounded-xl p-3 flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-4"></div>
                  <span>
                    <strong className="text-green-400">🏕️</strong> Área de
                    Camping
                  </span>
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-4"></div>
                  <span>
                    <strong className="text-yellow-400">🚿</strong> Banheiros
                    Completos
                  </span>
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-4"></div>
                  <span>
                    <strong className="text-green-400">🅿️</strong>{" "}
                    Estacionamento
                  </span>
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-4"></div>
                  <span>
                    <strong className="text-yellow-400">🏥</strong> Primeiros
                    Socorros
                  </span>
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-4"></div>
                  <span>
                    <strong className="text-green-400">🔧</strong> Oficina
                    Básica
                  </span>
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-4"></div>
                  <span>
                    <strong className="text-yellow-400">🎵</strong> Som Ambiente
                  </span>
                </div>
                <div className="bg-black/40 rounded-xl p-3 flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-4"></div>
                  <span>
                    <strong className="text-green-400">🏆</strong> Palco de
                    Premiação
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Programação Moderna */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-green-900/60 to-black/80 backdrop-blur-lg rounded-3xl p-10 border border-green-400/30">
              <h3 className="text-4xl font-black text-center mb-12 text-white">
                <Calendar className="inline mr-4 text-yellow-400" size={40} />
                CRONOGRAMA
              </h3>

              <div className="grid md:grid-cols-2 gap-12">
                {/* Sábado */}
                <div className="bg-black/40 rounded-2xl p-8 border border-yellow-400/30">
                  <h4 className="text-3xl font-black mb-8 text-yellow-400 text-center">
                    🔥 SÁBADO
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-green-900/30 rounded-xl p-4">
                      <span className="text-white font-bold">07:00</span>
                      <span className="text-gray-300">
                        🚪 Abertura dos portões
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-green-900/30 rounded-xl p-4">
                      <span className="text-white font-bold">08:00</span>
                      <span className="text-gray-300">☕ Café da manhã</span>
                    </div>
                    <div className="flex items-center justify-between bg-green-900/30 rounded-xl p-4">
                      <span className="text-white font-bold">09:00</span>
                      <span className="text-gray-300">
                        🔧 Verificação técnica
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-yellow-600/20 rounded-xl p-4 border border-yellow-400/50">
                      <span className="text-yellow-400 font-black">10:30</span>
                      <span className="text-yellow-400 font-bold">
                        🏁 LARGADA DA TRILHA
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-green-900/30 rounded-xl p-4">
                      <span className="text-white font-bold">14:00</span>
                      <span className="text-gray-300">🍖 Almoço</span>
                    </div>
                    <div className="flex items-center justify-between bg-yellow-600/20 rounded-xl p-4 border border-yellow-400/50">
                      <span className="text-yellow-400 font-black">15:30</span>
                      <span className="text-yellow-400 font-bold">
                        ⛰️ PROVA DA SUBIDA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Domingo */}
                <div className="bg-black/40 rounded-2xl p-8 border border-green-400/30">
                  <h4 className="text-3xl font-black mb-8 text-green-400 text-center">
                    🏆 DOMINGO
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-green-900/30 rounded-xl p-4">
                      <span className="text-white font-bold">08:00</span>
                      <span className="text-gray-300">☕ Café da manhã</span>
                    </div>
                    <div className="flex items-center justify-between bg-green-900/30 rounded-xl p-4">
                      <span className="text-white font-bold">09:00</span>
                      <span className="text-gray-300">👨‍👩‍👧‍👦 Passeio família</span>
                    </div>
                    <div className="flex items-center justify-between bg-green-600/20 rounded-xl p-4 border border-green-400/50">
                      <span className="text-green-400 font-black">11:00</span>
                      <span className="text-green-400 font-bold">
                        🏆 PREMIAÇÃO
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-green-900/30 rounded-xl p-4">
                      <span className="text-white font-bold">12:00</span>
                      <span className="text-gray-300">🎉 Confraternização</span>
                    </div>
                    <div className="flex items-center justify-between bg-green-900/30 rounded-xl p-4">
                      <span className="text-white font-bold">14:00</span>
                      <span className="text-gray-300">👋 Encerramento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-8"></div>
      {/* Seção de Conquistas e Recordes */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              HALL DA <span className="text-yellow-400">FAMA</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Ultimos vencedores dos premios
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Campeão Trilha */}

            {/* Rei do Barranco */}
            <div className="bg-gradient-to-br from-green-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 text-center">
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Mountain className="text-black" size={40} />
              </div>
              <h3 className="text-2xl font-black text-green-400 mb-4">
                REI DO BARRANCO
              </h3>
              <div className="text-white space-y-3">
                <p className="text-3xl font-black">Carlos Mendes</p>
                <p className="text-green-400 font-bold text-xl">47.2 metros</p>
                <p className="text-sm text-gray-400">14ª Edição - 2023</p>
                <div className="bg-black/40 rounded-xl p-3 mt-4">
                  <p className="text-yellow-400 font-semibold">KTM 350 EXC-F</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 text-center">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Trophy className="text-black" size={40} />
              </div>
              <h3 className="text-2xl font-black text-yellow-400 mb-4">
                CAMPEÃO DA TRILHA
              </h3>
              <div className="text-white space-y-3">
                <p className="text-3xl font-black">João Silva</p>
                <p className="text-yellow-400 font-bold text-xl">
                  2h 47min 23s
                </p>
                <p className="text-sm text-gray-400">15ª Edição - 2024</p>
                <div className="bg-black/40 rounded-xl p-3 mt-4">
                  <p className="text-green-400 font-semibold">Honda CRF 450X</p>
                </div>
              </div>
            </div>

            {/* Lenda Nacional */}
            <div className="bg-gradient-to-br from-green-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 text-center">
              <div className="bg-gradient-to-br from-yellow-400 to-green-400 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Star className="text-black" size={40} />
              </div>
              <h3 className="text-2xl font-black text-green-400 mb-4">
                MAIS TÍTULOS
              </h3>
              <div className="text-white space-y-3">
                <p className="text-3xl font-black">Pedro Costa</p>
                <p className="text-yellow-400 font-bold text-xl">3 Títulos</p>
                <p className="text-sm text-gray-400">
                  2 Subidas no barranco e 1 Vitória na trilha
                </p>
                <div className="bg-black/40 rounded-xl p-3 mt-4">
                  <p className="text-green-400 font-semibold">Honda Bros 160</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Ultra Moderno */}
      <section className="py-32 bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Badge Animado */}

            <h2 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-yellow-400 via-white to-green-400 bg-clip-text text-transparent">
              FAÇA PARTE DESSA AVENTURA
            </h2>

            <p className="text-2xl md:text-3xl mb-12 text-gray-300 leading-relaxed">
              25km de trilha épica, desafios impossíveis e a chance de
              <span className="text-yellow-400 font-bold">
                {" "}
                eternizar seu nome{" "}
              </span>
              na Serra da Mantiqueira!
            </p>

            {/* CTA Buttons Épicos */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <button
                className="group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-black px-16 py-6 rounded-3xl text-2xl transition-all transform hover:scale-110 hover:shadow-2xl hover:shadow-yellow-400/25 flex items-center"
                onClick={() => navigate("/cadastro")}
              >
                <Trophy className="mr-4 group-hover:animate-pulse" size={32} />
                GARANTIR MINHA VAGA
              </button>
            </div>

            {/* Texto Final Motivacional */}
            <div className="mt-16 max-w-3xl mx-auto">
              <p className="text-xl text-gray-400 leading-relaxed">
                <span className="text-white font-bold">
                  Só os mais corajosos ousam tentar.
                </span>
              </p>

              <div className="mt-8 text-2xl font-black">
                <span className="text-white">VOCÊ É CAPAZ?</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Moderno */}
      <footer className="bg-black border-t border-yellow-400/20 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Mountain className="text-yellow-400 mr-3" size={32} />
              <span className="text-2xl font-black text-white tracking-wider">
                TRILHÃO DOS AMIGOS
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              A maior aventura off-road da Serra da Mantiqueira
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <span>📍 Itamonte - MG</span>
              <span>📞 (35) 9999-9999</span>
              <span>📧 contato@trilhao.com.br</span>
            </div>
            <div className="mt-8 text-xs text-gray-600">
              © 2025 Trilhão Itamonte. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrilhaoHomepage;
