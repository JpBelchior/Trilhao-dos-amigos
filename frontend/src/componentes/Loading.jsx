// frontend/src/componentes/comum/LoadingComponent.jsx
import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Componente de loading simples para toda a aplicação
 * @param {string} loading - Mensagem de loading
 * @param {string} className - Classes CSS adicionais
 */
const LoadingComponent = ({ loading = "Carregando...", className = "" }) => {
  return (
    <div className={`min-h-screen bg-black py-20 ${className}`}>
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
