import React from "react";
import { ChevronDown } from "lucide-react";

const ExpandToggleButton = ({
  isExpanded,
  onToggle,
  expandedText = "Ocultar",
  collapsedText = "Mostrar",
  label = "Detalhes",
  icon: Icon = null,
  variant = "default", // default, admin, yellow, green
  size = "medium", // small, medium, large
  disabled = false,
  className = "",
}) => {
  // Variantes de estilo
  const variants = {
    default: "bg-gray-600 hover:bg-gray-700 text-white",
    admin: "bg-blue-600 hover:bg-blue-700 text-white",
    yellow: "bg-yellow-500 hover:bg-yellow-600 text-black font-bold",
    green: "bg-green-600 hover:bg-green-700 text-white",
  };

  // Tamanhos
  const sizes = {
    small: "px-3 py-2 text-sm",
    medium: "px-4 py-2",
    large: "px-6 py-3 text-lg",
  };

  const baseClasses = `
    flex items-center justify-center
    rounded-xl transition-all duration-200
    transform hover:scale-105
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  return (
    <button onClick={onToggle} disabled={disabled} className={baseClasses}>
      {Icon && <Icon className="mr-2" size={size === "large" ? 24 : 20} />}

      <span className="mr-2">
        {isExpanded ? expandedText : collapsedText} {label}
      </span>

      <ChevronDown
        className={`transition-transform duration-200 ${
          isExpanded ? "rotate-180" : ""
        }`}
        size={size === "large" ? 20 : 16}
      />
    </button>
  );
};

export default ExpandToggleButton;
