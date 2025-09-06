// src/componentes/paginaPrincipal/GallerySection.jsx
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Loader2,
  ImageIcon,
} from "lucide-react";

const GallerySection = () => {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Carregar fotos da categoria "edições anteriores"
  useEffect(() => {
    carregarFotos();
  }, []);

  const carregarFotos = async () => {
    try {
      setLoading(true);
      setErro("");

      const response = await fetch(
        "http://localhost:8000/api/fotos/galeria/edicoes_anteriores"
      );
      const data = await response.json();

      if (data.sucesso && data.dados.length > 0) {
        setFotos(data.dados);
        setCurrentPhoto(0); // Reset para primeira foto
      } else if (data.dados.length === 0) {
        // Não há fotos, usar dados de exemplo para não quebrar o layout
        setFotos(getFotosExemplo());
      } else {
        setErro("Erro ao carregar fotos");
        setFotos(getFotosExemplo());
      }
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
      setErro("Erro de conexão");
      setFotos(getFotosExemplo());
    } finally {
      setLoading(false);
    }
  };

  // Fotos de exemplo como fallback
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
    {
      id: "exemplo-4",
      titulo: "5ª Edição - 2021",
      descricao: "Primeiro evento pós-pandemia",
      stats: "120 Pilotos • Subidas Íngremes • Emoção Pura",
      urlFoto: "/api/placeholder/800/500",
      edicao: "5ª Edição",
      ano: 2021,
    },
  ];

  // Funções de navegação
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

  // Ir para foto específica
  const goToPhoto = (index) => {
    setCurrentPhoto(index);
  };

  // Construir URL da imagem
  const getImageUrl = (foto) => {
    if (foto.urlFoto.startsWith("/uploads/")) {
      return `http://localhost:8000${foto.urlFoto}`;
    }
    return foto.urlFoto; // Para fotos de exemplo
  };

  if (loading) {
    return (
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="relative max-w-6xl mx-auto">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <Loader2
                  className="animate-spin mx-auto mb-4 text-green-400"
                  size={48}
                />
                <p className="text-white text-xl">Carregando galeria...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (fotos.length === 0) {
    return (
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="relative max-w-6xl mx-auto">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="mx-auto mb-4 text-gray-500" size={64} />
                <p className="text-gray-400 text-xl mb-2">
                  Nenhuma foto disponível
                </p>
                <p className="text-gray-500">
                  As fotos das edições anteriores aparecerão aqui
                </p>
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
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={getImageUrl(fotoAtual)}
              alt={fotoAtual.titulo}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback para imagem quebrada
                e.target.src = "/api/placeholder/800/500";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

            {/* Info Overlay Moderna */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end justify-between">
                <div>
                  <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black font-bold rounded-full mb-4">
                    <Trophy className="mr-2" size={16} />
                    {fotoAtual.stats ||
                      `${fotoAtual.edicao} • ${fotoAtual.ano}`}
                  </div>
                  <h3 className="text-white text-4xl font-black mb-2">
                    {fotoAtual.titulo}
                  </h3>
                  <p className="text-yellow-200/80 text-xl">
                    {fotoAtual.descricao}
                  </p>
                </div>
              </div>
            </div>

            {/* Controles de navegação - só mostrar se houver mais de 1 foto */}
            {fotos.length > 1 && (
              <>
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
              </>
            )}
          </div>

          {/* Indicadores - só mostrar se houver mais de 1 foto */}
          {fotos.length > 1 && (
            <div className="flex justify-center mt-8 space-x-3">
              {fotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPhoto(index)}
                  className={`h-3 rounded-full transition-all ${
                    index === currentPhoto
                      ? "bg-yellow-400 w-8"
                      : "bg-white/30 w-3 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Contador de fotos */}
          {fotos.length > 1 && (
            <div className="text-center mt-4">
              <span className="text-gray-400 text-sm">
                {currentPhoto + 1} de {fotos.length} fotos
              </span>
            </div>
          )}

          {/* Indicador de erro (se houver) */}
          {erro && (
            <div className="text-center mt-4">
              <span className="text-yellow-400 text-sm">
                ⚠️ {erro} - Exibindo fotos de exemplo
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
