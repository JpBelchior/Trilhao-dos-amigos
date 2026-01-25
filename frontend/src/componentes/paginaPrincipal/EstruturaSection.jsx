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
    { item: "Churrasquinho", preco: "R$ 8" },
    { item: "Cachorro-quente", preco: "R$ 6" },
    { item: "Prato de Almoço", preco: "R$ 15" },
    { item: "Bebidas Geladas", preco: "R$ 8" },
    { item: "Café da Roça", preco: "R$ 3" },
    { item: "Doces Caseiros", preco: "R$ 5" },
  ];

  const infraestrutura = [
    { item: "Área de Camping", color: "text-green-400" },
    { item: "Banheiros Completos", color: "text-yellow-400" },
    { item: "Estacionamento", color: "text-green-400" },
    { item: "Primeiros Socorros", color: "text-yellow-400" },
    { item: "Oficina Básica", color: "text-green-400" },
    { item: "Som Ambiente", color: "text-yellow-400" },
    { item: "Palco de Premiação", color: "text-green-400" },
  ];

  const cronogramaSabado = [
    { horario: "07:00", atividade: "Abertura dos portões", destaque: false },
    { horario: "08:00", atividade: "Café da manhã", destaque: false },
    { horario: "09:00", atividade: "Verificação técnica", destaque: false },
    { horario: "10:30", atividade: "LARGADA DA TRILHA", destaque: true },
    { horario: "14:00", atividade: "Almoço", destaque: false },
    { horario: "15:30", atividade: "PROVA DA SUBIDA", destaque: true },
  ];

  const cronogramaDomingo = [
    { horario: "08:00", atividade: "Café da manhã", destaque: false },
    { horario: "09:00", atividade: "Passeio família", destaque: false },
    { horario: "11:00", atividade: "PREMIAÇÃO", destaque: true },
    { horario: "12:00", atividade: "Confraternização", destaque: false },
    { horario: "14:00", atividade: "Encerramento", destaque: false },
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
                  className="bg-black/40 rounded-xl p-3 flex justify-between items-center"
                >
                  <span>
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
                  SÁBADO
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
                  DOMINGO
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