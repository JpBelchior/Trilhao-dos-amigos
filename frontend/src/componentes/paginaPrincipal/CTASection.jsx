import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ShoppingBag } from "lucide-react";
import LoteBanner from "./LoteBanner";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950 to-black" />

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-yellow-400 via-white to-green-400 bg-clip-text text-transparent">
            FAÇA PARTE DESSA AVENTURA
          </h2>

          <p className="text-2xl md:text-3xl mb-12 text-gray-300 leading-relaxed">
            50km de trilha, desafios formidáveis e a chance de
            <span className="text-yellow-400 font-semibold"> marcar seu nome </span>
            na Serra da Mantiqueira!
          </p>

          <LoteBanner />

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-6">
            <button
              className="group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-black px-8 py-3 rounded-3xl text-2xl transition-all transform hover:scale-110  hover:shadow-yellow-400/25 flex items-center"
              onClick={() => navigate("/cadastro")}
            >
              <Trophy className="mr-4 group-hover:animate-pulse" size={32} />
              GARANTIR MINHA VAGA
            </button>

            <button
              className="group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-black px-8 py-3 rounded-3xl text-2xl transition-all transform hover:scale-110  hover:shadow-yellow-400/25 flex items-center"
              onClick={() => navigate("/comprar-camisa")}
            >
              <ShoppingBag className="mr-3 group-hover:animate-pulse" size={26} />
              COMPRAR CAMISA
            </button>
          </div>

          {/* Texto Final Motivacional */}
          <div className="mt-10 max-w-2xl mx-auto">
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
