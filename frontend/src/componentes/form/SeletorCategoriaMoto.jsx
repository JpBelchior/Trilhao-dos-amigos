// frontend/src/componentes/Form/SeletorCategoriaMoto.jsx
import React from "react";
import { Bike } from "lucide-react";

const SeletorCategoriaMoto = ({
  value,
  onChange,
  disabled = false,
  showLabel = true,
  labelClassName = "block text-gray-300 mb-4",
  containerClassName = "grid md:grid-cols-2 gap-4",
  size = "large", // "large", "medium", "small"
}) => {
  // Tamanhos diferentes para diferentes contextos
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          button: "p-3 rounded-xl",
          title: "text-sm font-bold",
          description: "text-xs",
          icon: 14,
        };
      case "medium":
        return {
          button: "p-4 rounded-xl",
          title: "text-lg font-bold",
          description: "text-xs",
          icon: 16,
        };
      case "large":
      default:
        return {
          button: "p-6 rounded-2xl",
          title: "text-xl font-bold",
          description: "text-sm",
          icon: 16,
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div>
      {showLabel && (
        <label className={labelClassName}>
          <Bike className="inline mr-2" size={sizeClasses.icon} />
          Categoria da Moto *
        </label>
      )}

      <div className={containerClassName}>
        {/* NACIONAL */}
        <button
          type="button"
          onClick={() => onChange("nacional")}
          disabled={disabled}
          className={`${sizeClasses.button} border-2 transition-all ${
            value === "nacional"
              ? "border-green-400 bg-green-900/30"
              : "border-gray-600 bg-black/30"
          } ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : "hover:border-gray-400 cursor-pointer"
          }`}
        >
          <h3 className={`${sizeClasses.title} text-green-400 mb-2`}>
            🇧🇷 NACIONAL
          </h3>
          <p className={`text-gray-300 ${sizeClasses.description}`}>
            Bros, Lander, Crosser, XTZ, XR, NX, XT, CG, Titan
          </p>
        </button>

        {/* IMPORTADA */}
        <button
          type="button"
          onClick={() => onChange("importada")}
          disabled={disabled}
          className={`${sizeClasses.button} border-2 transition-all ${
            value === "importada"
              ? "border-yellow-400 bg-yellow-900/30"
              : "border-gray-600 bg-black/30"
          } ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : "hover:border-gray-400 cursor-pointer"
          }`}
        >
          <h3 className={`${sizeClasses.title} text-yellow-400 mb-2`}>
            🌍 IMPORTADA
          </h3>
          <p className={`text-gray-300 ${sizeClasses.description}`}>
            KTM, Husqvarna, Honda CRF, Yamaha WR, Kawasaki KLX
          </p>
        </button>
      </div>
    </div>
  );
};

export default SeletorCategoriaMoto;
