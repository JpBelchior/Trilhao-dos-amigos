// src/componentes/paginaPrincipal/HallFamaSection.jsx
import React, { useState, useEffect } from "react";
import { Mountain, Trophy, Star, Award, Loader2 } from "lucide-react";

const HallFamaSection = () => {
  const [campeoes, setCampeoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [melhorResultado, setMelhorResultado] = useState(null);

  // Carregar dados da API
  useEffect(() => {
    carregarCampeoes();
  }, []);

  const carregarCampeoes = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log("🏆 Carregando campeões da API...");

      // Buscar todos os campeões
      const campeoesResponse = await fetch(
        "http://localhost:8000/api/campeoes"
      );
      const campeoesData = await campeoesResponse.json();

      // Buscar melhor resultado
      const melhorResponse = await fetch(
        "http://localhost:8000/api/campeoes/melhor"
      );
      const melhorData = await melhorResponse.json();

      if (campeoesData.sucesso) {
        setCampeoes(campeoesData.dados.campeoes);
        console.log(
          `✅ ${campeoesData.dados.campeoes.length} campeões carregados`
        );
      }

      if (melhorData.sucesso) {
        setMelhorResultado(melhorData.dados.campeao);
        console.log(`🏆 Melhor resultado: ${melhorData.dados.campeao.nome}`);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar campeões:", error);
      setErro("Erro ao carregar dados dos campeões");
    } finally {
      setLoading(false);
    }
  };

  // Organizar campeões por edição - MELHOR DE CADA CATEGORIA POR EDIÇÃO
  const organizarPorEdicao = () => {
    const edicoes = {};

    campeoes.forEach((campeao) => {
      const edicaoKey = `${campeao.edicao}_${campeao.ano}`;

      if (!edicoes[edicaoKey]) {
        edicoes[edicaoKey] = {
          edicao: campeao.edicao,
          ano: campeao.ano,
          melhorNacional: null,
          melhorImportada: null,
        };
      }

      // Para cada categoria, manter apenas o MELHOR (maior altura)
      if (campeao.categoriaMoto === "nacional") {
        if (
          !edicoes[edicaoKey].melhorNacional ||
          campeao.resultadoAltura >
            edicoes[edicaoKey].melhorNacional.resultadoAltura
        ) {
          edicoes[edicaoKey].melhorNacional = campeao;
        }
      } else if (campeao.categoriaMoto === "importada") {
        if (
          !edicoes[edicaoKey].melhorImportada ||
          campeao.resultadoAltura >
            edicoes[edicaoKey].melhorImportada.resultadoAltura
        ) {
          edicoes[edicaoKey].melhorImportada = campeao;
        }
      }
    });

    // Converter para array e ordenar por ano (mais recente primeiro)
    return Object.values(edicoes).sort((a, b) => b.ano - a.ano);
  };

  // Função para formatar distância que faltou
  const calcularDistanciaFaltou = (altura) => {
    // Assumindo que o topo é 50m (ajuste conforme necessário)
    const ALTURA_TOPO = 100;
    const faltou = ALTURA_TOPO - altura;
    return faltou > 0 ? `${faltou.toFixed(1)}m` : "CONQUISTOU!";
  };

  if (loading) {
    return (
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-yellow-400"
            size={48}
          />
          <p className="text-white text-xl">Carregando Hall da Fama...</p>
        </div>
      </section>
    );
  }

  if (erro) {
    return (
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-red-900/30 border border-red-400/30 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-red-400 text-lg">{erro}</p>
            <button
              onClick={carregarCampeoes}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </section>
    );
  }

  const edicoes = organizarPorEdicao();

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

        {/* Cards das Edições - CORRIGIDO */}
        <div className="space-y-8 max-w-6xl mx-auto">
          {edicoes.map((edicao, index) => (
            <div
              key={`${edicao.edicao}-${edicao.ano}`}
              className="bg-gradient-to-r from-green-900/30 to-black/50 backdrop-blur-lg rounded-3xl p-8 border border-green-400/20 hover:border-green-400/40 transition-all"
            >
              {/* Header da Edição */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-6 py-2 bg-yellow-400 text-black font-black rounded-full mb-4">
                  <Trophy className="mr-2" size={20} />
                  {edicao.edicao}
                </div>
              </div>

              {/* Grid com AMBOS os vencedores da MESMA edição lado a lado */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Card Nacional */}
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

                  {edicao.melhorNacional ? (
                    <div className="text-center">
                      <h5 className="text-white text-2xl font-black mb-2">
                        {edicao.melhorNacional.nome}
                      </h5>
                      <div className="text-sm text-gray-400 mb-3">
                        {edicao.melhorNacional.cidade}/
                        {edicao.melhorNacional.estado}
                      </div>
                      <div className="bg-black/40 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">
                            Altura alcançada:
                          </span>
                          <span className="text-green-400 font-bold text-lg">
                            {edicao.melhorNacional.resultadoAltura}m
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">
                            Faltou para o topo:
                          </span>
                          <span className="text-red-400 font-bold text-lg">
                            {calcularDistanciaFaltou(
                              edicao.melhorNacional.resultadoAltura
                            )}
                          </span>
                        </div>
                        <div className="text-center pt-2 border-t border-gray-600">
                          <span className="text-green-400 font-semibold">
                            {edicao.melhorNacional.modeloMoto}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <p>Nenhum campeão nacional</p>
                      <p className="text-sm">registrado nesta edição</p>
                    </div>
                  )}
                </div>

                {/* Card Importada */}
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

                  {edicao.melhorImportada ? (
                    <div className="text-center">
                      <h5 className="text-white text-2xl font-black mb-2">
                        {edicao.melhorImportada.nome}
                      </h5>
                      <div className="text-sm text-gray-400 mb-3">
                        {edicao.melhorImportada.cidade}/
                        {edicao.melhorImportada.estado}
                      </div>
                      <div className="bg-black/40 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">
                            Altura alcançada:
                          </span>
                          <span className="text-yellow-400 font-bold text-lg">
                            {edicao.melhorImportada.resultadoAltura}m
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">
                            Faltou para o topo:
                          </span>
                          <span className="text-red-400 font-bold text-lg">
                            {calcularDistanciaFaltou(
                              edicao.melhorImportada.resultadoAltura
                            )}
                          </span>
                        </div>
                        <div className="text-center pt-2 border-t border-gray-600">
                          <span className="text-yellow-400 font-semibold">
                            {edicao.melhorImportada.modeloMoto}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <p>Nenhum campeão importada</p>
                      <p className="text-sm">registrado nesta edição</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Final */}
        {melhorResultado && (
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-yellow-900/40 to-green-900/40 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 max-w-4xl mx-auto">
              <h3 className="text-3xl font-black text-white mb-4">
                <Mountain className="inline mr-3 text-yellow-400" size={32} />O
                TOPO AINDA ESPERA SEU CONQUISTADOR!
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {melhorResultado.nome} de {melhorResultado.cidade}/
                {melhorResultado.estado} chegou a{" "}
                <span className="text-green-400 font-bold">
                  {melhorResultado.resultadoAltura}m
                </span>{" "}
                em{" "}
                <span className="text-yellow-400 font-bold">
                  {melhorResultado.ano}
                </span>
                , faltando apenas{" "}
                <span className="text-red-400 font-bold">
                  {calcularDistanciaFaltou(melhorResultado.resultadoAltura)}
                </span>{" "}
                para conquistar o topo! O topo continua esperando pelo seu
                conquistador, venha ser o primeiro!
              </p>
              <div className="text-2xl font-black text-yellow-400">
                SERÁ QUE VOCÊ SERÁ O PRIMEIRO? 🏔️
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HallFamaSection;
