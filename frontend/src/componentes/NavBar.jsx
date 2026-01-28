import React from "react";
import { Mountain, UserPlus, Users, BarChart3 } from "lucide-react";
import { useNavbarFunctions } from "../hooks/useNavbarFunctions";
import NavDropdown from "./DropDown";

const Navbar = () => {
  const {
    menuAberto,
    menuRef,
    inscritoAberto,
    inscritoRef,
    toggleMenu,
    toggleInscrito,
    irPara,
    isActiveInicio,
    isActiveInscritos,
    isActive,
  } = useNavbarFunctions();


  const inicioOptions = [
    {
      path: "/",
      label: "Página Principal",  
      isActive: isActive("/"),
      dividerAfter: true,
    },
    {
      path: "/edicoes-anteriores",
      label: "Edições Anteriores",
      isActive: isActive("/edicoes-anteriores"),
    },
    {
      path: "/provas",
      label: "Provas e Trajetos",
      isActive: isActive("/provas"),
    },
    {
      path: "/informacoes-local",
      label: "Informações do Local",
      isActive: isActive("/informacoes-local"),
    },
  ];

  
  const inscritosOptions = [
    {
      path: "/inscritos",
      label: "Lista de Inscritos",
      icon: Users,
      isActive: isActive("/inscritos"),
      dividerAfter: true,
    },
    {
      path: "/estatisticas",
      label: "Estatísticas",
      icon: BarChart3,
      isActive: isActive("/estatisticas"),
    },
  ];

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
            <NavDropdown
              isOpen={menuAberto}
              toggle={toggleMenu}
              isActive={isActiveInicio}
              icon={Mountain}
              label="Início"
              options={inicioOptions}
              onOptionClick={irPara}
              dropdownRef={menuRef}
            />

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

            {/* Dropdown Menu - Inscritos */}
            <NavDropdown
              isOpen={inscritoAberto}
              toggle={toggleInscrito}
              isActive={isActiveInscritos}
              icon={Users}
              label="Inscritos"
              options={inscritosOptions}
              onOptionClick={irPara}
              dropdownRef={inscritoRef}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
