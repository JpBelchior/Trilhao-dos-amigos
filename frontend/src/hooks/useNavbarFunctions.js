import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Hook customizado com as funções reutilizáveis da Navbar
 */
export const useNavbarFunctions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fechar menu ao mudar de rota
  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  const toggleMenu = () => setMenuAberto((prev) => !prev);

  const irPara = (rota) => {
    setMenuAberto(false);
    navigate(rota);
  };

  // Função para verificar se a rota está ativa (incluindo subrotas do menu dropdown)
  const isActiveInicio = () => {
    const rotasInicio = [
      "/",
      "/edicoes-anteriores",
      "/provas",
      "/informacoes-local",
    ];
    return rotasInicio.includes(location.pathname);
  };

  const isActive = (path) => location.pathname === path;

  return {
    menuAberto,
    menuRef,
    toggleMenu,
    irPara,
    isActiveInicio,
    isActive,
  };
};
