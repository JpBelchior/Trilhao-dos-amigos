// frontend/src/hooks/usePagamento.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 🎯 Hook customizado para gerenciar toda a lógica de pagamento PIX
 * 
 * Responsabilidades:
 * - Gerar PIX via API
 * - Verificar status do pagamento (manual e automático)
 * - Gerenciar timer de expiração
 * - Copiar código PIX
 * - Redirecionar após aprovação
 * 
 * @param {Object} dadosInscricao - Dados do participante
 * @param {number} valorTotal - Valor total a pagar
 * @returns {Object} Estados e funções necessários para o componente
 */
export const usePagamento = (dadosInscricao, valorTotal) => {
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
  const [dadosParticipante] = useState(dadosInscricao);
  // Ref para evitar dupla chamada do gerarPix
  const jaGerouPix = useRef(false);

   useEffect(() => {
    if (statusPagamento === "approved" && dadosPix) {
      // Pequeno delay para o usuário ver a animação de verificação
      setTimeout(() => {
        navigate("/pagamento-confirmado", {
          replace: true, // ✅ Substitui a entrada atual (não pode voltar)
          state: {
            dadosParticipante: dadosInscricao,
            valorTotal: valorTotal,
            numeroPagamento: dadosPix.pagamentoId,
          },
        });
      }, 1000);
    }
  }, [statusPagamento, dadosPix, navigate, dadosInscricao, valorTotal]);
  // ========================================
  // VALIDAÇÃO INICIAL
  // ========================================
  useEffect(() => {
    if (!dadosInscricao || !valorTotal) {
      alert("Dados da inscrição não encontrados. Refaça o cadastro.");
      navigate("/cadastro");
      return;
    }

    if (jaGerouPix.current) return; // 🔒 Evita dupla chamada
    jaGerouPix.current = true;

    gerarPix();
  }, []); // Executa apenas uma vez

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
  }, [dadosPix, statusPagamento, navigate]);

  // ========================================
  // POLLING AUTOMÁTICO DE STATUS
  // ========================================
  useEffect(() => {
    if (!dadosPix || statusPagamento !== "pending") return;

    const intervalo = setInterval(() => {
      verificarStatusSilencioso();
    }, 5000); // Verifica a cada 5 segundos

    return () => clearInterval(intervalo);
  }, [dadosPix?.pagamentoId, statusPagamento]);

  // ========================================
  // FUNÇÕES - API
  // ========================================

  /**
   * 🏦 Gerar PIX no backend
   */
  const gerarPix = async () => {
    setLoading((prev) => ({ ...prev, gerandoPix: true }));
    setErro(null);

    try {
      console.log("🏦 [usePagamento] Gerando PIX...");

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

      console.log("✅ [usePagamento] PIX gerado com sucesso:", data.dados);

      setDadosPix(data.dados);
      setTempoRestante(data.dados.minutosExpiracao * 60); // Converter para segundos
    } catch (error) {
      console.error("❌ [usePagamento] Erro ao gerar PIX:", error);
      setErro(error.message || "Erro ao gerar PIX. Tente novamente.");
    } finally {
      setLoading((prev) => ({ ...prev, gerandoPix: false }));
    }
  };

  /**
   * 🔍 Verificar status do pagamento (com loading visual)
   */
  const verificarStatus = async () => {
    if (!dadosPix?.pagamentoId) return;

    setLoading((prev) => ({ ...prev, verificandoStatus: true }));

    try {
      console.log("🔍 [usePagamento] Verificando status do pagamento...");

      const response = await fetch(
        `http://localhost:8000/api/pagamento/status/${dadosPix.pagamentoId}`
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || "Erro ao verificar status");
      }

      console.log("📊 [usePagamento] Status recebido:", data.dados);

      if (data.dados.approved) {
        setStatusPagamento("approved");
      }
    } catch (error) {
      console.error("❌ [usePagamento] Erro ao verificar status:", error);
      alert(error.message || "Erro ao verificar status. Tente novamente.");
    } finally {
      setLoading((prev) => ({ ...prev, verificandoStatus: false }));
    }
  };

  /**
   * 🔍 Verificar status silenciosamente (polling automático)
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
      }
    } catch (error) {
      // Silencioso - não mostrar erro ao usuário
      console.log("⚠️ [usePagamento] Erro no polling (silencioso):", error);
    }
  };

  // ========================================
  // FUNÇÕES - UTILIDADES
  // ========================================

  /**
   * 📋 Copiar código PIX para área de transferência
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
   * ⏱️ Formatar tempo restante (MM:SS)
   */
  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${String(minutos).padStart(2, "0")}:${String(segs).padStart(
      2,
      "0"
    )}`;
  };

  /**
   * 🔄 Cancelar e voltar ao cadastro
   */
  const cancelarPagamento = () => {
    navigate("/cadastro");
  };

  /**
   * 🧪 SIMULAR APROVAÇÃO - Apenas para desenvolvimento/teste
   * Chama a rota de simulação do backend para aprovar o pagamento sem Mercado Pago
   */
  const simularAprovacao = async () => {
    if (!dadosPix?.pagamentoId) {
      alert("Dados do PIX não encontrados!");
      return;
    }

    // 🔍 DEBUG: Ver o que temos disponível
    console.log("🧪 [DEBUG] dadosPix completo:", dadosPix);
    console.log("🧪 [DEBUG] externalReference:", dadosPix.externalReference);
    console.log("🧪 [DEBUG] numeroInscricao:", dadosPix.participante?.numeroInscricao);

    // Confirmação antes de simular
    const confirmar = window.confirm(
      "⚠️ SIMULAÇÃO DE PAGAMENTO\n\n" +
      "Isso vai marcar o pagamento como APROVADO sem passar pelo Mercado Pago.\n\n" +
      "Usar apenas em DESENVOLVIMENTO/TESTE!\n\n" +
      "Deseja continuar?"
    );

    if (!confirmar) return;

    setLoading((prev) => ({ ...prev, verificandoStatus: true }));

    try {
      console.log("🧪 [usePagamento] Simulando aprovação do pagamento...");

      // ✅ CORREÇÃO: Usar dadosPix.externalReference ao invés de numeroInscricao
      const payload = {
        status: "approved",
        external_reference: dadosPix.externalReference, // ✅ CORRETO!
        date_approved: new Date().toISOString(),
      };

      console.log("📤 [usePagamento] Payload enviado:", payload);

      const response = await fetch(
        `http://localhost:8000/api/pagamento/status/${dadosPix.pagamentoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || "Erro ao simular aprovação");
      }

      console.log("✅ [usePagamento] Pagamento simulado como aprovado!");
      
      // Atualizar status (SEM redirecionar)
      setStatusPagamento("approved");

    } catch (error) {
      console.error("❌ [usePagamento] Erro ao simular aprovação:", error);
      alert(error.message || "Erro ao simular aprovação. Tente novamente.");
    } finally {
      setLoading((prev) => ({ ...prev, verificandoStatus: false }));
    }
  };

  // ========================================
  // RETORNO DO HOOK
  // ========================================
  return {
    // Estados
    dadosPix,
    statusPagamento,
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
    simularAprovacao, // 🧪 Nova função para testes
  };
};

export default usePagamento;