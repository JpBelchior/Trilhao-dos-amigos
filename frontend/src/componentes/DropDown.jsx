// frontend/src/componentes/NavDropdown.jsx
import React from "react";
import { ChevronDown } from "lucide-react";

const NavDropdown = ({
  isOpen,
  toggle,
  isActive,
  icon: Icon,
  label,
  options,
  onOptionClick,
  dropdownRef,
}) => {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggle}
        className={`group flex items-center px-6 py-3 rounded-xl transition-all font-semibold transform hover:scale-105 ${
          isActive()
            ? "bg-yellow-500 text-black shadow-lg shadow-yellow-400/25"
            : "text-white hover:bg-yellow-500 hover:text-black hover:shadow-lg hover:shadow-yellow-400/25"
        }`}
      >
        <Icon className="mr-2 group-hover:animate-bounce" size={20} />
        {label}
        <ChevronDown
          className={`ml-2 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          size={16}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-black/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-yellow-400/20 overflow-hidden z-50">
          <div className="py-2">
            {options.map((option, index) => (
              <React.Fragment key={option.path}>
                <button
                  onClick={() => onOptionClick(option.path)}
                  className={`w-full px-6 py-3 text-left transition-all hover:bg-yellow-500/20 hover:text-yellow-400 flex items-center ${
                    option.isActive
                      ? "bg-yellow-500/30 text-yellow-400 border-r-2 border-yellow-400"
                      : "text-white"
                  }`}
                >
                  {option.icon && <option.icon className="mr-3" size={18} />}
                  {option.label}
                </button>

                {/* Renderizar divider se não for a última opção e tiver divider */}
                {option.dividerAfter && index < options.length - 1 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent my-2"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavDropdown;
