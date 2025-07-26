// frontend/src/componentes/NavBar.jsx
import React from "react";
import { Mountain, UserPlus, Users, ChevronDown } from "lucide-react";
import { useNavbarFunctions } from "../hooks/useNavbarFunctions";

const Navbar = () => {
  const { menuAberto, menuRef, toggleMenu, irPara, isActiveInicio, isActive } =
    useNavbarFunctions();

  return (
    <nav className="bg-black/95 backdrop-blur-md shadow-2xl fixed top-0 left-0 right-0 z-50 border-b border-yellow-400/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Moderno */}
          <div
            className="flex items-center group cursor-pointer"
            onClick={() => irPara("/")}
          >
            <div className="relative -top-1 -left-2 w-12 h-12 bg-yellow-500 rounded-full shadow-lg shadow-yellow-400/25 transition-transform transform group-hover:scale-110">
              <img
                src="/assets/moto.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <Mountain
                className="w-8 h-8 text-black absolute inset-0 m-auto hidden"
                size={32}
              />
            </div>
            <div>
              <span className="text-3xl font-black text-white tracking-wider">
                TRILHÃO DOS AMIGOS
              </span>
              <div className="text-yellow-500 text-xs font-medium tracking-widest">
                ITAMONTE • MG
              </div>
            </div>
          </div>

          {/* Menu Navigation Moderno */}
          <div className="flex space-x-2">
            {/* Dropdown Menu - Início */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className={`group flex items-center px-6 py-3 rounded-xl transition-all font-semibold transform hover:scale-105 ${
                  isActiveInicio()
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-400/25"
                    : "text-white hover:bg-yellow-500 hover:text-black hover:shadow-lg hover:shadow-yellow-400/25"
                }`}
              >
                <Mountain
                  className="mr-2 group-hover:animate-bounce"
                  size={20}
                />
                Início
                <ChevronDown
                  className={`ml-2 transition-transform duration-200 ${
                    menuAberto ? "rotate-180" : ""
                  }`}
                  size={16}
                />
              </button>

              {/* Dropdown Menu */}
              {menuAberto && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-black/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-yellow-400/20 overflow-hidden z-50">
                  <div className="py-2">
                    {/* Opção Padrão - Página Principal */}
                    <button
                      onClick={() => irPara("/")}
                      className={`w-full px-6 py-3 text-left transition-all hover:bg-yellow-500/20 hover:text-yellow-400 flex items-center ${
                        isActive("/")
                          ? "bg-yellow-500/30 text-yellow-400 border-r-2 border-yellow-400"
                          : "text-white"
                      }`}
                    >
                      <Mountain className="mr-3" size={18} />
                      Página Principal
                    </button>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent my-2"></div>

                    {/* Outras Opções */}
                    <button
                      onClick={() => irPara("/edicoes-anteriores")}
                      className={`w-full px-6 py-3 text-left transition-all hover:bg-yellow-500/20 hover:text-yellow-400 flex items-center ${
                        isActive("/edicoes-anteriores")
                          ? "bg-yellow-500/30 text-yellow-400 border-r-2 border-yellow-400"
                          : "text-white"
                      }`}
                    >
                      Edições Anteriores
                    </button>

                    <button
                      onClick={() => irPara("/provas")}
                      className={`w-full px-6 py-3 text-left transition-all hover:bg-yellow-500/20 hover:text-yellow-400 flex items-center ${
                        isActive("/provas")
                          ? "bg-yellow-500/30 text-yellow-400 border-r-2 border-yellow-400"
                          : "text-white"
                      }`}
                    >
                      Provas e Trajetos
                    </button>

                    <button
                      onClick={() => irPara("/informacoes-local")}
                      className={`w-full px-6 py-3 text-left transition-all hover:bg-yellow-500/20 hover:text-yellow-400 flex items-center ${
                        isActive("/informacoes-local")
                          ? "bg-yellow-500/30 text-yellow-400 border-r-2 border-yellow-400"
                          : "text-white"
                      }`}
                    >
                      Informações do Local
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cadastre-se */}
            <button
              onClick={() => irPara("/cadastro")}
              className={`group flex items-center px-6 py-3 rounded-xl transition-all font-semibold transform hover:scale-105 ${
                isActive("/cadastro")
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-400/25"
                  : "text-white hover:bg-yellow-500 hover:text-black hover:shadow-lg hover:shadow-yellow-400/25"
              }`}
            >
              <UserPlus className="mr-2" size={20} />
              Cadastre-se
            </button>

            {/* Veja os Inscritos */}
            <button
              onClick={() => irPara("/inscritos")}
              className={`group flex items-center px-6 py-3 rounded-xl transition-all font-semibold transform hover:scale-105 ${
                isActive("/inscritos")
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-400/25"
                  : "text-white hover:bg-yellow-500 hover:text-black hover:shadow-lg hover:shadow-yellow-400/25"
              }`}
            >
              <Users className="mr-2" size={20} />
              Veja os Inscritos
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
