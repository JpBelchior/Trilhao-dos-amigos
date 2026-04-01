import React, { useState } from "react";
import {
  Mountain,
  UserPlus,
  Users,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

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

  const [mobileOpen, setMobileOpen] = useState(false);

  const inicioOptions = [
    { path: "/", label: "Página Principal", isActive: isActive("/") },
    { path: "/edicoes-anteriores", label: "Edições Anteriores", isActive: isActive("/edicoes-anteriores") },
    { path: "/provas", label: "Provas e Trajetos", isActive: isActive("/provas") },
    { path: "/informacoes-local", label: "Informações do Local", isActive: isActive("/informacoes-local") },
  ];

  const inscritosOptions = [
    { path: "/inscritos", label: "Lista de Inscritos", icon: Users, isActive: isActive("/inscritos") },
    { path: "/estatisticas", label: "Estatísticas", icon: BarChart3, isActive: isActive("/estatisticas") },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-yellow-400/20 shadow-2xl">
      <div className="container mx-auto px-4 lg:px-6">

        {/* HEADER */}
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* LOGO */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => irPara("/")}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 lg:w-16 lg:h-16 object-contain"
            />

            <div>
              <span className="text-lg lg:text-3xl font-black text-white">
                TRILHÃO DOS AMIGOS
              </span>
              <div className="text-yellow-500 text-xs">
                ITAMONTE • MG
              </div>
            </div>
          </div>

          {/* MENU DESKTOP */}
          <div className="hidden lg:flex space-x-2">

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

            <button
              onClick={() => irPara("/cadastro")}
              className="px-6 py-3 rounded-xl bg-yellow-500 text-black font-semibold"
            >
              <UserPlus className="inline mr-2" size={18} />
              Cadastre-se
            </button>

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

          {/* BOTÃO MOBILE */}
          <button
            className="lg:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {mobileOpen && (
        <div className="lg:hidden bg-black flex flex-col px-6 py-4 space-y-3 text-white">
          {[...inicioOptions, ...inscritosOptions].map((item) => (
            <button
              key={item.path}
              onClick={() => {
                irPara(item.path);
                setMobileOpen(false);
              }}
              className="text-left"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
