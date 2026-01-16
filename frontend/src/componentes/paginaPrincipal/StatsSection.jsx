import React from "react";
import { Users, Mountain, Trophy, Target, Gift } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      number: "200+",
      label: "Pilotos por Edição",
      bgColor: "from-yellow-400 to-yellow-600",
      textColor: "text-yellow-400",
    },
    {
      icon: Mountain,
      number: "1.847M",
      label: "Altitude Máxima",
      bgColor: "from-green-400 to-green-600",
      textColor: "text-green-400",
    },
    {
      icon: Trophy,
      number: "R$1.000",
      label: "Prêmio Máximo",
      bgColor: "from-yellow-400 to-yellow-600",
      textColor: "text-yellow-400",
    },
    {
      icon: Target,
      number: "25KM",
      label: "Trilha Off-Road",
      bgColor: "from-green-400 to-green-600",
      textColor: "text-green-400",
    },
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <h3 className="text-4xl md:text-3xl font-black text-center text-yellow-400 mb-12">
          O QUE VOCÊ ENCONTRA NO TRILHÃO:
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div
                className={`bg-gradient-to-br ${stat.bgColor} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-all`}
              >
                <stat.icon className="text-black" size={40} />
              </div>
              <div className="text-4xl font-black text-white mb-2">
                {stat.number}
              </div>
              <div className={`${stat.textColor} font-medium`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Destaque dos Benefícios */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-900/40 to-yellow-900/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
            <h4 className="text-3xl font-black text-center text-white mb-9">
              <Gift className="inline-block mr-2 mb-2" size={30} />
              INCLUSO NA SUA INSCRIÇÃO
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-black/40 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">👕</div>
                <h5 className="text-xl font-bold text-green-400 mb-2">
                  CAMISETA OFICIAL
                </h5>
                <p className="text-gray-300">
                  Leve para casa sua camiseta exclusiva do Trilhão dos Amigos
                  totalmente gratuita!
                </p>
              </div>
              <div className="bg-black/40 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <h5 className="text-xl font-bold text-yellow-400 mb-2">
                  ALIMENTAÇÃO COMPLETA
                </h5>
                <p className="text-gray-300">
                  Café da manhã, almoço e apoio durante a trilha inclusos!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default StatsSection;
