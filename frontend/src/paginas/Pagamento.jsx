import React from "react";
import { useLocation, useNavigate } from "react-router-dom"
import {
  CreditCard,
  Copy,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  QrCode,
  Loader2,
  Clock,
  RefreshCw,
} from "lucide-react";

import LoadingComponent from "../componentes/Loading";
import ErroComponent from "../componentes/Erro";
import usePagamento from "../hooks/usePagamento";

const Pagamento = () => {
  const location = useLocation();
  const { dadosInscricao, valorTotal } = location.state || {};

  // ========================================
  // 🎯 USAR HOOK CUSTOMIZADO
  // ========================================
  const {
    dadosPix,
    erro,
    loading,
    copiado,
    tempoRestante,
    dadosParticipante,

    // Funções
    gerarPix,
    verificarStatus,
    copiarCodigoPix,
    formatarTempo,
    cancelarPagamento,
    simularAprovacao, // 🧪 Função para simular aprovação (desenvolvimento)
  } = usePagamento(dadosInscricao, valorTotal);

  const dados = dadosParticipante || dadosInscricao || {};
  
  // ========================================
  // VERIFICAR AMBIENTE
  // ========================================
  const isDevelopment = import.meta.env.MODE === 'development' || 
                        window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1';

  if (loading.gerandoPix) {
    return (
      <LoadingComponent
        variant="pix"
        loading="Gerando PIX..."
        subtitulo="Estamos preparando seu pagamento via Mercado Pago. Aguarde..."
      />
    );
  }

  // 2️⃣ Erro ao gerar PIX
  if (erro && !dadosPix) {
    return (
      <ErroComponent
        erro={erro}
        onTentarNovamente={gerarPix}
        onVoltar={cancelarPagamento}
        mostrarVoltar={false}
      />
    );
  }

  // 4️⃣ Tela principal - Exibindo PIX
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Pagamento <span className="text-yellow-400">PIX</span>
          </h1>
          <p className="text-xl text-gray-300">
            Escaneie o QR Code ou copie o código para pagar
          </p>
        </div>
        {/* Container principal */}

        <div className="mb-8 bg-black/40  backdrop-blur-lg rounded-2xl p-5 border border-green-400/30 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertCircle className="text-white  animate-pulse" size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
               Atenção: Não atualize, feche ou volte a página sem antes realizar o pagamento!
            </h3>
            <div className="mt-3 pt-3 border-t border-yellow-400/30">
              <p className="text-white text-sm">
                <strong>Por quê?</strong> Atualizar a página pode gerar um novo PIX e causar problemas. 
                O sistema já está <strong>verificando automaticamente</strong> seu pagamento!
              </p>
            </div>
          </div>
        </div>
      </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Coluna 1: Resumo do pedido */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <CreditCard className="mr-3" size={24} />
              Resumo do Pedido
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Participante:</span>
                <span className="text-white font-bold">
                  {dadosPix?.participante?.nome || dadosInscricao?.nome}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Inscrição:</span>
                <span className="text-yellow-400 font-bold">
                  {dadosPix?.participante?.numeroInscricao ||
                    dadosInscricao?.numeroInscricao}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Email:</span>
                <span className="text-white text-sm">
                  {dadosPix?.participante?.email || dadosInscricao?.email}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-600 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xl text-white font-bold">
                  Valor Total:
                </span>
                <span className="text-3xl text-green-400 font-black">
                  R$ {valorTotal?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Timer de expiração */}
            <div
              className={`rounded-xl p-4 border ${
                tempoRestante < 300
                  ? "bg-red-900/30 border-red-400/30"
                  : "bg-yellow-900/30 border-yellow-400/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock
                    className={tempoRestante < 300 ? "text-red-400" : "text-yellow-400"}
                    size={20}
                  />
                  <span className="ml-2 text-white font-bold">
                    Tempo restante:
                  </span>
                </div>
                <span
                  className={`text-2xl font-black ${
                    tempoRestante < 300 ? "text-red-400" : "text-yellow-400"
                  }`}
                >
                  {formatarTempo(tempoRestante)}
                </span>
              </div>
            </div>
          </div>

          {/* Coluna 2: PIX */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <QrCode className="mr-3" size={24} />
              Pagar com PIX
            </h2>

           {/* QR Code */}
            {dadosPix?.qrCodeBase64 && (
              <div className="bg-white rounded-2xl p-4 mb-4 max-w-xs mx-auto">
                <img
                  src={`data:image/png;base64,${dadosPix.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="w-full h-auto"
                />
              </div>
            )}
          

            {/* Código Copia e Cola */}
            {dadosPix?.qrCode && (
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2 font-semibold">
                  Ou copie o código:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dadosPix.qrCode}
                    readOnly
                    className="flex-1 bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white text-xs font-mono"
                  />
                  <button
                    onClick={copiarCodigoPix}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      copiado.qrCode
                        ? "bg-green-500 text-white"
                        : "bg-yellow-500 text-black hover:bg-yellow-600"
                    }`}
                  >
                    {copiado.qrCode ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Instruções */}
            <div className="bg-blue-900/30 rounded-xl p-4 mb-4 border border-blue-400/30">
              <h4 className="text-blue-400 font-bold mb-2">📱 Como pagar:</h4>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Escaneie o QR Code ou cole o código</li>
                <li>Confirme o pagamento de R$ {valorTotal?.toFixed(2)}</li>
                <li>Aguarde a confirmação automática</li>
              </ol>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <button
                onClick={verificarStatus}
                disabled={loading.verificandoStatus}
                className={`w-full font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center ${
                  loading.verificandoStatus
                    ? "bg-gray-600 text-gray-400"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading.verificandoStatus ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2" size={20} />
                    Verificar Pagamento
                  </>
                )}
              </button>

              {/* 🧪 BOTÃO DE SIMULAÇÃO - Apenas em DESENVOLVIMENTO */}
              {isDevelopment && (
                <button
                  onClick={simularAprovacao}
                  disabled={loading.verificandoStatus}
                  className={`w-full font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center border-2 ${
                    loading.verificandoStatus
                      ? "bg-gray-600 text-gray-400 border-gray-500"
                      : "bg-orange-600 hover:bg-orange-700 text-white border-orange-400"
                  }`}
                >
                  {loading.verificandoStatus ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Simulando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" size={20} />
                      🧪 Simular Aprovação (DEV)
                    </>
                  )}
                </button>
              )}

              <button
                onClick={cancelarPagamento}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
              >
                <ArrowLeft className="mr-2" size={20} />
                Cancelar e Voltar
              </button>
            </div>

            {/* Aviso - Modo Normal */}
            {!isDevelopment && (
              <div className="mt-4 bg-yellow-900/30 rounded-xl p-3 border border-yellow-400/30">
                <p className="text-yellow-200 text-xs">
                 O pagamento é confirmado automaticamente.
                </p>
              </div>
            )}
            
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default Pagamento;