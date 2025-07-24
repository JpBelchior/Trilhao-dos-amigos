// src/componentes/paginaPrincipal/EstruturaSection.jsx
import React from "react";
import { MapPin, Utensils, Calendar } from "lucide-react";

const EstruturaSection = () => {
  const alimentacao = [
    { item: "🍖 Churrasquinho", preco: "R$ 8" },
    { item: "🌭 Cachorro-quente", preco: "R$ 6" },
    { item: "🥪 Sanduíche Natural", preco: "R$ 10" },
    { item: "🧊 Bebidas Geladas", preco: "R$ 4" },
    { item: "☕ Café da Roça", preco: "R$ 3" },
    { item: "🍰 Doces Caseiros", preco: "R$ 5" },
  ];

  const infraestrutura = [
    { icon: "🏕️", item: "Área de Camping", color: "text-green-400" },
    { icon: "🚿", item: "Banheiros Completos", color: "text-yellow-400" },
    { icon: "🅿️", item: "Estacionamento", color: "text-green-400" },
    { icon: "🏥", item: "Primeiros Socorros", color: "text-yellow-400" },
    { icon: "🔧", item: "Oficina Básica", color: "text-green-400" },
    { icon: "🎵", item: "Som Ambiente", color: "text-yellow-400" },
    { icon: "🏆", item: "Palco de Premiação", color: "text-green-400" },
  ];

  const cronogramaSabado = [
    { horario: "07:00", atividade: "🚪 Abertura dos portões", destaque: false },
    { horario: "08:00", atividade: "☕ Café da manhã", destaque: false },
    { horario: "09:00", atividade: "🔧 Verificação técnica", destaque: false },
    { horario: "10:30", atividade: "🏁 LARGADA DA TRILHA", destaque: true },
    { horario: "14:00", atividade: "🍖 Almoço", destaque: false },
    { horario: "15:30", atividade: "⛰️ PROVA DA SUBIDA", destaque: true },
  ];

  const cronogramaDomingo = [
    { horario: "08:00", atividade: "☕ Café da manhã", destaque: false },
    { horario: "09:00", atividade: "👨‍👩‍👧‍👦 Passeio família", destaque: false },
    { horario: "11:00", atividade: "🏆 PREMIAÇÃO", destaque: true },
    { horario: "12:00", atividade: "🎉 Confraternização", destaque: false },
    { horario: "14:00", atividade: "👋 Encerramento", destaque: false },
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-white mb-4">
            BASE DE <span className="text-yellow-400">OPERAÇÕES</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Estrutura completa para uma experiência inesquecível
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Localização */}
          <div className="group bg-gradient-to-br from-green-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 hover:border-green-400/60 transition-all transform hover:scale-105">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all">
              <MapPin className="text-black" size={40} />
            </div>
            <h3 className="text-2xl font-black text-white mb-6 text-center">
              LOCALIZAÇÃO
            </h3>
            <div className="text-gray-300 space-y-3 text-center">
              <p className="text-yellow-400 font-bold text-lg">
                Centro de Eventos
              </p>
              <p className="text-white font-semibold">Fazenda do Trilhão</p>
              <p>Estrada da Mantiqueira, Km 15</p>
              <p>Itamonte - MG</p>
              <div className="bg-black/40 rounded-xl p-3 mt-4">
                <p className="text-green-400 font-bold">
                  📍 GPS: -22.2875, -44.8647
                </p>
              </div>
            </div>
          </div>

          {/* Alimentação */}
          <div className="group bg-gradient-to-br from-yellow-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 hover:border-yellow-400/60 transition-all transform hover:scale-105">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all">
              <Utensils className="text-black" size={40} />
            </div>
            <h3 className="text-2xl font-black text-white mb-6 text-center">
              GASTRONOMIA
            </h3>
            <div className="text-gray-300 space-y-3">
              {alimentacao.map((item, index) => (
                <div
                  key={index}
                  className="bg-black/40 rounded-xl p-3 flex justify-between items-center"
                >
                  <span>
                    <strong className="text-yellow-400">
                      {item.item.split(" ")[0]}
                    </strong>
                    {item.item.substring(item.item.indexOf(" "))}
                  </span>
                  <span className="text-green-400 font-bold">{item.preco}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estrutura */}
          <div className="group bg-gradient-to-br from-green-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 hover:border-green-400/60 transition-all transform hover:scale-105">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all">
              <Calendar className="text-black" size={40} />
            </div>
            <h3 className="text-2xl font-black text-white mb-6 text-center">
              INFRAESTRUTURA
            </h3>
            <div className="text-gray-300 space-y-3">
              {infraestrutura.map((item, index) => (
                <div
                  key={index}
                  className="bg-black/40 rounded-xl p-3 flex items-center"
                >
                  <div
                    className={`w-3 h-3 ${
                      index % 2 === 0 ? "bg-green-400" : "bg-yellow-400"
                    } rounded-full mr-4`}
                  ></div>
                  <span>
                    <strong className={item.color}>{item.icon}</strong>{" "}
                    {item.item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Programação Moderna */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-green-900/60 to-black/80 backdrop-blur-lg rounded-3xl p-10 border border-green-400/30">
            <h3 className="text-4xl font-black text-center mb-12 text-white">
              <Calendar className="inline mr-4 text-yellow-400" size={40} />
              CRONOGRAMA
            </h3>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Sábado */}
              <div className="bg-black/40 rounded-2xl p-8 border border-yellow-400/30">
                <h4 className="text-3xl font-black mb-8 text-yellow-400 text-center">
                  🔥 SÁBADO
                </h4>
                <div className="space-y-4">
                  {cronogramaSabado.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between rounded-xl p-4 ${
                        item.destaque
                          ? "bg-yellow-600/20 border border-yellow-400/50"
                          : "bg-green-900/30"
                      }`}
                    >
                      <span
                        className={`font-bold ${
                          item.destaque
                            ? "text-yellow-400 font-black"
                            : "text-white"
                        }`}
                      >
                        {item.horario}
                      </span>
                      <span
                        className={`${
                          item.destaque
                            ? "text-yellow-400 font-bold"
                            : "text-gray-300"
                        }`}
                      >
                        {item.atividade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domingo */}
              <div className="bg-black/40 rounded-2xl p-8 border border-green-400/30">
                <h4 className="text-3xl font-black mb-8 text-green-400 text-center">
                  🏆 DOMINGO
                </h4>
                <div className="space-y-4">
                  {cronogramaDomingo.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between rounded-xl p-4 ${
                        item.destaque
                          ? "bg-green-600/20 border border-green-400/50"
                          : "bg-green-900/30"
                      }`}
                    >
                      <span
                        className={`font-bold ${
                          item.destaque
                            ? "text-green-400 font-black"
                            : "text-white"
                        }`}
                      >
                        {item.horario}
                      </span>
                      <span
                        className={`${
                          item.destaque
                            ? "text-green-400 font-bold"
                            : "text-gray-300"
                        }`}
                      >
                        {item.atividade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EstruturaSection;
