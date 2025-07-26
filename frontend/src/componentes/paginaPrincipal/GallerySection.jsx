// src/componentes/paginaPrincipal/GallerySection.jsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";

const GallerySection = () => {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  // Fotos das edições anteriores
  const editionPhotos = [
    {
      src: "/api/placeholder/800/500",
      title: "8ª Edição - 2024",
      description: "Mais de 100 participantes enfrentaram o desafio",
      stats: "100+ Pilotos • 25km • 4h de Duração",
    },
    {
      src: "/api/placeholder/800/500",
      title: "7ª Edição - 2023",
      description: "Trilha desafiadora na Serra da Mantiqueira",
      stats: "180 Pilotos • Chuva • Lama Extrema",
    },
    {
      src: "/api/placeholder/800/500",
      title: "6ª Edição - 2022",
      description: "Subida no Barranco ",
      stats: "150 Pilotos • Recorde de Altura • R$ 1.000",
    },
    {
      src: "/api/placeholder/800/500",
      title: "5 ª Edição - 2021",
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
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
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
                  <p className="text-yellow-200/40 text-xl">
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
  );
};

export default GallerySection;
