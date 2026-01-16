import React from "react";
import { BarChart3 } from "lucide-react";


import GraficosParticipantes from "../componentes/inscritos/Graficos";
import ErroComponent from "../componentes/Erro";
import LoadingComponent from "../componentes/Loading";

import { useEdicao } from "../hooks/useEdicao";
import useEstatisticas from "../hooks/useEstatisticas";

const Estatisticas = () => {
  const { edicaoAtual, loading: edicaoLoading } = useEdicao();

  const {
    // Estados
    participantes,
    loading,
    erro,

    // Estatísticas
    estatisticas,

    // Funções
    carregarDados,
  } = useEstatisticas();


  if (loading) {
    return <LoadingComponent loading="Calculando estatísticas..." />;
  }

  if (erro) {
    return <ErroComponent erro={erro} onTentarNovamente={carregarDados} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        
        {/* ========== HEADER ========== */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            <BarChart3 className="inline mr-4 text-yellow-400" size={40} />
            ESTATÍSTICAS DO <span className="text-yellow-400">TRILHÃO</span>
          </h1>
          <p className="text-gray-400 text-xl">
            {edicaoLoading
              ? "Carregando..."
              : `Vamos conferir as curiosidades e números da edição de ${edicaoAtual?.ano}!`}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        {/* ========== SEÇÃO DE ESTATÍSTICAS ========== */}
        <div className="max-w-6xl mx-auto mb-12">
          
          {/* ========== ESTATÍSTICAS BÁSICAS ========== */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            
            {/* Card: Total */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center">
              <div className="text-4xl font-black text-green-400 mb-2">
                {estatisticas.total}
              </div>
              <div className="text-gray-300">Total de Participantes</div>
            </div>

            {/* Card: Nacionais */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center">
              <div className="text-4xl font-black text-green-400 mb-2">
                {estatisticas.nacionais}
              </div>
              <div className="text-gray-300">Motos Nacionais</div>
              <div className="text-green-400 text-sm">
                ({estatisticas.percentualNacionais}%)
              </div>
            </div>

            {/* Card: Importadas */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/30 text-center">
              <div className="text-4xl font-black text-yellow-400 mb-2">
                {estatisticas.importadas}
              </div>
              <div className="text-gray-300">Motos Importadas</div>
              <div className="text-yellow-400 text-sm">
                ({estatisticas.percentualImportadas}%)
              </div>
            </div>

            {/* Card: Cidades */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center">
              <div className="text-4xl font-black text-green-400 mb-2">
                {estatisticas.totalCidades}
              </div>
              <div className="text-gray-300">Cidades Distintas</div>
            </div>

            {/* Card: Estados */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center">
              <div className="text-4xl font-black text-green-400 mb-2">
                {estatisticas.totalEstados}
              </div>
              <div className="text-gray-300">Estados Distintos</div>
            </div>
          </div>

          {/* ========== GRÁFICOS ========== */}
          <div className="max-w-6xl mx-auto mb-5">
            <GraficosParticipantes participantes={participantes} />
          </div>

          {/* ========== DESTAQUES PRINCIPAIS ========== */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            {/* Cidade Campeã */}
            <div className="bg-gradient-to-r from-yellow-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
                Cidade com Mais Participantes
              </h3>
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-2">
                  {estatisticas.cidadeMaisParticipantes?.nome || "N/A"}
                </div>
                <div className="text-yellow-400 text-lg">
                  {estatisticas.cidadeMaisParticipantes?.quantidade || 0}{" "}
                  participantes
                </div>
              </div>
            </div>

            {/* Estado Campeão */}
            <div className="bg-gradient-to-r from-green-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
              <h3 className="text-2xl font-bold text-green-400 mb-4 text-center">
                Estado Com Mais Participantes
              </h3>
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-2">
                  {estatisticas.estadoMaisParticipantes?.nome || "N/A"}
                </div>
                <div className="text-green-400 text-lg">
                  {estatisticas.estadoMaisParticipantes?.quantidade || 0}{" "}
                  participantes
                </div>
              </div>
            </div>
          </div>

          {/* ========== TOP MOTOS ========== */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 mb-12">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
              MOTOS MAIS POPULARES
            </h3>
            <div className="grid md:grid-cols-5 gap-4">
              {estatisticas.motosPopulares.map((moto, index) => (
                <div
                  key={index}
                  className="bg-black/40 rounded-xl p-4 text-center"
                >
                  <div className="text-2xl font-black text-white mb-1">
                    {moto.quantidade}
                  </div>
                  <div className="text-yellow-400 text-sm font-semibold">
                    {moto.modelo}
                  </div>
                  <div className="text-gray-400 text-xs">#{index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estatisticas;