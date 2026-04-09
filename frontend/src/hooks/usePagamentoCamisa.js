import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:8000/api";

/**
 * Hook para gerenciar pagamento de pedido avulso de camisa.
 * Segue o mesmo padrão de usePagamento.js, adaptado para /pedido-camisa.
 */
export const usePagamentoCamisa = (pedido) => {
  const navigate = useNavigate();

  const [dadosPix, setDadosPix] = useState(null);
  const [statusPagamento, setStatusPagamento] = useState("pending");
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState({ gerandoPix: false, verificandoStatus: false });
  const [copiado, setCopiado] = useState({ qrCode: false });
  const [tempoRestante, setTempoRestante] = useState(15 * 60);

  const jaGerouPix = useRef(false);

  // Redirecionar quando aprovado
  useEffect(() => {
    if (statusPagamento === "approved" && dadosPix) {
      setTimeout(() => {
        navigate("/pedido-camisa-confirmado", {
          replace: true,
          state: { pedido, numeroPagamento: dadosPix.pagamentoId },
        });
      }, 1000);
    }
  }, [statusPagamento, dadosPix, navigate, pedido]);

  // Validação e geração inicial
  useEffect(() => {
    if (!pedido) {
      alert("Dados do pedido não encontrados. Refaça o pedido.");
      navigate("/comprar-camisa");
      return;
    }
    if (jaGerouPix.current) return;
    jaGerouPix.current = true;
    gerarPix();
  }, []);

  // Timer de expiração
  useEffect(() => {
    if (!dadosPix || statusPagamento !== "pending") return;
    const intervalo = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          setStatusPagamento("expired");
          clearInterval(intervalo);
          alert("O tempo para pagamento expirou. Você será redirecionado.");
          setTimeout(() => navigate("/comprar-camisa"), 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [dadosPix, statusPagamento, navigate]);

  // Polling automático de status
  useEffect(() => {
    if (!dadosPix || statusPagamento !== "pending") return;
    const intervalo = setInterval(() => verificarStatusSilencioso(), 10000);
    return () => clearInterval(intervalo);
  }, [dadosPix?.pagamentoId, statusPagamento]);

  const gerarPix = async () => {
    setLoading((prev) => ({ ...prev, gerandoPix: true }));
    setErro(null);
    try {
      const data = await apiClient.post("/pedido-camisa/criar-pix", {
        pedidoId: pedido.id,
      });
      setDadosPix(data.dados);
      setTempoRestante(data.dados.minutosExpiracao * 60);
    } catch (error) {
      console.error("❌ [usePagamentoCamisa] Erro ao gerar PIX:", error);
      setErro(error.message || "Erro ao gerar PIX. Tente novamente.");
    } finally {
      setLoading((prev) => ({ ...prev, gerandoPix: false }));
    }
  };

  const verificarStatus = async () => {
    if (!dadosPix?.pagamentoId) return;
    setLoading((prev) => ({ ...prev, verificandoStatus: true }));
    try {
      const response = await fetch(
        `${API_BASE_URL}/pedido-camisa/status/${dadosPix.pagamentoId}`
      );
      const data = await response.json();
      if (!response.ok || !data.sucesso) throw new Error(data.erro || "Erro ao verificar status");
      if (data.dados.approved) setStatusPagamento("approved");
    } catch (error) {
      alert(error.message || "Erro ao verificar status. Tente novamente.");
    } finally {
      setLoading((prev) => ({ ...prev, verificandoStatus: false }));
    }
  };

  const verificarStatusSilencioso = async () => {
    if (!dadosPix?.pagamentoId) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/pedido-camisa/status/${dadosPix.pagamentoId}`
      );
      const data = await response.json();
      if (data.sucesso && data.dados.approved) setStatusPagamento("approved");
    } catch {
      // silencioso
    }
  };

  const copiarCodigoPix = () => {
    if (!dadosPix?.qrCode) return;
    navigator.clipboard.writeText(dadosPix.qrCode);
    setCopiado({ qrCode: true });
    setTimeout(() => setCopiado({ qrCode: false }), 3000);
  };

  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${String(minutos).padStart(2, "0")}:${String(segs).padStart(2, "0")}`;
  };

  const cancelarPagamento = () => navigate("/comprar-camisa");

  const simularAprovacao = async () => {
    if (!dadosPix?.pagamentoId) {
      alert("Dados do PIX não encontrados!");
      return;
    }
    const confirmar = window.confirm(
      "⚠️ SIMULAÇÃO DE PAGAMENTO\n\nUsar apenas em DESENVOLVIMENTO/TESTE!\n\nDeseja continuar?"
    );
    if (!confirmar) return;

    setLoading((prev) => ({ ...prev, verificandoStatus: true }));
    try {
      const response = await fetch(
        `${API_BASE_URL}/pagamento/status/${dadosPix.pagamentoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "approved",
            external_reference: dadosPix.externalReference,
            date_approved: new Date().toISOString(),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.sucesso) throw new Error(data.erro || "Erro ao simular aprovação");
      setStatusPagamento("approved");
    } catch (error) {
      alert(error.message || "Erro ao simular aprovação. Tente novamente.");
    } finally {
      setLoading((prev) => ({ ...prev, verificandoStatus: false }));
    }
  };

  return {
    dadosPix,
    statusPagamento,
    erro,
    loading,
    copiado,
    tempoRestante,
    gerarPix,
    verificarStatus,
    copiarCodigoPix,
    formatarTempo,
    cancelarPagamento,
    simularAprovacao,
  };
};

export default usePagamentoCamisa;
