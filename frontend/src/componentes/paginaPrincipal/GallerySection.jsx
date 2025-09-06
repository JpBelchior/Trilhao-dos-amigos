// frontend/src/componentes/paginaPrincipal/GallerySection.jsx
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import LoadingComponent from "../Loading";
import SimpleImage from "../SimpleImage";
import { useApiRetry } from "../../hooks/useApiRetry";

const GallerySection = () => {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [fotos, setFotos] = useState([]);

  const { fetchWithRetry, loading, error } = useApiRetry(3);

  // Carregar fotos da API
  const carregarFotos = async () => {
    try {
      const data = await fetchWithRetry(
        "http://localhost:8000/api/fotos/galeria/edicoes_anteriores"
      );

      if (data.sucesso && data.dados.length > 0) {
        setFotos(data.dados);
        setCurrentPhoto(0);
      } else {
        setFotos(getFotosExemplo());
      }
    } catch (err) {
      setFotos(getFotosExemplo());
    }
  };

  useEffect(() => {
    carregarFotos();
  }, []);

  // Fotos de exemplo
  const getFotosExemplo = () => [
    {
      id: "exemplo-1",
      titulo: "8ª Edição - 2024",
      descricao: "Mais de 100 participantes enfrentaram o desafio",
      stats: "100+ Pilotos • 25km • 4h de Duração",
      urlFoto: "/api/placeholder/800/500",
      edicao: "8ª Edição",
      ano: 2024,
    },
    {
      id: "exemplo-2",
      titulo: "7ª Edição - 2023",
      descricao: "Trilha desafiadora na Serra da Mantiqueira",
      stats: "180 Pilotos • Chuva • Lama Extrema",
      urlFoto: "/api/placeholder/800/500",
      edicao: "7ª Edição",
      ano: 2023,
    },
    {
      id: "exemplo-3",
      titulo: "6ª Edição - 2022",
      descricao: "Subida no Barranco",
      stats: "150 Pilotos • Recorde de Altura • R$ 1.000",
      urlFoto: "/api/placeholder/800/500",
      edicao: "6ª Edição",
      ano: 2022,
    },
  ];

  // Construir URL da imagem
  const getImageUrl = (foto) => {
    if (foto.urlFoto?.startsWith("/uploads/")) {
      return `http://localhost:8000${foto.urlFoto}`;
    }
    return foto.urlFoto || "/api/placeholder/800/500";
  };

  // Navegação
  const nextPhoto = () => {
    if (fotos.length > 0) {
      setCurrentPhoto((prev) => (prev + 1) % fotos.length);
    }
  };

  const prevPhoto = () => {
    if (fotos.length > 0) {
      setCurrentPhoto((prev) => (prev - 1 + fotos.length) % fotos.length);
    }
  };

  // Loading usando o LoadingComponent existente
  if (loading) {
    return <LoadingComponent loading="Carregando galeria..." />;
  }

  // Sem fotos - versão simples
  if (fotos.length === 0) {
    return (
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="relative max-w-6xl mx-auto">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-500 text-6xl mb-4">📷</div>
                <p className="text-gray-400 text-xl mb-2">
                  Nenhuma foto disponível
                </p>
                <p className="text-gray-500">
                  As fotos das edições anteriores aparecerão aqui
                </p>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const fotoAtual = fotos[currentPhoto];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="relative max-w-6xl mx-auto">
          {/* Container principal */}
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            <SimpleImage
              src={getImageUrl(fotoAtual)}
              fallbackSrc="/api/placeholder/800/500"
              alt={fotoAtual.titulo}
              className="w-full h-full object-cover"
              imageId={`gallery-${fotoAtual.id}`}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

            {/* Navegação */}
            {fotos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Info da foto */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end justify-between">
                <div>
                  <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black font-bold rounded-full mb-4">
                    <Trophy size={16} className="mr-2" />
                    {fotoAtual.edicao || "Edição Especial"}
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-2 text-shadow-xl">
                    {fotoAtual.titulo}
                  </h2>
                  {fotoAtual.descricao && (
                    <p className="text-gray-200 text-lg mb-3 text-shadow-xl">
                      {fotoAtual.descricao}
                    </p>
                  )}
                  {fotoAtual.stats && (
                    <p className="text-orange-400 font-semibold text-shadow-xl">
                      {fotoAtual.stats}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          {fotos.length > 1 && (
            <div className="mt-6 flex gap-2 justify-center overflow-x-auto pb-2">
              {fotos.map((foto, index) => (
                <button
                  key={foto.id}
                  onClick={() => setCurrentPhoto(index)}
                  className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentPhoto
                      ? "border-green-400 opacity-100"
                      : "border-gray-600 opacity-60 hover:opacity-80"
                  }`}
                >
                  <SimpleImage
                    src={getImageUrl(foto)}
                    fallbackSrc="/api/placeholder/80/48"
                    alt={`Thumbnail ${foto.titulo}`}
                    className="w-full h-full object-cover"
                    imageId={`thumb-${foto.id}`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Indicador */}
          {fotos.length > 1 && (
            <div className="text-center mt-4">
              <span className="text-gray-400">
                {currentPhoto + 1} de {fotos.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
