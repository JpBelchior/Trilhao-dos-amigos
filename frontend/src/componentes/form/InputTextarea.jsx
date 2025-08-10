import React from "react";

const InputTextarea = ({
  label,
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  icon: Icon,
  rows = 4,
  maxLength,
  // Estilos customizáveis
  variant = "default", // "default", "admin"
  className = "",
  labelClassName = "",
  textareaClassName = "",
}) => {
  // Estilos base dependendo da variante
  const getVariantStyles = () => {
    switch (variant) {
      case "admin":
        return {
          label: "block text-gray-300 mb-2 font-semibold",
          textarea: disabled
            ? "w-full border rounded-xl px-4 py-3 text-white focus:outline-none resize-none transition-all bg-gray-800 border-gray-700 cursor-not-allowed"
            : "w-full border rounded-xl px-4 py-3 text-white focus:outline-none resize-none transition-all bg-black/50 border-gray-600 focus:border-yellow-400",
        };
      case "default":
      default:
        return {
          label: "block text-gray-300 mb-2",
          textarea:
            "w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none resize-none",
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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={textareaClassName || variantStyles.textarea}
      />
    </div>
  );
};

export default InputTextarea;
