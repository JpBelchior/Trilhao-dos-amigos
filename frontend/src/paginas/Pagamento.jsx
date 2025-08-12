import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import ErroComponent from "../componentes/Erro";
import LoadingComponent from "../componentes/Loading";

const Pagamento = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Estados
  const [dadosPix, setDadosPix] = useState(null);
  const [loadingPix, setLoadingPix] = useState(false); // CORRIGIDO: inicia como false
  const [chavePixCopiada, setChavePixCopiada] = useState(false);
  const [codigoPixCopiado, setCodigoPixCopiado] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [erro, setErro] = useState(null);
  const [inscricaoCompleta, setInscricaoCompleta] = useState(null);
  const [tempoRestante, setTempoRestante] = useState(600); // 10 minutos em segundos
  const [pixJaGerado, setPixJaGerado] = useState(false); // Novo estado para evitar múltiplas tentativas

  // Dados vindos do cadastro
  const { dadosInscricao, valorTotal } = location.state || {};

  // Criar PIX via Mercado Pago - com useCallback para estabilizar
  const gerarPixReal = useCallback(async () => {
    // Proteção melhorada
    if (pixJaGerado || dadosPix || loadingPix) {
      console.log("🚫 Bloqueando nova tentativa de gerar PIX", {
        pixJaGerado,
        dadosPix: !!dadosPix,
        loadingPix,
      });
      return;
    }

    try {
      console.log("🏦 Iniciando geração de PIX...");
      setPixJaGerado(true); // Marcar como tentativa iniciada
      setLoadingPix(true);
      setErro(null);

      console.log("🏦 Criando PIX real via Mercado Pago...");

      const response = await fetch(
        "http://localhost:8000/api/pagamento/criar-pix",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participanteId: dadosInscricao.id, // ID do participante já criado como PENDENTE
            valorTotal: valorTotal,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || "Erro ao criar PIX");
      }

      console.log("✅ PIX criado com sucesso:", data.dados);

      setDadosPix(data.dados);

      // Iniciar timer baseado na expiração real do MP
      if (data.dados.expiraEm) {
        const expiraEm = new Date(data.dados.expiraEm);
        const agora = new Date();
        const segundosRestantes = Math.floor((expiraEm - agora) / 1000);
        setTempoRestante(Math.max(0, segundosRestantes));
      }
    } catch (error) {
      console.error("❌ Erro ao gerar PIX:", error);
      setErro(error.message);
      setPixJaGerado(false); // Resetar para permitir nova tentativa em caso de erro
    } finally {
      setLoadingPix(false);
      console.log("🏁 Finalizando geração de PIX");
    }
  }, [pixJaGerado, dadosPix, loadingPix, dadosInscricao?.id, valorTotal]);

  // Verificar se tem dados necessários - SEM navigate nas dependências
  useEffect(() => {
    if (!dadosInscricao || !valorTotal) {
      alert("Dados não encontrados. Refaça o cadastro.");
      navigate("/cadastro");
      return;
    }

    // Gerar PIX real assim que a página carregar
    gerarPixReal();
  }, [dadosInscricao, valorTotal, gerarPixReal]); // Removido 'navigate' das dependências

  // Timer de 10 minutos
  useEffect(() => {
    if (!dadosPix || pagamentoConfirmado) return;

    const timer = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          alert(
            "Tempo esgotado! O PIX expirou. Você será redirecionado para fazer uma nova inscrição."
          );
          navigate("/cadastro");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dadosPix, pagamentoConfirmado, navigate]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!dadosPix || pagamentoConfirmado) return;

    const verificarPagamento = setInterval(async () => {
      await consultarStatusPagamento();
    }, 10000);

    return () => clearInterval(verificarPagamento);
  }, [dadosPix, pagamentoConfirmado]);

  // Simular pagamento aprovado (para testes)
  const simularPagamentoAprovado = async () => {
    try {
      console.log(
        "🧪 [SIMULAÇÃO] Iniciando simulação de pagamento aprovado..."
      );
      console.log("🧪 [SIMULAÇÃO] Dados do PIX:", dadosPix);

      setLoadingStatus(true);

      // Dados do participante confirmado (estrutura completa)
      const participanteConfirmado = {
        id: dadosPix?.participante?.id || dadosInscricao?.id,
        numeroInscricao:
          dadosPix?.participante?.numeroInscricao ||
          dadosInscricao?.numeroInscricao,
        nome: dadosPix?.participante?.nome || dadosInscricao?.nome,
        email: dadosPix?.participante?.email || dadosInscricao?.email,
        valorInscricao: valorTotal,
        statusPagamento: "confirmado",
        cidade: dadosInscricao?.cidade,
        estado: dadosInscricao?.estado,
        modeloMoto: dadosInscricao?.modeloMoto,
        categoriaMoto: dadosInscricao?.categoriaMoto,
      };

      console.log(
        "🧪 [SIMULAÇÃO] Participante que será confirmado:",
        participanteConfirmado
      );

      // Tentar confirmar via API do participante diretamente
      try {
        const participanteId = dadosPix?.participante?.id || dadosInscricao?.id;
        const confirmResponse = await fetch(
          `http://localhost:8000/api/participantes/${participanteId}/pagamento`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "confirmado",
              comprovante: `Pagamento simulado - ${new Date().toISOString()}`,
            }),
          }
        );

        if (confirmResponse.ok) {
          const confirmData = await confirmResponse.json();
          console.log(
            "✅ [SIMULAÇÃO] Participante confirmado via API:",
            confirmData
          );

          // Definir estados de sucesso
          setInscricaoCompleta(participanteConfirmado);
          setPagamentoConfirmado(true);
          setLoadingStatus(false);

          console.log(
            "✅ [SIMULAÇÃO] Estados definidos - pagamento confirmado!"
          );
        } else {
          throw new Error("Falha na confirmação via API");
        }
      } catch (apiError) {
        console.error("❌ [SIMULAÇÃO] Erro na API:", apiError);

        // Fallback: apenas simular localmente
        setInscricaoCompleta(participanteConfirmado);
        setPagamentoConfirmado(true);
        setLoadingStatus(false);

        console.log("⚠️ [SIMULAÇÃO] Usando fallback local");
      }
    } catch (error) {
      console.error("💥 [SIMULAÇÃO] Erro geral:", error);
      alert("Erro na simulação. Verifique o console.");
    }
  };

  // Consultar status do pagamento
  const consultarStatusPagamento = async () => {
    if (!dadosPix?.pagamentoId || loadingStatus) return;

    try {
      setLoadingStatus(true);

      const response = await fetch(
        `http://localhost:8000/api/pagamento/status/${dadosPix.pagamentoId}`
      );

      const data = await response.json();

      if (data.sucesso && data.dados.status === "approved") {
        console.log("🎉 Pagamento aprovado!");
        setInscricaoCompleta(dadosPix?.participante || dadosInscricao);
        setPagamentoConfirmado(true);
      }
    } catch (error) {
      console.error("Erro ao consultar status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Copiar chave PIX
  const copiarChavePix = async () => {
    if (!dadosPix?.qrCode) return;

    try {
      await navigator.clipboard.writeText(dadosPix.qrCode);
      setChavePixCopiada(true);
      setTimeout(() => setChavePixCopiada(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  // Copiar código PIX
  const copiarCodigoPix = async () => {
    if (!dadosPix?.qrCode) return;

    try {
      await navigator.clipboard.writeText(dadosPix.qrCode);
      setCodigoPixCopiado(true);
      setTimeout(() => setCodigoPixCopiado(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  // Formato do tempo restante
  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, "0")}:${segs
      .toString()
      .padStart(2, "0")}`;
  };

  // Se pagamento foi confirmado, mostrar tela de sucesso
  if (pagamentoConfirmado && inscricaoCompleta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
        <div className="container mx-auto px-6">
          {/* Header de Sucesso */}
          <div className="text-center mb-12">
            <CheckCircle className="mx-auto text-green-400 mb-6" size={80} />
            <h1 className="text-5xl font-black text-white mb-4">
              PAGAMENTO <span className="text-yellow-400">CONFIRMADO!</span>
            </h1>
            <p className="text-xl text-gray-400">
              Sua inscrição foi realizada com sucesso
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
          </div>

          {/* Card Principal */}
          <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
            {/* Número da Inscrição */}
            <div className="text-center mb-8">
              <div className="bg-green-900/30 rounded-2xl p-6 mb-4">
                <h2 className="text-xl font-bold text-green-400 mb-2">
                  SEU NÚMERO DE INSCRIÇÃO
                </h2>
                <div className="text-6xl font-black text-yellow-400">
                  {inscricaoCompleta?.numeroInscricao || "Carregando..."}
                </div>
              </div>
            </div>

            {/* Dados do Participante */}
            <div className="space-y-4 text-left bg-black/40 rounded-2xl p-6 mb-8">
              <div className="flex justify-between">
                <span className="text-gray-300">Nome:</span>
                <span className="text-white font-semibold">
                  {inscricaoCompleta?.nome || "Carregando..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Email:</span>
                <span className="text-white font-semibold">
                  {inscricaoCompleta?.email || "Carregando..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Valor Pago:</span>
                <span className="text-green-400 font-bold">
                  R$ {valorTotal?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>

            {/* Próximos Passos */}
            <div className="bg-blue-900/30 rounded-2xl p-6 mb-8">
              <h3 className="text-blue-400 font-bold text-xl mb-4">
                🎯 Próximos Passos:
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>✅ Guarde seu número de inscrição</li>
                <li>📧 Verifique seu email para confirmações</li>
                <li>🏍️ Prepare sua moto para o evento</li>
                <li>📱 Acompanhe as informações no site</li>
              </ul>
            </div>

            {/* Mensagem Motivacional */}
            <div className="text-center bg-gradient-to-r from-green-900/50 to-yellow-900/50 rounded-2xl p-6 mb-8">
              <h3 className="text-yellow-400 font-bold text-2xl mb-3">
                🏁 Bem-vindo ao Trilhão!
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Prepare sua moto, ajuste o equipamento e venha viver uma
                experiência inesquecível na Serra da Mantiqueira.
                <span className="text-yellow-400 font-bold">
                  {" "}
                  Te esperamos lá, piloto!
                </span>
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3 px-8 rounded-2xl transition-all transform hover:scale-105"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se deu erro
  if (erro) {
    return <ErroComponent erro={erro} onTentarNovamente={gerarPixReal} />;
  }

  // Se está carregando ou não tem dados ainda
  if (
    (loadingPix && !dadosPix && !erro) ||
    (!dadosPix && !erro && !pixJaGerado)
  ) {
    return <LoadingComponent loading="Gerando PIX..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header com Timer */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            FINALIZE SEU <span className="text-yellow-400">PAGAMENTO</span>
          </h1>
          <p className="text-gray-400 text-xl">
            PIX gerado via Mercado Pago - Válido por 10 minutos
          </p>

          {/* Timer de Expiração */}
          <div className="mt-6 inline-flex items-center bg-red-900/40 border border-red-400/50 rounded-2xl px-6 py-3">
            <Clock className="mr-2 text-red-400" size={24} />
            <span className="text-red-300 font-bold text-xl">
              Expira em: {formatarTempo(tempoRestante)}
            </span>
          </div>

          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Resumo da Inscrição */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
            <h2 className="text-3xl font-bold text-white mb-6">
              Resumo da Inscrição
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Nome:</span>
                <span className="text-white font-semibold">
                  {dadosInscricao?.nome || "Carregando..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Email:</span>
                <span className="text-white font-semibold">
                  {dadosInscricao?.email || "Carregando..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Inscrição:</span>
                <span className="text-yellow-400 font-semibold">
                  {dadosPix?.participante?.numeroInscricao ||
                    dadosInscricao?.numeroInscricao ||
                    "Carregando..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Cidade:</span>
                <span className="text-white font-semibold">
                  {dadosInscricao?.cidade || "Carregando..."}-
                  {dadosInscricao?.estado || ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Moto:</span>
                <span className="text-white font-semibold">
                  {dadosInscricao?.modeloMoto || "Carregando..."}
                </span>
              </div>

              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-green-400">TOTAL:</span>
                  <span className="text-green-400">
                    R$ {valorTotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PIX Payment */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
            <h2 className="text-3xl font-bold text-white mb-6">
              <QrCode className="inline mr-3" size={32} />
              PIX - Mercado Pago
            </h2>

            {/* QR Code Real */}
            {dadosPix?.qrCodeBase64 && (
              <div className="bg-white rounded-2xl p-4 mb-6 text-center">
                <img
                  src={`data:image/png;base64,${dadosPix.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="mx-auto max-w-full h-auto"
                  style={{ maxHeight: "300px" }}
                />
                <p className="text-gray-600 text-sm mt-2">
                  QR Code PIX - R$ {valorTotal?.toFixed(2) || "0.00"}
                </p>
              </div>
            )}

            {/* Código PIX para Copia e Cola */}
            {dadosPix?.qrCode && (
              <div className="mb-6">
                <label className="block text-gray-300 text-sm mb-2">
                  Código PIX Copia e Cola:
                </label>
                <div className="flex">
                  <textarea
                    value={dadosPix?.qrCode || ""}
                    readOnly
                    rows="4"
                    className="flex-1 bg-black/50 border border-gray-600 rounded-l-xl px-4 py-3 text-white text-xs resize-none"
                  />
                  <button
                    onClick={copiarCodigoPix}
                    className={`px-4 py-3 rounded-r-xl border border-l-0 transition-all self-start ${
                      codigoPixCopiado
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-yellow-500 border-yellow-500 text-black hover:bg-yellow-600"
                    }`}
                  >
                    {codigoPixCopiado ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Instruções */}
            <div className="bg-blue-900/30 rounded-2xl p-4 mb-6">
              <h4 className="text-blue-400 font-bold mb-2">📱 Como pagar:</h4>
              <ol className="text-gray-300 text-sm space-y-1">
                <li>1. Abra seu app do banco</li>
                <li>2. Escaneie o QR Code ou cole o código PIX</li>
                <li>
                  3. Confirme o pagamento de R${" "}
                  {valorTotal?.toFixed(2) || "0.00"}
                </li>
                <li>4. Aguarde a confirmação automática</li>
              </ol>
            </div>

            {/* Status do Pagamento */}
            <div className="space-y-4 mb-6">
              <button
                onClick={consultarStatusPagamento}
                disabled={loadingStatus}
                className={`w-full font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center ${
                  loadingStatus
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loadingStatus ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Verificando Pagamento...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2" size={20} />
                    Verificar Status do Pagamento
                  </>
                )}
              </button>
              <button
                onClick={simularPagamentoAprovado}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
              >
                <CheckCircle className="mr-2" size={20} />
                🧪 SIMULAR PAGAMENTO APROVADO
              </button>
              <button
                onClick={() => navigate("/cadastro")}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
              >
                <ArrowLeft className="mr-2" size={20} />
                Voltar ao Cadastro
              </button>
            </div>

            {/* Aviso */}
            <div className="bg-yellow-900/30 rounded-2xl p-4">
              <div className="flex items-start">
                <AlertCircle
                  className="text-yellow-400 mr-3 mt-1 flex-shrink-0"
                  size={20}
                />
                <div className="text-yellow-200 text-sm">
                  <strong>Importante:</strong> Este PIX foi gerado pelo Mercado
                  Pago e tem validade de 10 minutos. Sua inscrição será
                  confirmada automaticamente após o pagamento.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagamento;
