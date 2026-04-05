import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import SimpleImage from "../SimpleImage";
import LoadingComponent from "../Loading";
import ErroComponent from "../Erro";
import { useGallery } from "../../hooks/useGallery";

const GallerySection = () => {
  const {
    fotos,
    loading,
    erro,
    currentPhoto,
    setCurrentPhoto,
    carregarFotos,
    proximaFoto,
    fotoAnterior,
    handleVideoEnded,
    construirUrlFoto,
    formatarBadgeEdicao,
  } = useGallery();

  if (loading) {
    return (
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 text-center">
          <LoadingComponent loading="Carregando galeria..." />
        </div>
      </section>
    );
  }

  if (erro) {
    return <ErroComponent mensagem={erro} onTentarNovamente={carregarFotos} />;
  }

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
  const badgeEdicao = formatarBadgeEdicao(fotoAtual);

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
            {fotoAtual.tipo === "video" ? (
              <video
                key={fotoAtual.id}
                src={construirUrlFoto(fotoAtual)}
                className="w-full h-full object-cover"
                controls
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={handleVideoEnded}
              />
            ) : (
              <SimpleImage
                src={construirUrlFoto(fotoAtual)}
                alt={fotoAtual.titulo}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            )}

            {/* Overlay com Edição, Título e Descrição */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
              <div className="absolute bottom-6 left-6 text-white max-w-2xl">
                {/* Badge da Edição */}
                {badgeEdicao && (
                  <div className="mb-3">
                    <span className="bg-yellow-500 text-black text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                      {badgeEdicao}
                    </span>
                  </div>
                )}

                {/* Título */}
                <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                  {fotoAtual.titulo}
                </h3>

                {/* Descrição */}
                {fotoAtual.descricao && (
                  <p className="text-gray-200 text-base md:text-lg drop-shadow-lg">
                    {fotoAtual.descricao}
                  </p>
                )}

                {/* Stats */}
                {fotoAtual.stats && (
                  <p className="text-yellow-400 text-sm md:text-base mt-2 font-semibold drop-shadow-lg">
                    {fotoAtual.stats}
                  </p>
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
                aria-label="Foto anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={proximaFoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all transform hover:scale-110"
                aria-label="Próxima foto"
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
                aria-label={`Ver ${foto.titulo}`}
              >
                {foto.tipo === "video" ? (
                  <video
                    src={construirUrlFoto(foto)}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                ) : (
                  <SimpleImage
                    src={construirUrlFoto(foto)}
                    alt={foto.titulo}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
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
