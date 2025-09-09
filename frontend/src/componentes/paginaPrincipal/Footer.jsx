// src/componentes/Footer.jsx
import React from "react";
import { Mountain } from "lucide-react";
import { useEdicao } from "../../hooks/useEdicao";

const Footer = () => {
  const { edicaoAtual } = useEdicao();

  return (
    <footer className="bg-black border-t border-yellow-400/20 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Mountain className="text-yellow-400 mr-3" size={32} />
            <span className="text-2xl font-black text-white tracking-wider">
              TRILHÃO DOS AMIGOS
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            A maior aventura off-road da Serra da Mantiqueira
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>📍 Itamonte - MG</span>
            <span>📞 (35) 9999-9999</span>
            <span>📧 contato@trilhao.com.br</span>
          </div>
          <div className="mt-8 text-xs text-gray-600">
            © {edicaoAtual?.ano || new Date().getFullYear()} Trilhão Itamonte.
            Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
