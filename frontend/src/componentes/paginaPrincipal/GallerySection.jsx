// frontend/src/componentes/paginaPrincipal/GallerySection.jsx (CORRIGIDO)
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import SimpleImage from "../SimpleImage";
import LoadingComponent from "../Loading";

const GallerySection = () => {
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState(0);

  // Carregar fotos da API
  const carregarFotos = async () => {
    try {
      setLoading(true);
      setErro("");

      console.log(
        "📸 [GallerySection] Carregando fotos de edições anteriores..."
      );

      const response = await fetch(
        "http://localhost:8000/api/fotos/galeria/edicoes_anteriores"
      );
      const data = await response.json();

      if (data.sucesso && data.dados.fotos) {
        setFotos(data.dados.fotos);
        console.log(
          `✅ [GallerySection] ${data.dados.fotos.length} fotos carregadas`
        );
      } else {
        console.warn("⚠️ [GallerySection] Nenhuma foto encontrada");
        setFotos([]);
      }
    } catch (error) {
      console.error("❌ [GallerySection] Erro ao carregar fotos:", error);
      setErro("Erro ao carregar galeria");
      setFotos([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar fotos ao montar o componente
  useEffect(() => {
    carregarFotos();
  }, []);

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

  // Loading
  if (loading) {
    return (
      <LoadingComponent loading="Carregando galeria de edições anteriores..." />
    );
  }

  // Erro
  if (erro) {
    return (
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="relative max-w-6xl mx-auto">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-red-900/20 flex items-center justify-center border border-red-500/30">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <p className="text-red-400 text-xl mb-2">
                  Erro ao carregar galeria
                </p>
                <p className="text-gray-500">{erro}</p>
                <button
                  onClick={carregarFotos}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Sem fotos
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
                  As fotos das edições anteriores aparecerão aqui em breve
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
          {/* Galeria principal */}
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            {/* Imagem de fundo */}
            <SimpleImage
              src={getImageUrl(fotoAtual)}
              fallbackSrc="/api/placeholder/800/500"
              alt={fotoAtual.titulo}
              className="w-full h-full object-cover"
              imageId={`gallery-${fotoAtual.id}`}
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            {/* Navegação */}
            {fotos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                  aria-label="Próxima foto"
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
                    {fotoAtual.edicao
                      ? `${fotoAtual.edicao}ª Edição`
                      : "Edição Especial"}
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
                  {fotoAtual.ano && (
                    <p className="text-green-400 font-semibold text-shadow-xl">
                      Ano: {fotoAtual.ano}
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
