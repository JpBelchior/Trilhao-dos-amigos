// src/componentes/paginaPrincipal/CTASection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-yellow-400 via-white to-green-400 bg-clip-text text-transparent">
            FAÇA PARTE DESSA AVENTURA
          </h2>

          <p className="text-2xl md:text-3xl mb-12 text-gray-300 leading-relaxed">
            25km de trilha épica, desafios impossíveis e a chance de
            <span className="text-yellow-400 font-bold">
              {" "}
              eternizar seu nome{" "}
            </span>
            na Serra da Mantiqueira!
          </p>

          {/* CTA Buttons Épicos */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <button
              className="group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-black px-16 py-6 rounded-3xl text-2xl transition-all transform hover:scale-110 hover:shadow-2xl hover:shadow-yellow-400/25 flex items-center"
              onClick={() => navigate("/cadastro")}
            >
              <Trophy className="mr-4 group-hover:animate-pulse" size={32} />
              GARANTIR MINHA VAGA
            </button>
          </div>

          {/* Texto Final Motivacional */}
          <div className="mt-16 max-w-3xl mx-auto">
            <p className="text-xl text-gray-400 leading-relaxed">
              <span className="text-white font-bold">
                Só os mais corajosos ousam tentar.
              </span>
            </p>

            <div className="mt-8 text-2xl font-black">
              <span className="text-white">VOCÊ É CAPAZ?</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
