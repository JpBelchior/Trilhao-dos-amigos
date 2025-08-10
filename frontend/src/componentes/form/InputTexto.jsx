import React from "react";

const InputTexto = ({
  label,
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  icon: Icon,
  type = "text",
  maxLength,
  // Estilos customizáveis
  variant = "default", // "default", "admin"
  className = "",
  labelClassName = "",
  inputClassName = "",
}) => {
  // Estilos base dependendo da variante
  const getVariantStyles = () => {
    switch (variant) {
      case "admin":
        return {
          label: "block text-gray-300 mb-2 font-semibold",
          input: disabled
            ? "w-full border rounded-xl px-4 py-3 text-white focus:outline-none transition-all bg-gray-800 border-gray-700 cursor-not-allowed"
            : "w-full border rounded-xl px-4 py-3 text-white focus:outline-none transition-all bg-black/50 border-gray-600 focus:border-yellow-400",
        };
      case "default":
      default:
        return {
          label: "block text-gray-300 mb-2",
          input:
            "w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none",
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div className={className}>
      <label className={labelClassName || variantStyles.label}>
        {Icon && <Icon className="inline mr-2" size={16} />}
        {label} {required && "*"}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={inputClassName || variantStyles.input}
      />
    </div>
  );
};

export default InputTexto;
