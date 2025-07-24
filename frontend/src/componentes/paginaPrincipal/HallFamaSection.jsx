// src/componentes/paginaPrincipal/HallFamaSection.jsx
import React from "react";
import { Trophy, Mountain, Star } from "lucide-react";

const HallFamaSection = () => {
  const campeoes = [
    {
      titulo: "CAMPEÃO DA TRILHA",
      nome: "João Silva",
      resultado: "2h 47min 23s",
      edicao: "15ª Edição - 2024",
      moto: "Honda CRF 450X",
      icon: Trophy,
      bgColor: "from-yellow-900/40 to-black/60",
      borderColor: "border-yellow-400/30",
      iconBg: "from-yellow-400 to-yellow-600",
      titleColor: "text-yellow-400",
      resultColor: "text-yellow-400",
      motoColor: "text-green-400",
    },
    {
      titulo: "REI DO BARRANCO",
      nome: "Carlos Mendes",
      resultado: "47.2 metros",
      edicao: "14ª Edição - 2023",
      moto: "KTM 350 EXC-F",
      icon: Mountain,
      bgColor: "from-green-900/40 to-black/60",
      borderColor: "border-green-400/30",
      iconBg: "from-green-400 to-green-600",
      titleColor: "text-green-400",
      resultColor: "text-green-400",
      motoColor: "text-yellow-400",
    },
    {
      titulo: "MAIS TÍTULOS",
      nome: "Pedro Costa",
      resultado: "3 Títulos",
      edicao: "2 Subidas no barranco e 1 Vitória na trilha",
      moto: "Honda Bros 160",
      icon: Star,
      bgColor: "from-green-900/40 to-black/60",
      borderColor: "border-green-400/30",
      iconBg: "from-yellow-400 to-green-400",
      titleColor: "text-green-400",
      resultColor: "text-yellow-400",
      motoColor: "text-green-400",
    },
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-white mb-4">
            HALL DA <span className="text-yellow-400">FAMA</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Últimos vencedores dos prêmios
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {campeoes.map((campeao, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${campeao.bgColor} backdrop-blur-lg rounded-3xl p-8 ${campeao.borderColor} text-center`}
            >
              <div
                className={`bg-gradient-to-br ${campeao.iconBg} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6`}
              >
                <campeao.icon className="text-black" size={40} />
              </div>
              <h3 className={`text-2xl font-black ${campeao.titleColor} mb-4`}>
                {campeao.titulo}
              </h3>
              <div className="text-white space-y-3">
                <p className="text-3xl font-black">{campeao.nome}</p>
                <p className={`font-bold text-xl ${campeao.resultColor}`}>
                  {campeao.resultado}
                </p>
                <p className="text-sm text-gray-400">{campeao.edicao}</p>
                <div className="bg-black/40 rounded-xl p-3 mt-4">
                  <p className={`font-semibold ${campeao.motoColor}`}>
                    {campeao.moto}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HallFamaSection;
