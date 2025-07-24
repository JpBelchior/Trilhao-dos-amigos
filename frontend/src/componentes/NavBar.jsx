import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mountain, UserPlus, Users } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Função para verificar se a rota está ativa
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black/95 backdrop-blur-md shadow-2xl fixed top-0 left-0 right-0 z-50 border-b border-yellow-400/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Moderno */}
          <div
            className="flex items-center group cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <Mountain
                className="text-yellow-400 mr-3 transform transition-all group-hover:scale-110 group-hover:rotate-3"
                size={40}
              />
            </div>
            <div>
              <span className="text-3xl font-black text-white tracking-wider">
                TRILHÃO DOS AMIGOS
              </span>
              <div className="text-yellow-400 text-xs font-medium tracking-widest">
                ITAMONTE • MG
              </div>
            </div>
          </div>

          {/* Menu Navigation Moderno */}
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/")}
              className={`group flex items-center px-6 py-3 rounded-xl transition-all font-semibold transform hover:scale-105 ${
                isActive("/")
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-400/25"
                  : "text-white hover:bg-yellow-500 hover:text-black hover:shadow-lg hover:shadow-yellow-400/25"
              }`}
            >
              <Mountain className="mr-2 group-hover:animate-bounce" size={20} />
              Início
            </button>

            <button
              onClick={() => navigate("/cadastro")}
              className={`group flex items-center px-6 py-3 rounded-xl transition-all font-semibold transform hover:scale-105 ${
                isActive("/cadastro")
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-400/25"
                  : "text-white hover:bg-yellow-500 hover:text-black hover:shadow-lg hover:shadow-yellow-400/25"
              }`}
            >
              <UserPlus className="mr-2" size={20} />
              Cadastre-se
            </button>

            <button
              onClick={() => navigate("/inscritos")}
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
