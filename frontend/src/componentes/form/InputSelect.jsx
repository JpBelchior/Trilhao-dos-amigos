import React from "react";

const InputSelect = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
  icon: Icon,
  placeholder = "Selecione...",
  // Estilos customizáveis
  variant = "default", // "default", "admin"
  className = "",
  labelClassName = "",
  selectClassName = "",
}) => {
  // Estilos base dependendo da variante
  const getVariantStyles = () => {
    switch (variant) {
      case "admin":
        return {
          label: "block text-gray-300 mb-2 font-semibold",
          select: disabled
            ? "w-full border rounded-xl px-4 py-3 text-white focus:outline-none appearance-none transition-all bg-gray-800 border-gray-700 cursor-not-allowed"
            : "w-full border rounded-xl px-4 py-3 text-white focus:outline-none appearance-none transition-all bg-black/50 border-gray-600 focus:border-yellow-400",
        };
      case "default":
      default:
        return {
          label: "block text-gray-300 mb-2",
          select:
            "w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none appearance-none",
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={selectClassName || variantStyles.select}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default InputSelect;
