import React from "react";
import { Mountain, Trophy, Award } from "lucide-react";
import LoadingComponent from "../Loading";
import ErroComponent from "../Erro";
import { useHallFama } from "../../hooks/useHallFama";

/**
 * 🏆 Hall da Fama - Componente de UI puro
 * 
 * Exibe os melhores resultados históricos do Morro do Desafio
 * organizados por edição e categoria (nacional/importada)
 */
const HallFamaSection = () => {
  // ========================================
  // HOOK - Toda lógica vem daqui
  // ========================================
  const {
    loading,
    erro,
    melhorResultado,
    edicoes,
    carregarCampeoes,
    calcularDistanciaFaltou,
  } = useHallFama();

  if (loading) {
    return <LoadingComponent loading="Carregando Hall da Fama..." />;
  }

  if (erro) {
    return (
      <ErroComponent mensagem={erro} onTentarNovamente={carregarCampeoes} />
    );
  }

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL - APENAS UI
  // ========================================
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        
        {/* ========== HEADER ========== */}
        <div className="text-center mb-16">
          <h6 className="text-4xl md:text-5xl font-black text-yellow-400 mb-4">
            Hall da Fama
          </h6>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Os corajosos que chegaram mais perto do topo no Morro do Desafio!
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        {/* ========== LEGENDA ========== */}
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

        {/* ========== LISTA DE EDIÇÕES ========== */}
        <div className="space-y-12 max-w-6xl mx-auto">
          {edicoes.map((edicao, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-black/60 to-green-900/20 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30"
            >
              {/* Header da Edição */}
              <div className="flex items-center justify-center mb-8">
                <Mountain className="text-green-400 mr-4" size={32} />
                <h3 className="text-3xl font-black text-white">
                  {edicao.edicao} - {edicao.ano}
                </h3>
                <Mountain className="text-green-400 ml-4" size={32} />
              </div>

              {/* Grid de Categorias */}
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* ========== CARD NACIONAL ========== */}
                <div className="bg-gradient-to-br from-green-900/50 to-black/60 rounded-2xl p-6 border border-green-400/30 hover:border-green-400/50 transition-all transform hover:scale-105">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                      <Trophy className="text-black" size={24} />
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

                {/* ========== CARD IMPORTADA ========== */}
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

        {/* ========== DESTAQUE DO MELHOR RESULTADO ========== */}
        {melhorResultado && (
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-yellow-900/40 via-green-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-10 border-2 border-yellow-400/50 relative overflow-hidden">
              <div className="text-center relative z-10">
                <h3 className="text-3xl font-black text-yellow-400 mb-6">
                  🏆 MELHOR RESULTADO DE TODOS OS TEMPOS
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
          </div>
        )}
      </div>
    </section>
  );
};

export default HallFamaSection;