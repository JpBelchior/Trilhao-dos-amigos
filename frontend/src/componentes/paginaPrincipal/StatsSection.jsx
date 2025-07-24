// src/componentes/paginaPrincipal/StatsSection.jsx
import React from "react";
import { Users, Mountain, Trophy, Target } from "lucide-react";

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
      label: "Trilha",
      bgColor: "from-green-400 to-green-600",
      textColor: "text-green-400",
    },
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <h3 className="text-4xl md:text-3xl font-black text-center text-yellow-400 mb-12">
          O QUE VOCÊ ENCONTRA NO TRILHÃO :
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
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
      </div>
    </section>
  );
};

export default StatsSection;
