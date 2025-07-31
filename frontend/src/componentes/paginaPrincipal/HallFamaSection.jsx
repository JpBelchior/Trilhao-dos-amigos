// src/componentes/paginaPrincipal/HallFamaSection.jsx
import React from "react";
import { Mountain, Trophy, Star, Award } from "lucide-react";

const HallFamaSection = () => {
  // Dados dos vencedores do Barranco por edição
  const vencedoresBarranco = [
    {
      edicao: "16ª Edição - 2025",
      ano: "2025",
      vencedorNacional: {
        nome: "Carlos Mendes",
        faltou: "2.0m",
        moto: "Honda Bros 160",
      },
      vencedorImportada: {
        nome: "Rafael Silva",
        faltou: "1.5m",
        moto: "KTM 350 EXC-F",
      },
      observacao: "Rafael chegou mais perto do topo na história do evento",
    },
    {
      edicao: "15ª Edição - 2024",
      ano: "2024",
      vencedorNacional: {
        nome: "Pedro Costa",
        faltou: "3.2m",
        moto: "Yamaha Lander 250",
      },
      vencedorImportada: {
        nome: "João Oliveira",
        faltou: "2.8m",
        moto: "Honda CRF 450X",
      },
      observacao: "Terreno estava mais escorregadio devido às chuvas",
    },
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-white mb-4">
            HALL DA <span className="text-yellow-400">FAMA</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Os corajosos que chegaram mais perto do topo no{" "}
            <span className="text-yellow-400 font-bold">Morro do Desafio</span>
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        {/* Legenda */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-900/40 to-black/60 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30">
            <h3 className="text-2xl font-black text-center text-white mb-4">
              MORRO DO DESAFIO
            </h3>
            <p className="text-center text-gray-300 leading-relaxed">
              A prova mais desafiadora do Trilhão! Mostramos aqui os pilotos que
              conseguiram chegar mais perto do topo em cada categoria, por
              edição.
              <span className="text-yellow-400 font-bold">
                {" "}
                O topo ainda não foi conquistado!
              </span>
            </p>
          </div>
        </div>

        {/* Cards das Edições */}
        <div className="space-y-8 max-w-6xl mx-auto">
          {vencedoresBarranco.map((edicao, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-green-900/30 to-black/50 backdrop-blur-lg rounded-3xl p-8 border border-green-400/20 hover:border-green-400/40 transition-all"
            >
              {/* Header da Edição */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-6 py-2 bg-yellow-400 text-black font-black rounded-full mb-4">
                  <Trophy className="mr-2" size={20} />
                  {edicao.edicao}
                </div>
                {edicao.observacao && (
                  <p className="text-gray-400 italic">{edicao.observacao}</p>
                )}
              </div>

              {/* Vencedores */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Motos Nacionais */}
                <div className="bg-gradient-to-br from-green-900/50 to-black/60 rounded-2xl p-6 border border-green-400/30 hover:border-green-400/50 transition-all transform hover:scale-105">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                      <Star className="text-black" size={24} />
                    </div>
                    <div>
                      <h4 className="text-green-400 font-black text-lg">
                        MOTOS NACIONAIS
                      </h4>
                      <p className="text-gray-400 text-sm">Melhor Resultado</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-center">
                      <h5 className="text-white text-2xl font-black mb-2">
                        {edicao.vencedorNacional.nome}
                      </h5>
                      <div className="bg-black/40 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">
                            Faltou para o topo:
                          </span>
                          <span className="text-red-400 font-bold text-lg">
                            {edicao.vencedorNacional.faltou}
                          </span>
                        </div>
                        <div className="text-center pt-2 border-t border-gray-600">
                          <span className="text-green-400 font-semibold">
                            {edicao.vencedorNacional.moto}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Motos Importadas */}
                <div className="bg-gradient-to-br from-yellow-900/50 to-black/60 rounded-2xl p-6 border border-yellow-400/30 hover:border-yellow-400/50 transition-all transform hover:scale-105">
                  <div className="flex items-center mb-4">
                    <div className="bg-yellow-500 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                      <Award className="text-black" size={24} />
                    </div>
                    <div>
                      <h4 className="text-yellow-400 font-black text-lg">
                        MOTOS IMPORTADAS
                      </h4>
                      <p className="text-gray-400 text-sm">Melhor Resultado</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-center">
                      <h5 className="text-white text-2xl font-black mb-2">
                        {edicao.vencedorImportada.nome}
                      </h5>
                      <div className="bg-black/40 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">
                            Faltou para o topo:
                          </span>
                          <span className="text-red-400 font-bold text-lg">
                            {edicao.vencedorImportada.faltou}
                          </span>
                        </div>
                        <div className="text-center pt-2 border-t border-gray-600">
                          <span className="text-yellow-400 font-semibold">
                            {edicao.vencedorImportada.moto}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Final */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-yellow-900/40 to-green-900/40 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 max-w-4xl mx-auto">
            <h3 className="text-3xl font-black text-white mb-4">
              <Mountain className="inline mr-3 text-yellow-400" size={32} />O
              TOPO AINDA ESPERA SEU CONQUISTADOR!
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Rafael Silva chegou a apenas{" "}
              <span className="text-red-400 font-bold">1.5m do topo</span> em
              2025, o mais perto que alguém já chegou! O prêmio de{" "}
              <span className="text-yellow-400 font-bold">R$ 1.000</span>{" "}
              continua esperando pelo primeiro corajoso que conseguir essa
              façanha histórica.
            </p>
            <div className="text-2xl font-black text-yellow-400">
              SERÁ QUE VOCÊ SERÁ O PRIMEIRO? 🏔️
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HallFamaSection;
