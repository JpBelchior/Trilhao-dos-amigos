import React from "react";
import { MapPin, Utensils, Calendar } from "lucide-react";
import { useImageRetry} from "../../hooks/useImageRetry"
const EstruturaSection = () => {
  const { abrirNoGoogleMaps, formatarCoordenadas } = useImageRetry();
  const coordenadas = {
    lat: -22.3121252, 
    lng: -44.8171325  ,
  };
  const alimentacao = [
    { item: "Churrasquinho" },
    { item: "Pão com Pernil"  },
    { item: "Pastel"  },
    { item: "Salgados Diversos" },
    { item: "Prato de Almoço" },
    { item: "Bebidas Geladas"},
    { item: "Picolés" },
    { item: "Doces Caseiros" },
  ];

  const infraestrutura = [
    { item: "Banheiros Completos" },
    { item: "Estacionamento"},
    { item: "Brinquedos para Crianças" },
    { item: "Telão pra Copa do Mundo" },
    { item: "Barracas de Alimentação" },
    { item: "Ambulância" },
    { item: "Som Ambiente"},
    { item: "Palco de Premiação" },
  ];

    const cronogramaSabado = [
      { horario: "08:00", atividade: "Abertura do Morro para Treinos", destaque: false },
      { horario: "09:00", atividade: "Treino da Manhã", destaque: true },
      { horario: "12:00", atividade: "Almoço", destaque: false },
      { horario: "14:00", atividade: "Treino da Tare", destaque: true },
      { horario: "16:00", atividade: "Show ao Vivo & Barraquinhas ", destaque: false },
      { horario: "17:00", atividade: "Encerramento ", destaque: false },
    ];

  const cronogramaDomingo = [
    { horario: "08:00", atividade: "Café da manhã e Entrega e Kits", destaque: false },
    { horario: "09:30", atividade: "Saída dos Competidores", destaque: false },
    { horario: "10:00", atividade: "Início dos Show", destaque: true },
    { horario: "12:00", atividade: "Almoço", destaque: false },
    { horario: "14:30", atividade: "Abertura do Morro do Dasafio", destaque: false },
    { horario: "16:00", atividade: "Chegada dos Trilheiros", destaque: false },
    { horario: "18:00", atividade: "Premiação & Encerramento", destaque: false },
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
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
                Centro Comunitário
              </p>
              <p>Estrada do Picuzinho, Km 5</p>
              <p>Bairro: Ilha Grande</p>
              <p>Itamonte - MG, 37466-000</p>
               <button
                onClick={() => abrirNoGoogleMaps(coordenadas.lat, coordenadas.lng)}
                className="bg-black/40 rounded-xl p-3 mt-4 w-full hover:bg-green-600/30 transition-all cursor-pointer border border-green-400/30 hover:border-green-400/60 group"
              >
                <p className="text-green-400 font-bold group-hover:text-green-300">
                  📍 Ver no Google Maps
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatarCoordenadas(coordenadas.lat, coordenadas.lng)}
                </p>
              </button>
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
                  className="bg-black/40 rounded-xl p-3 flex justify-center items-center"
                >
                  <span className="text-center">{item.item}</span>
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
                  <span>
                    <strong className={item.color}></strong>{" "}
                    {item.item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Programação Moderna */}
        <div className="max-w-6xl mx-auto px-3  ">

          <div className="bg-gradient-to-r from-green-900/60 to-black/80 backdrop-blur-lg rounded-3xl p-6 lg:p-10 border border-green-400/30">

            {/* TÍTULO */}
            <h3 className="text-2xl lg:text-4xl font-black text-center mb-8 lg:mb-12 text-white">
              <Calendar className="inline mr-3 lg:mr-4 text-yellow-400" size={28} />
              CRONOGRAMA
            </h3>

            {/* GRID RESPONSIVA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">

              {/* ================= SÁBADO ================= */}
              <div className="bg-black/40 rounded-2xl p-5 lg:p-8 border border-yellow-400/30">

                <h4 className="text-xl lg:text-3xl font-black mb-6 lg:mb-8 text-yellow-400 text-center">
                  SÁBADO
                </h4>

                <div className="space-y-3 lg:space-y-4">

                  {cronogramaSabado.map((item, index) => (
                    <div
                      key={index}
                      className={`
                        flex flex-col sm:flex-row sm:items-center sm:justify-between
                        gap-1 sm:gap-4
                        rounded-xl p-3 lg:p-4
                        ${item.destaque
                          ? "bg-yellow-600/20 border border-yellow-400/50"
                          : "bg-green-900/30"}
                      `}
                    >

                      {/* horário */}
                      <span
                        className={`text-sm lg:text-base font-bold ${
                          item.destaque ? "text-yellow-400 font-black" : "text-white"
                        }`}
                      >
                        {item.horario}
                      </span>

                      {/* atividade */}
                      <span
                        className={`text-sm lg:text-base ${
                          item.destaque ? "text-yellow-400 font-bold" : "text-gray-300"
                        }`}
                      >
                        {item.atividade}
                      </span>
                    </div>
                  ))}

                </div>
              </div>

              {/* ================= DOMINGO ================= */}
              <div className="bg-black/40 rounded-2xl p-5 lg:p-8 border border-green-400/30">

                <h4 className="text-xl lg:text-3xl font-black mb-6 lg:mb-8 text-yellow-400  text-center">
                  DOMINGO
                </h4>

                <div className="space-y-3 lg:space-y-4">

                  {cronogramaDomingo.map((item, index) => (
                    <div
                      key={index}
                      className={`
                        flex flex-col sm:flex-row sm:items-center sm:justify-between
                        gap-1 sm:gap-4
                        rounded-xl p-3 lg:p-4
                        ${item.destaque
                          ? "bg-yellow-600/20 border border-yellow-400/50"
                          : "bg-green-900/30"}
                      `}
                    >

                      <span
                        className={`text-sm lg:text-base font-bold ${
                          item.destaque ? "text-yellow-400 font-black" : "text-white"
                        }`}
                      >
                        {item.horario}
                      </span>

                      <span
                        className={`text-sm lg:text-base ${
                          item.destaque ? "text-yellow-400 font-bold" : "text-gray-300"
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