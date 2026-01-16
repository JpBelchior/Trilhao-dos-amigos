import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import SimpleImage from "../SimpleImage";
import LoadingComponent from "../Loading";
import { apiClient } from "../../services/api";
import ErroComponent from "../Erro";

const GallerySection = () => {
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState(0);

  // 🔄 Carregar fotos da API com apiClient
  const carregarFotos = async () => {
    try {
      setLoading(true);
      setErro("");

      
      const data = await apiClient.get("/fotos/galeria/edicoes_anteriores");

      if (data.sucesso && data.dados.fotos) {
        setFotos(data.dados.fotos);
       
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

  useEffect(() => {
    carregarFotos();
  }, []);

  const construirUrlFoto = (foto) => {
    if (foto.urlFoto?.startsWith("/uploads/")) {
      return `http://localhost:8000${foto.urlFoto}`;
    }
    return foto.urlFoto || "/api/placeholder/800/500";
  };

  const proximaFoto = () =>
    setCurrentPhoto((prev) => (prev + 1) % fotos.length);
  const fotoAnterior = () =>
    setCurrentPhoto((prev) => (prev - 1 + fotos.length) % fotos.length);

  if (loading) {
    return (
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 text-center">
          <LoadingComponent loading="Carregando galeria..." />
        </div>
      </section>
    );
  }

  // Erro
  if (erro) {
    return <ErroComponent mensagem={erro} onTentarNovamente={carregarFotos} />;
  }

  // Nenhuma foto
  if (fotos.length === 0) {
    return (
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 text-center">
          <div className="text-gray-400">
            <Trophy size={48} className="mx-auto mb-4" />
            <p className="text-xl">Galeria em breve...</p>
          </div>
        </div>
      </section>
    );
  }

  const fotoAtual = fotos[currentPhoto];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        {/* Título da Seção */}
        <div className="text-center mb-16">
          <h6 className="text-4xl md:text-5xl font-black text-yellow-400 mb-4">
            Galeria de Memorias
          </h6>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Reviva os melhores momentos das edições anteriores do Trilhão dos
            Amigos!
          </p>
        </div>

        {/* Foto principal */}
        <div className="max-w-6xl mx-auto relative mb-8 group">
          <div className="aspect-video rounded-2xl overflow-hidden bg-gray-800">
            <SimpleImage
              src={construirUrlFoto(fotoAtual)}
              alt={fotoAtual.titulo}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{fotoAtual.titulo}</h3>
                {fotoAtual.descricao && (
                  <p className="text-gray-300 text-lg">{fotoAtual.descricao}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botões de navegação */}
          {fotos.length > 1 && (
            <>
              <button
                onClick={fotoAnterior}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all transform hover:scale-110"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={proximaFoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all transform hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Indicador */}
          {fotos.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentPhoto + 1} / {fotos.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {fotos.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {fotos.slice(0, 8).map((foto, index) => (
              <button
                key={foto.id}
                onClick={() => setCurrentPhoto(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all transform hover:scale-105 ${
                  index === currentPhoto
                    ? "border-yellow-400 shadow-lg shadow-yellow-400/25"
                    : "border-transparent hover:border-gray-400"
                }`}
              >
                <SimpleImage
                  src={construirUrlFoto(foto)}
                  alt={foto.titulo}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}

            {/* Mais fotos */}
            {fotos.length > 8 && (
              <div className="aspect-square rounded-lg bg-gray-800 border-2 border-gray-600 flex items-center justify-center">
                <span className="text-gray-400 text-sm font-bold">
                  +{fotos.length - 8}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
