// src/paginas/Pagamento.jsx
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
} from "lucide-react";

const Pagamento = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Estados
  const [qrCodePix, setQrCodePix] = useState("");
  const [chavePixCopiada, setChavePixCopiada] = useState(false);
  const [codigoPixCopiado, setCodigoPixCopiado] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [loadingConfirmacao, setLoadingConfirmacao] = useState(false);
  const [inscricaoCompleta, setInscricaoCompleta] = useState(null);

  // Dados vindos do cadastro
  const { dadosInscricao, valorTotal } = location.state || {};

  // Se não tiver dados, redirecionar para cadastro
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (dadosInscricao && valorTotal) {
        gerarQRCodePix();
      } else {
        alert("Dados não encontrados. Refaça o cadastro.");
        navigate("/cadastro");
      }
    }, 1000); // espera 300ms

    return () => clearTimeout(timeout);
  }, [dadosInscricao, valorTotal, navigate]);

  // Dados para o PIX
  const dadosPix = {
    chavePix: "trilhao@email.com", // Substitua pela chave real
    beneficiario: "Trilhão dos Amigos",
    valor: valorTotal,
    identificador: `TRI${Date.now()}`, // ID único para identificar o pagamento
    descricao: "Inscricao Trilhao dos Amigos",
  };

  // Gerar QR Code PIX (simulado - você pode usar uma API real)
  const gerarQRCodePix = async () => {
    try {
      // AQUI você colocaria a integração com um gateway de pagamento
      // Por exemplo: PagSeguro, Mercado Pago, Stripe, etc.

      // Por enquanto, vamos simular um código PIX
      const codigoPix = `00020126360014BR.GOV.BCB.PIX0114${
        dadosPix.chavePix
      }52040000530398654${dadosPix.valor.toFixed(2)}5802BR5925${
        dadosPix.beneficiario
      }6009SAO PAULO62070503***6304`;

      setQrCodePix(codigoPix);

      // Em um cenário real, você geraria um QR Code visual aqui
      // Exemplo com uma biblioteca: qrcode-generator, qrcode.js, etc.
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      alert("Erro ao gerar código PIX. Tente novamente.");
    }
  };

  // Copiar chave PIX
  const copiarChavePix = () => {
    navigator.clipboard.writeText(dadosPix.chavePix);
    setChavePixCopiada(true);
    setTimeout(() => setChavePixCopiada(false), 2000);
  };

  // Copiar código PIX
  const copiarCodigoPix = () => {
    navigator.clipboard.writeText(qrCodePix);
    setCodigoPixCopiado(true);
    setTimeout(() => setCodigoPixCopiado(false), 2000);
  };

  // Confirmar pagamento e criar inscrição
  const confirmarPagamento = async () => {
    setLoadingConfirmacao(true);

    try {
      // AQUI você faria a verificação real do pagamento
      // Consultaria a API do gateway para ver se foi pago

      // Por enquanto, vamos simular e pedir confirmação do usuário
      const confirmacao = confirm(
        "Você confirma que realizou o pagamento PIX?\n\n" +
          "IMPORTANTE: Só confirme se você realmente fez o pagamento, " +
          "pois sua inscrição será registrada no sistema."
      );

      if (!confirmacao) {
        setLoadingConfirmacao(false);
        return;
      }

      // Agora sim, criar a inscrição no banco após pagamento confirmado
      const response = await fetch("http://localhost:8000/api/participantes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...dadosInscricao,
          // Adicionar dados do pagamento
          identificadorPagamento: dadosPix.identificador,
          statusPagamento: "confirmado", // Já confirmado
        }),
      });

      const data = await response.json();

      if (data.sucesso) {
        setInscricaoCompleta(data.dados);
        setPagamentoConfirmado(true);
      } else {
        alert("Erro ao processar inscrição: " + data.erro);
      }
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setLoadingConfirmacao(false);
    }
  };

  // Se pagamento foi confirmado, mostrar tela de sucesso
  if (pagamentoConfirmado && inscricaoCompleta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
            <div className="text-center">
              <CheckCircle className="mx-auto text-green-400 mb-6" size={80} />
              <h1 className="text-4xl font-black text-white mb-4">
                🎉 INSCRIÇÃO CONFIRMADA!
              </h1>

              <div className="bg-green-900/30 rounded-2xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-green-400 mb-4">
                  Número da Inscrição
                </h2>
                <div className="text-6xl font-black text-yellow-400">
                  {inscricaoCompleta.numeroInscricao}
                </div>
              </div>

              <div className="space-y-4 text-left bg-black/40 rounded-2xl p-6 mb-6">
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
                  <span className="text-gray-300">Valor Pago:</span>
                  <span className="text-green-400 font-bold text-xl">
                    R$ {inscricaoCompleta.valorInscricao.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Status:</span>
                  <span className="text-green-400 font-semibold">
                    ✅ Confirmado
                  </span>
                </div>
              </div>

              <div className="bg-blue-900/30 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-blue-400 mb-3">
                  📧 Próximos Passos
                </h3>
                <p className="text-gray-300 text-sm">
                  Você receberá um email com mais detalhes sobre o evento.
                  Guarde seu número de inscrição:{" "}
                  <strong className="text-yellow-400">
                    {inscricaoCompleta.numeroInscricao}
                  </strong>
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

  // Se não tiver dados, mostrar loading ou erro
  if (!dadosInscricao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="text-white">
            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
            <p>Carregando dados do pagamento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            💳 FINALIZE SEU <span className="text-yellow-400">PAGAMENTO</span>
          </h1>
          <p className="text-gray-400 text-xl">
            Pague via PIX para confirmar sua inscrição
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Resumo da Inscrição */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
            <h2 className="text-3xl font-bold text-white mb-6">
              📋 Resumo da Inscrição
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
                <span className="text-gray-300">Cidade:</span>
                <span className="text-white font-semibold">
                  {dadosInscricao.cidade}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Moto:</span>
                <span className="text-white font-semibold">
                  {dadosInscricao.modeloMoto}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Categoria:</span>
                <span
                  className={`font-semibold ${
                    dadosInscricao.categoriaMoto === "nacional"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {dadosInscricao.categoriaMoto === "nacional"
                    ? "🇧🇷 Nacional"
                    : "🌍 Importada"}
                </span>
              </div>

              <hr className="border-gray-600" />

              <div className="flex justify-between">
                <span className="text-gray-300">Inscrição + 1 Camiseta:</span>
                <span className="text-white">R$ 100,00</span>
              </div>

              {dadosInscricao.camisetasExtras.length > 0 && (
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

          {/* Pagamento PIX */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30">
            <h2 className="text-3xl font-bold text-white mb-6">
              <QrCode className="inline mr-3" size={32} />
              Pagamento PIX
            </h2>

            {/* QR Code (simulado) */}
            <div className="bg-white rounded-2xl p-6 mb-6 text-center">
              <div className="w-48 h-48 mx-auto bg-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="mx-auto mb-2 text-gray-600" size={48} />
                  <p className="text-gray-600 text-sm">QR Code PIX</p>
                  <p className="text-gray-500 text-xs">
                    R$ {valorTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Dados do PIX */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Chave PIX:
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={dadosPix.chavePix}
                    readOnly
                    className="flex-1 bg-black/50 border border-gray-600 rounded-l-xl px-4 py-3 text-white"
                  />
                  <button
                    onClick={copiarChavePix}
                    className={`px-4 py-3 rounded-r-xl border border-l-0 transition-all ${
                      chavePixCopiada
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-yellow-500 border-yellow-500 text-black hover:bg-yellow-600"
                    }`}
                  >
                    {chavePixCopiada ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
              </div>

              {qrCodePix && (
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Código PIX Copia e Cola:
                  </label>
                  <div className="flex">
                    <textarea
                      value={qrCodePix}
                      readOnly
                      rows="3"
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
            </div>

            {/* Instruções */}
            <div className="bg-blue-900/30 rounded-2xl p-4 mb-6">
              <h4 className="text-blue-400 font-bold mb-2">📱 Como pagar:</h4>
              <ol className="text-gray-300 text-sm space-y-1">
                <li>1. Abra seu app do banco</li>
                <li>2. Escaneie o QR Code ou cole o código PIX</li>
                <li>3. Confirme o pagamento de R$ {valorTotal.toFixed(2)}</li>
                <li>4. Clique em "Pagamento Realizado" abaixo</li>
              </ol>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-4">
              <button
                onClick={confirmarPagamento}
                disabled={loadingConfirmacao}
                className={`w-full font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center ${
                  loadingConfirmacao
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white transform hover:scale-105"
                }`}
              >
                {loadingConfirmacao ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2" size={20} />
                    Pagamento Realizado
                  </>
                )}
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
            <div className="bg-yellow-900/30 rounded-2xl p-4 mt-6">
              <div className="flex items-start">
                <AlertCircle
                  className="text-yellow-400 mr-3 mt-1 flex-shrink-0"
                  size={20}
                />
                <div className="text-yellow-200 text-sm">
                  <strong>Importante:</strong> Sua inscrição será confirmada
                  apenas após o pagamento ser processado. Guarde o comprovante
                  do PIX.
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
