import { useState, useEffect } from "react";
import { apiClient } from "../services/api";
import { formatarEdicao, calcularEdicao, calcularAnoPorEdicao } from "./useEdicao";

export function useGallery(isVisible = true) {
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const carregarFotos = async () => {
    try {
      setLoading(true);
      setErro("");
      const data = await apiClient.get("/fotos/galeria/edicoes_anteriores");
      if (data.sucesso && data.dados.fotos) {
        setFotos(data.dados.fotos);
      } else {
        setFotos([]);
      }
    } catch (error) {
      setErro("Erro ao carregar galeria");
      setFotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFotos();
  }, []);

  useEffect(() => {
    if (fotos.length <= 1) return;
    if (!isVisible) return;
    const midiaAtual = fotos[currentPhoto];
    if (midiaAtual?.tipo === "video") return; // vídeo avança pelo onEnded

    const intervalo = setInterval(() => {
      setCurrentPhoto((prev) => (prev + 1) % fotos.length);
    }, 10000);
    return () => clearInterval(intervalo);
  }, [fotos.length, currentPhoto, fotos, isVisible]);

  const proximaFoto = () =>
    setCurrentPhoto((prev) => (prev + 1) % fotos.length);

  const handleVideoEnded = () => proximaFoto();

  const fotoAnterior = () =>
    setCurrentPhoto((prev) => (prev - 1 + fotos.length) % fotos.length);

  const construirUrlFoto = (foto) => {
    if (foto?.urlFoto?.startsWith("/uploads/")) {
      return `http://localhost:8000${foto.urlFoto}`;
    }
    return foto?.urlFoto || "/api/placeholder/800/500";
  };

  const formatarBadgeEdicao = (foto) => {
    if (!foto?.edicao && !foto?.ano) return null;
    const edicaoTexto = foto.edicao
      ? formatarEdicao(foto.edicao)
      : calcularEdicao(foto.ano).edicao;
    const ano = foto.edicao
      ? calcularAnoPorEdicao(foto.edicao)
      : foto.ano;
    return ano ? `${edicaoTexto} - ${ano}` : edicaoTexto;
  };

  return {
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
  };
}
