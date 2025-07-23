import React, { useState } from "react";
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
} from "lucide-react";
import TrilhaoMap from "../components/paginaPrincipal/mapa";

const TrilhaoHomepage = () => {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [currentPage, setCurrentPage] = useState("inicio");
  const navigate = useNavigate();

  // Fotos das edições anteriores (placeholder - você substituirá pelas reais)
  const editionPhotos = [
    {
      src: "/api/placeholder/800/500",
      title: "15ª Edição - 2024",
      description: "Mais de 200 participantes",
    },
    {
      src: "/api/placeholder/800/500",
      title: "14ª Edição - 2023",
      description: "Trilha desafiadora na Serra da Mantiqueira",
    },
    {
      src: "/api/placeholder/800/500",
      title: "13ª Edição - 2022",
      description: "Subida épica no Barranco dos Campeões",
    },
    {
      src: "/api/placeholder/800/500",
      title: "12ª Edição - 2021",
      description: "Primeiro evento pós-pandemia",
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
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Mountain className="text-green-900 mr-2" size={32} />
              <span className="text-2xl font-bold text-green-900">TRILHÃO</span>
            </div>

            {/* Menu Navigation */}
            <div className="flex space-x-8">
              <button
                onClick={() => navigate("/")}
                className={`flex items-center px-4 py-2 rounded-lg transition-all font-medium ${
                  currentPage === "inicio"
                    ? "bg-green-900 text-white"
                    : "text-green-900 hover:bg-green-100"
                }`}
              >
                <Mountain className="mr-2" size={20} />
                Início
              </button>

              <button
                onClick={() => navigate("/cadastro")}
                className={`flex items-center px-4 py-2 rounded-lg transition-all font-medium ${
                  currentPage === "cadastro"
                    ? "bg-green-900 text-white"
                    : "text-green-900 hover:bg-green-100"
                }`}
              >
                <UserPlus className="mr-2" size={20} />
                Cadastro
              </button>

              <button
                onClick={() => navigate("/inscritos")}
                className={`flex items-center px-4 py-2 rounded-lg transition-all font-medium ${
                  currentPage === "inscritos"
                    ? "bg-green-900 text-white"
                    : "text-green-900 hover:bg-green-100"
                }`}
              >
                <Users className="mr-2" size={20} />
                Inscritos
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center"></div>

        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-shadow-xl">
            TRILHÃO
          </h1>
          <h2 className="text-2xl md:text-4xl font-light mb-6">
            Itamonte - MG
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            O maior evento de trilha off-road da Serra da Mantiqueira
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentPage("cadastro")}
              className="bg-orange-600 hover:bg-orange-700 px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105"
            >
              Inscreva-se Agora
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-green-900 px-8 py-4 rounded-full text-lg font-semibold transition-all">
              Ver Trajetos
            </button>
          </div>
        </div>
      </div>

      {/* Galeria de Fotos das Edições */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-12">
            Últimas Edições
          </h2>

          <div className="relative max-w-4xl mx-auto">
            <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
              <img
                src={editionPhotos[currentPhoto].src}
                alt={editionPhotos[currentPhoto].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white text-2xl font-bold mb-2">
                  {editionPhotos[currentPhoto].title}
                </h3>
                <p className="text-white/90">
                  {editionPhotos[currentPhoto].description}
                </p>
              </div>
            </div>

            {/* Controles da Galeria */}
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all"
            >
              <ChevronRight size={24} />
            </button>

            {/* Indicadores */}
            <div className="flex justify-center mt-6 space-x-2">
              {editionPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhoto(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentPhoto ? "bg-orange-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Como Funcionam as Provas */}
      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-12">
            Como Funcionam as Provas
          </h2>

          {/* Mapa dos Trajetos */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-green-900 mb-6">
              Trajeto das Provas
            </h3>
            <div className="max-w-4xl mx-auto">
              <TrilhaoMap />
            </div>
            <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
              Clique nos marcadores no mapa para ver detalhes de cada ponto do
              trajeto. A linha vermelha mostra o percurso completo da trilha.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            `{/* Prova 1 - Trilha */}
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-all">
              <div className="flex items-center mb-6">
                <div className="bg-orange-600 text-white rounded-full p-3 mr-4">
                  <Bike size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-900">
                    1ª Prova - Trilha
                  </h3>
                  <p className="text-gray-600">Percurso Técnico</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <MapPin className="mr-3 text-orange-600" size={20} />
                  <span>
                    <strong>Largada:</strong> Praça da Matriz - Centro de
                    Itamonte
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="mr-3 text-green-600" size={20} />
                  <span>
                    <strong>Chegada:</strong> Mirante da Pedra do Baú
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="mr-3 text-blue-600" size={20} />
                  <span>
                    <strong>Distância:</strong> 25km de trilha off-road
                  </span>
                </div>
              </div>

              <p className="mt-6 text-gray-600 leading-relaxed">
                Percurso desafiador pela Serra da Mantiqueira, passando por
                cachoeiras, mata atlântica e trechos técnicos que testam a
                habilidade do piloto.
              </p>
            </div>
            {/* Prova 2 - Subida */}
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-all">
              <div className="flex items-center mb-6">
                <div className="bg-red-600 text-white rounded-full p-3 mr-4">
                  <Mountain size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-900">
                    2ª Prova - Subida
                  </h3>
                  <p className="text-gray-600">Barranco dos Campeões</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Trophy className="mr-3 text-yellow-500" size={20} />
                  <span>
                    <strong>Prêmio Máximo:</strong> R$ 1.000,00
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Mountain className="mr-3 text-red-600" size={20} />
                  <span>
                    <strong>Desafio:</strong> Subir o mais alto possível
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-bold text-green-900">Classificações:</h4>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong className="text-blue-800">🏍️ Motos Importadas</strong>
                  <p className="text-sm text-gray-600">
                    Honda, Yamaha, KTM, etc.
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <strong className="text-green-800">🏍️ Motos Nacionais</strong>
                  <p className="text-sm text-gray-600">
                    Bros, Lander, Crosser, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local e Estrutura */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-12">
            Local & Estrutura
          </h2>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Localização */}
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <MapPin className="text-green-600" size={40} />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-4">
                Localização
              </h3>
              <div className="text-gray-600 space-y-2">
                <p>
                  <strong>Centro de Eventos</strong>
                </p>
                <p>Fazenda do Trilhão</p>
                <p>Estrada da Mantiqueira, Km 15</p>
                <p>Itamonte - MG</p>
                <p className="text-green-600 font-semibold">
                  GPS: -22.2875, -44.8647
                </p>
              </div>
            </div>

            {/* Alimentação */}
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Utensils className="text-orange-600" size={40} />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-4">
                Alimentação
              </h3>
              <div className="text-gray-600 space-y-2">
                <p>
                  🍖 <strong>Churrasquinho</strong> - R$ 8,00
                </p>
                <p>
                  🌭 <strong>Cachorro-quente</strong> - R$ 6,00
                </p>
                <p>
                  🥪 <strong>Sanduíche Natural</strong> - R$ 10,00
                </p>
                <p>
                  🧊 <strong>Bebidas Geladas</strong> - R$ 4,00
                </p>
                <p>
                  ☕ <strong>Café da Roça</strong> - R$ 3,00
                </p>
                <p>
                  🍰 <strong>Doces Caseiros</strong> - R$ 5,00
                </p>
              </div>
            </div>

            {/* Estrutura */}
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-blue-600" size={40} />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-4">
                Estrutura
              </h3>
              <div className="text-gray-600 space-y-2">
                <p>
                  🏕️ <strong>Área de Camping</strong>
                </p>
                <p>
                  🚿 <strong>Banheiros Completos</strong>
                </p>
                <p>
                  🅿️ <strong>Estacionamento</strong>
                </p>
                <p>
                  🏥 <strong>Primeiros Socorros</strong>
                </p>
                <p>
                  🔧 <strong>Oficina Básica</strong>
                </p>
                <p>
                  🎵 <strong>Som Ambiente</strong>
                </p>
                <p>
                  🏆 <strong>Palco de Premiação</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Horários */}
          <div className="mt-16 bg-green-900 text-white rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">
              Programação do Evento
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold mb-4 text-orange-300">
                  Sábado
                </h4>
                <div className="space-y-2">
                  <p>
                    <strong>07:00</strong> - Abertura dos portões
                  </p>
                  <p>
                    <strong>08:00</strong> - Café da manhã
                  </p>
                  <p>
                    <strong>09:00</strong> - Verificação técnica
                  </p>
                  <p>
                    <strong>10:30</strong> - Largada da Trilha
                  </p>
                  <p>
                    <strong>14:00</strong> - Almoço
                  </p>
                  <p>
                    <strong>15:30</strong> - Prova da Subida
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-4 text-orange-300">
                  Domingo
                </h4>
                <div className="space-y-2">
                  <p>
                    <strong>08:00</strong> - Café da manhã
                  </p>
                  <p>
                    <strong>09:00</strong> - Passeio família
                  </p>
                  <p>
                    <strong>11:00</strong> - Premiação
                  </p>
                  <p>
                    <strong>12:00</strong> - Confraternização
                  </p>
                  <p>
                    <strong>14:00</strong> - Encerramento
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para o Desafio?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Inscreva-se agora e faça parte da maior aventura off-road da Serra
            da Mantiqueira!
          </p>
          <button
            className="bg-white text-orange-600 hover:bg-gray-100 px-10 py-4 rounded-full text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            onClick={() => setCurrentPage("cadastro")}
          >
            Fazer Inscrição
          </button>
        </div>
      </section>
    </div>
  );
};

export default TrilhaoHomepage;
