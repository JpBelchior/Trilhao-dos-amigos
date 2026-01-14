// frontend/src/paginas/Pagamento.jsx - VERSÃO REFATORADA
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  CheckCircle2,
} from "lucide-react";

const Pagamento = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ========================================
  // ESTADOS
  // ========================================
  const [dadosPix, setDadosPix] = useState(null);
  const [statusPagamento, setStatusPagamento] = useState("pending"); // pending, checking, approved, expired
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState({
    gerandoPix: false,
    verificandoStatus: false,
  });
  const [copiado, setCopiado] = useState({
    qrCode: false,
  });
  const [tempoRestante, setTempoRestante] = useState(15 * 60); // 15 minutos em segundos

  // Dados vindos do cadastro
  const { dadosInscricao, valorTotal } = location.state || {};

  // ========================================
  // VALIDAÇÃO INICIAL
  // ========================================
  useEffect(() => {
    if (!dadosInscricao || !valorTotal) {
      alert("Dados da inscrição não encontrados. Refaça o cadastro.");
      navigate("/cadastro");
      return;
    }

    // Gerar PIX automaticamente ao carregar a página
    gerarPix();
  }, []); // Apenas uma vez ao montar

  // ========================================
  // TIMER DE EXPIRAÇÃO
  // ========================================
  useEffect(() => {
    if (!dadosPix || statusPagamento !== "pending") return;

    const intervalo = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          setStatusPagamento("expired");
          clearInterval(intervalo);
          alert("O tempo para pagamento expirou. Você será redirecionado.");
          setTimeout(() => navigate("/cadastro"), 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [dadosPix, statusPagamento]);

  // ========================================
  // POLLING AUTOMÁTICO DE STATUS
  // ========================================
  useEffect(() => {
    if (!dadosPix || statusPagamento !== "pending") return;

    // Verificar a cada 5 segundos
    const intervalo = setInterval(() => {
      verificarStatusSilencioso();
    }, 5000);

    return () => clearInterval(intervalo);
  }, [dadosPix, statusPagamento]);

  // ========================================
  // FUNÇÕES
  // ========================================

  /**
   * Gerar PIX no backend
   */
  const gerarPix = async () => {
    setLoading((prev) => ({ ...prev, gerandoPix: true }));
    setErro(null);

    try {
      console.log("🏦 Gerando PIX...");

      const response = await fetch(
        "http://localhost:8000/api/pagamento/criar-pix",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participanteId: dadosInscricao.id,
            valorTotal: valorTotal,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || "Erro ao gerar PIX");
      }

      console.log("✅ PIX gerado com sucesso:", data.dados);

      setDadosPix(data.dados);
      setTempoRestante(data.dados.minutosExpiracao * 60); // Converter para segundos
    } catch (error) {
      console.error("❌ Erro ao gerar PIX:", error);
      setErro(error.message || "Erro ao gerar PIX. Tente novamente.");
    } finally {
      setLoading((prev) => ({ ...prev, gerandoPix: false }));
    }
  };

  /**
   * Verificar status do pagamento (com loading visual)
   */
  const verificarStatus = async () => {
    if (!dadosPix?.pagamentoId) return;

    setLoading((prev) => ({ ...prev, verificandoStatus: true }));

    try {
      console.log("🔍 Verificando status do pagamento...");

      const response = await fetch(
        `http://localhost:8000/api/pagamento/status/${dadosPix.pagamentoId}`
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || "Erro ao verificar status");
      }

      console.log("📊 Status recebido:", data.dados);

      if (data.dados.approved) {
        setStatusPagamento("approved");
        // Aguardar 2 segundos e redirecionar para página de sucesso
        setTimeout(() => {
          navigate("/inscricao-concluida", {
            state: {
              participante: dadosPix.participante,
              valorPago: valorTotal,
            },
          });
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Erro ao verificar status:", error);
      alert(error.message || "Erro ao verificar status. Tente novamente.");
    } finally {
      setLoading((prev) => ({ ...prev, verificandoStatus: false }));
    }
  };

  /**
   * Verificar status silenciosamente (polling automático)
   */
  const verificarStatusSilencioso = async () => {
    if (!dadosPix?.pagamentoId) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/pagamento/status/${dadosPix.pagamentoId}`
      );

      const data = await response.json();

      if (data.sucesso && data.dados.approved) {
        setStatusPagamento("approved");
        setTimeout(() => {
          navigate("/inscricao-concluida", {
            state: {
              participante: dadosPix.participante,
              valorPago: valorTotal,
            },
          });
        }, 2000);
      }
    } catch (error) {
      // Silencioso - não mostrar erro
      console.log("⚠️ Erro no polling (silencioso):", error);
    }
  };

  /**
   * Copiar código PIX
   */
  const copiarCodigoPix = () => {
    if (!dadosPix?.qrCode) return;

    navigator.clipboard.writeText(dadosPix.qrCode);
    setCopiado({ ...copiado, qrCode: true });

    setTimeout(() => {
      setCopiado({ ...copiado, qrCode: false });
    }, 3000);
  };

  /**
   * Formatar tempo restante
   */
  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${String(minutos).padStart(2, "0")}:${String(segs).padStart(
      2,
      "0"
    )}`;
  };

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  // Loading inicial
  if (loading.gerandoPix) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 flex items-center justify-center">
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 text-center max-w-md">
          <Loader2 className="animate-spin text-green-400 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">
            Gerando PIX...
          </h2>
          <p className="text-gray-300">
            Estamos preparando seu pagamento via Mercado Pago. Aguarde...
          </p>
        </div>
      </div>
    );
  }

  // Erro ao gerar PIX
  if (erro && !dadosPix) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 flex items-center justify-center p-6">
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-red-400/30 text-center max-w-md">
          <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">
            Erro ao Gerar Pagamento
          </h2>
          <p className="text-red-300 mb-6">{erro}</p>
          <div className="space-y-3">
            <button
              onClick={gerarPix}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => navigate("/cadastro")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Voltar ao Cadastro
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pagamento aprovado
  if (statusPagamento === "approved") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 flex items-center justify-center p-6">
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 text-center max-w-md">
          <CheckCircle2 className="text-green-400 mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold text-white mb-2">
            Pagamento Confirmado!
          </h2>
          <p className="text-gray-300 mb-4">
            Seu pagamento foi aprovado com sucesso. Redirecionando...
          </p>
          <Loader2 className="animate-spin text-green-400 mx-auto" size={32} />
        </div>
      </div>
    );
  }

  // Tela principal de pagamento
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-12 px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            FINALIZE SEU PAGAMENTO
          </h1>
          <p className="text-gray-300">
            Inscrição #{dadosInscricao?.numeroInscricao || "---"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Coluna 1: Resumo */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30 h-fit">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <CreditCard className="mr-3" size={24} />
              Resumo
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Nome:</span>
                <span className="text-white font-semibold">
                  {dadosInscricao?.nome}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Email:</span>
                <span className="text-white text-sm">
                  {dadosInscricao?.email}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Inscrição:</span>
                <span className="text-white font-mono">
                  {dadosInscricao?.numeroInscricao}
                </span>
              </div>

              <div className="border-t border-gray-600 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">TOTAL:</span>
                  <span className="text-2xl font-bold text-green-400">
                    R$ {valorTotal?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="mt-6 bg-yellow-900/30 rounded-xl p-4 border border-yellow-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="text-yellow-400 mr-2" size={20} />
                  <span className="text-yellow-200 font-semibold">
                    Tempo Restante:
                  </span>
                </div>
                <span className="text-2xl font-bold text-yellow-400 font-mono">
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
              <div className="bg-white rounded-2xl p-4 mb-4">
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
              <h4 className="text-blue-400 font-bold mb-2">
                📱 Como pagar:
              </h4>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Abra o app do seu banco</li>
                <li>Escolha pagar com PIX</li>
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

              <button
                onClick={() => navigate("/cadastro")}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
              >
                <ArrowLeft className="mr-2" size={20} />
                Cancelar e Voltar
              </button>
            </div>

            {/* Aviso */}
            <div className="mt-4 bg-yellow-900/30 rounded-xl p-3 border border-yellow-400/30">
              <p className="text-yellow-200 text-xs">
                ⚡ O pagamento é confirmado automaticamente. Não feche esta
                página!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagamento;