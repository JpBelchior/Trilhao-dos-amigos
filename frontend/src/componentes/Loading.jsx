import React from "react";
import { Loader2 } from "lucide-react";

/**
 * @param {string} loading - Mensagem de loading
 * @param {string} subtitulo - Texto secundário (usado no variant pix)
 * @param {string} className - Classes CSS adicionais
 * @param {"default"|"pix"} variant - Estilo visual
 */
const LoadingComponent = ({ loading = "Carregando...", subtitulo = "", className = "", variant = "default" }) => {
  if (variant === "pix") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 flex items-center justify-center">
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 text-center max-w-md">
          <Loader2 className="animate-spin text-green-400 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">{loading}</h2>
          {subtitulo && <p className="text-gray-300">{subtitulo}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20 ${className}`}>
      <div className="container mx-auto px-6 text-center">
        <div className="text-white">
          <Loader2 className="animate-spin mx-auto mb-4" size={24} />
          <p className="text-xl">{loading}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingComponent;
