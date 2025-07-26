// src/paginas/Pagamento.jsx - VERSÃO COM MERCADO PAGO REAL
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
} from "lucide-react";

const Pagamento = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Estados
  const [dadosPix, setDadosPix] = useState(null);
  const [loadingPix, setLoadingPix] = useState(true);
  const [chavePixCopiada, setChavePixCopiada] = useState(false);
  const [codigoPixCopiado, setCodigoPixCopiado] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [erro, setErro] = useState(null);
  const [inscricaoCompleta, setInscricaoCompleta] = useState(null);
  const [tempoRestante, setTempoRestante] = useState(600); // 10 minutos em segundos

  // Dados vindos do cadastro
  const { dadosInscricao, valorTotal } = location.state || {};

  // Verificar se tem dados necessários
  useEffect(() => {
    if (!dadosInscricao || !valorTotal) {
      alert("Dados não encontrados. Refaça o cadastro.");
      navigate("/cadastro");
      return;
    }

    // Gerar PIX real assim que a página carregar
    gerarPixReal();
  }, [dadosInscricao, valorTotal, navigate]);

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

  // Criar PIX via Mercado Pago
  const gerarPixReal = async () => {
    try {
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
    } finally {
      setLoadingPix(false);
    }
  };

  // Simular pagamento aprovado (para testes)
  // Esta função deve ser removida em produção
  const simularPagamentoAprovado = () => {
    const participanteConfirmado = {
      id: dadosPix.participante.id,
      numeroInscricao: dadosPix.participante.numeroInscricao,
      nome: dadosPix.participante.nome,
      email: dadosPix.participante.email,
      valorInscricao: valorTotal,
      statusPagamento: "confirmado",
    };

    setInscricaoCompleta(participanteConfirmado);
    setPagamentoConfirmado(true);
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
        setInscricaoCompleta(dadosPix.participante);
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
  // Substitua a parte do "pagamento confirmado" no seu Pagamento.jsx por isso:

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
                  {inscricaoCompleta.numeroInscricao}
                </div>
              </div>
            </div>

            {/* Dados do Participante */}
            <div className="space-y-4 text-left bg-black/40 rounded-2xl p-6 mb-8">
              <div className="flex justify-between">
                <span className="text-gray-300">Nome:</span>
                <span className="text-white font-semibold">
                  {inscricaoCompleta.nome}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Email:</span>
                <span className="text-white font-semibold">
                  {inscricaoCompleta.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Moto:</span>
                <span className="text-white font-semibold">
                  {dadosInscricao.modeloMoto}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Valor Pago:</span>
                <span className="text-green-400 font-bold text-xl">
                  R$ {valorTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Informações do Evento */}
            <div className="bg-yellow-900/30 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">
                📍 INFORMAÇÕES DO EVENTO
              </h3>
              <div className="space-y-3 text-center">
                <div>
                  <span className="text-gray-300">Local: </span>
                  <span className="text-white font-semibold">
                    Fazenda do Trilhão - Itamonte/MG
                  </span>
                </div>
                <div>
                  <span className="text-gray-300">Data: </span>
                  <span className="text-white font-semibold">
                    Sábado - 10:30h
                  </span>
                </div>
                <div>
                  <span className="text-gray-300">Distância: </span>
                  <span className="text-white font-semibold">
                    40km de trilha off-road
                  </span>
                </div>
              </div>
            </div>

            {/* Mensagem Final */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-900/50 to-yellow-900/50 rounded-2xl p-6 mb-6">
                <h3 className="text-2xl font-bold text-white mb-3">
                  🏔️ A AVENTURA TE ESPERA!
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
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3 px-8 rounded-2xl transition-all transform hover:scale-105"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Se deu erro
  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-red-400/30 text-center">
            <AlertCircle className="mx-auto text-red-400 mb-6" size={80} />
            <h1 className="text-4xl font-black text-white mb-4">
              ❌ ERRO NO PAGAMENTO
            </h1>
            <p className="text-red-300 mb-6">{erro}</p>
            <div className="space-y-4">
              <button
                onClick={gerarPixReal}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
              >
                <RefreshCw className="mr-2" size={20} />
                Tentar Novamente
              </button>
              <button
                onClick={() => navigate("/cadastro")}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
              >
                <ArrowLeft className="mr-2" size={20} />
                Voltar ao Cadastro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se está carregando
  if (loadingPix || !dadosPix) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="text-white">
            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-xl">Gerando PIX...</p>
            <p className="text-gray-400 mt-2">Aguarde alguns instantes</p>
          </div>
        </div>
      </div>
    );
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
                  {dadosInscricao.nome}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Email:</span>
                <span className="text-white font-semibold">
                  {dadosInscricao.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Inscrição:</span>
                <span className="text-yellow-400 font-semibold">
                  {dadosPix.participante.numeroInscricao}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Cidade:</span>
                <span className="text-white font-semibold">
                  {dadosInscricao.cidade}-{dadosInscricao.estado}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Moto:</span>
                <span className="text-white font-semibold">
                  {dadosInscricao.modeloMoto}
                </span>
              </div>

              <hr className="border-gray-600" />

              <div className="flex justify-between">
                <span className="text-gray-300">Inscrição + 1 Camiseta:</span>
                <span className="text-white">R$ 100,00</span>
              </div>

              {dadosInscricao.camisetasExtras?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    {dadosInscricao.camisetasExtras.length} Camiseta(s) Extra:
                  </span>
                  <span className="text-white">
                    R$ {(dadosInscricao.camisetasExtras.length * 50).toFixed(2)}
                  </span>
                </div>
              )}

              <hr className="border-gray-600" />

              <div className="flex justify-between text-2xl font-bold">
                <span className="text-white">TOTAL:</span>
                <span className="text-green-400">
                  R$ {valorTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* PIX Real do Mercado Pago */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30">
            <h2 className="text-3xl font-bold text-white mb-6">
              <QrCode className="inline mr-3" size={32} />
              PIX - Mercado Pago
            </h2>

            {/* QR Code Real */}
            {dadosPix.qrCodeBase64 && (
              <div className="bg-white rounded-2xl p-4 mb-6 text-center">
                <img
                  src={`data:image/png;base64,${dadosPix.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="mx-auto max-w-full h-auto"
                  style={{ maxHeight: "300px" }}
                />
                <p className="text-gray-600 text-sm mt-2">
                  QR Code PIX - R$ {valorTotal.toFixed(2)}
                </p>
              </div>
            )}

            {/* Código PIX para Copia e Cola */}
            {dadosPix.qrCode && (
              <div className="mb-6">
                <label className="block text-gray-300 text-sm mb-2">
                  Código PIX Copia e Cola:
                </label>
                <div className="flex">
                  <textarea
                    value={dadosPix.qrCode}
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
                <li>3. Confirme o pagamento de R$ {valorTotal.toFixed(2)}</li>
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
