import React from "react";
import { useNavigate } from "react-router-dom";
import {
  XCircle,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  Wifi,
  Home,
  CreditCard,
  Users,
} from "lucide-react";

const ErroComponent = ({
  erro = "Erro desconhecido",
  onTentarNovamente,

  className = "",
}) => {
  const navigate = useNavigate();

  // Detectar automaticamente o tipo de erro pela mensagem
  const detectarTipoErro = (mensagemErro) => {
    const msg = mensagemErro.toLowerCase();

    if (
      msg.includes("conexão") ||
      msg.includes("network") ||
      msg.includes("fetch")
    ) {
      return "conexao";
    }
    if (
      msg.includes("pagamento") ||
      msg.includes("pix") ||
      msg.includes("mercado pago")
    ) {
      return "pagamento";
    }
    if (
      msg.includes("não encontrado") ||
      msg.includes("404") ||
      msg.includes("not found")
    ) {
      return "notfound";
    }
    if (
      msg.includes("participante") ||
      msg.includes("inscritos") ||
      msg.includes("cadastro")
    ) {
      return "participantes";
    }
    if (
      msg.includes("obrigatório") ||
      msg.includes("válido") ||
      msg.includes("preencha")
    ) {
      return "validacao";
    }

    return "geral";
  };

  // Processar erro (string simples ou objeto)
  let mensagemErro, tipoErro, detalhesErro;

  if (typeof erro === "string") {
    mensagemErro = erro;
    tipoErro = detectarTipoErro(erro);
    detalhesErro = "";
  } else {
    mensagemErro = erro.mensagem || erro.erro || "Erro desconhecido";
    tipoErro = erro.tipo || detectarTipoErro(mensagemErro);
    detalhesErro = erro.detalhes || "";
  }

  // Configurações automáticas baseadas no tipo
  const configuracoes = {
    conexao: {
      icone: Wifi,
      titulo: "Sem Conexão",

      dica: "Verifique sua internet e tente novamente",
    },
    pagamento: {
      icone: CreditCard,
      titulo: "Erro no Pagamento",

      dica: "Verifique os dados e tente novamente",
    },
    notfound: {
      icone: AlertTriangle,
      titulo: "Não Encontrado",

      dica: "A página ou dados não foram encontrados",
    },
    participantes: {
      icone: Users,
      titulo: "Erro nos Participantes",

      dica: "Erro ao carregar dados dos participantes",
    },
    validacao: {
      icone: AlertTriangle,
      titulo: "Dados Inválidos",

      dica: "Corrija os campos e tente novamente",
    },
    geral: {
      icone: XCircle,
      titulo: "Ops! Algo deu errado",

      dica: "Tente novamente em alguns instantes",
    },
  };

  const config = configuracoes[tipoErro];
  const IconeErro = config.icone;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-20 ${className}`}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-gray-600/30 text-center">
          {/* Ícone animado */}
          <div className="relative mb-6">
            <IconeErro
              className="mx-auto text-red-400 animate-pulse"
              size={80}
            />
          </div>

          {/* Título */}
          <h1 className="text-4xl font-black text-white mb-4">
            {config.titulo}
          </h1>

          {/* Dica automática */}
          <p className="text-gray-400 mb-8">{detalhesErro || config.dica}</p>

          {/* Botões inteligentes */}
          <div className="space-y-4">
            {/* Botão Tentar Novamente - só aparece se tiver função */}
            {onTentarNovamente && (
              <button
                onClick={onTentarNovamente}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center"
              >
                <RefreshCw className="mr-2" size={20} />
                Tentar Novamente
              </button>
            )}

            {/* Botão Voltar ao Início - aparece se mostrarVoltar = true */}

            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center"
            >
              <Home className="mr-2" size={20} />
              Voltar ao Início
            </button>

            {/* Se for erro de pagamento, botão para voltar ao cadastro */}
            {tipoErro === "pagamento" && (
              <button
                onClick={() => navigate("/cadastro")}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
              >
                <ArrowLeft className="mr-2" size={20} />
                Voltar ao Cadastro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErroComponent;
