// frontend/src/hooks/useImageRetry.js
import { useState, useCallback } from "react";

export const useImageRetry = (maxRetries = 3) => {
  const [tentativas, setTentativas] = useState(new Map());
  const [imagensComErro, setImagensComErro] = useState(new Set());

  const handleImageError = useCallback(
    (imageId, imgElement, fallbackSrc) => {
      const tentativasAtuais = tentativas.get(imageId) || 0;

      if (tentativasAtuais < maxRetries) {
        // Incrementa tentativas e tenta novamente
        setTentativas((prev) =>
          new Map(prev).set(imageId, tentativasAtuais + 1)
        );

        // Tenta novamente após delay simples
        setTimeout(() => {
          if (imgElement) {
            imgElement.src =
              imgElement.src.split("?")[0] + `?retry=${tentativasAtuais + 1}`;
          }
        }, 1000);
      } else {
        // Após 3 tentativas, marca como erro e usa fallback
        setImagensComErro((prev) => new Set([...prev, imageId]));
        if (imgElement) {
          imgElement.src = fallbackSrc;
        }
      }
    },
    [tentativas, maxRetries]
  );

  const hasImageError = useCallback(
    (imageId) => {
      return imagensComErro.has(imageId);
    },
    [imagensComErro]
  );

  const resetImage = useCallback((imageId) => {
    setTentativas((prev) => {
      const newMap = new Map(prev);
      newMap.delete(imageId);
      return newMap;
    });
    setImagensComErro((prev) => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  }, []);

  return {
    handleImageError,
    hasImageError,
    resetImage,
  };
};
