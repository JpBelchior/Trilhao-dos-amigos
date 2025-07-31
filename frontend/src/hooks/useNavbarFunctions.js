// frontend/src/hooks/useNavbarFunctions.js
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Hook customizado com as funções reutilizáveis da Navbar
 */
export const useNavbarFunctions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [inscritoAberto, setInscritoAberto] = useState(false);
  const menuRef = useRef(null);
  const inscritoRef = useRef(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
      if (inscritoRef.current && !inscritoRef.current.contains(event.target)) {
        setInscritoAberto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fechar menu ao mudar de rota
  useEffect(() => {
    setMenuAberto(false);
    setInscritoAberto(false);
  }, [location.pathname]);

  const toggleMenu = () => setMenuAberto((prev) => !prev);
  const toggleInscrito = () => setInscritoAberto((prev) => !prev);

  const irPara = (rota) => {
    setMenuAberto(false);
    setInscritoAberto(false);
    navigate(rota);
  };

  // Função para verificar se as rotas do dropdown "Início" estão ativas
  const isActiveInicio = () => {
    const rotasInicio = [
      "/",
      "/edicoes-anteriores",
      "/provas",
      "/informacoes-local",
    ];
    return rotasInicio.includes(location.pathname);
  };

  // Função para verificar se as rotas do dropdown "Inscritos" estão ativas
  const isActiveInscritos = () => {
    const rotasInscritos = ["/inscritos", "/estatisticas"];
    return rotasInscritos.includes(location.pathname);
  };

  const isActive = (path) => location.pathname === path;

  return {
    menuAberto,
    inscritoAberto,
    menuRef,
    inscritoRef,
    toggleMenu,
    toggleInscrito,
    irPara,
    isActiveInicio,
    isActiveInscritos,
    isActive,
  };
};
