// frontend/src/componentes/SimpleImage.jsx
import React, { useState, useRef } from "react";
import { useImageRetry } from "../hooks/useImageRetry";

const SimpleImage = ({
  src,
  fallbackSrc = "/api/placeholder/300/200",
  alt,
  className = "",
  imageId,
}) => {
  const [loading, setLoading] = useState(true);
  const imgRef = useRef(null);

  const { handleImageError, hasImageError } = useImageRetry(3);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    handleImageError(imageId, imgRef.current, fallbackSrc);
  };

  const temErro = hasImageError(imageId);

  return (
    <div className={`relative ${className}`}>
      {/* Loading simples - só um spinner */}
      {loading && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
        </div>
      )}

      {/* Erro simples - só um ícone */}
      {temErro && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-gray-500 text-xs">❌</div>
        </div>
      )}

      {/* Imagem */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full transition-opacity ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
};

export default SimpleImage;
