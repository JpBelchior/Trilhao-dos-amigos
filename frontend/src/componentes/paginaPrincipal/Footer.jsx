import React from "react";
import { Mountain } from "lucide-react";
import { useEdicao } from "../../hooks/useEdicao";

const Footer = () => {
  const { edicaoAtual } = useEdicao();

  return (
    <footer className="bg-black border-t border-yellow-400/20 py-8 lg:py-12">
      <div className="container mx-auto px-4 lg:px-6">

        <div className="text-center space-y-5">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <Mountain className="text-yellow-400" size={24} />

            <span className="text-lg lg:text-2xl font-black text-white tracking-wider">
              TRILHÃO DOS AMIGOS
            </span>
          </div>

          {/* Descrição */}
          <p className="text-gray-400 text-sm lg:text-base">
            A maior aventura off-road da Serra da Mantiqueira
          </p>

          {/* Contatos */}
          <div
            className="
              flex 
              flex-col 
              gap-2 
              text-sm 
              text-gray-500
              lg:flex-row 
              lg:justify-center 
              lg:gap-8
            "
          >
            <span>📍 Itamonte - MG</span>
            <span>📞 (35) 9999-9999</span>
            <span>📧 contato@trilhao.com.br</span>
          </div>

          {/* Direitos */}
          <div className="text-xs text-gray-600 pt-4 border-t border-white/10">
            © {edicaoAtual?.ano || new Date().getFullYear()} Trilhão Itamonte. Todos os direitos reservados.
          </div>

          <div className="text-xs text-gray-600">
            Versão 1.0.0
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
