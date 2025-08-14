// frontend/src/componentes/Admin/CompactParticipantCard.jsx
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  CheckCircle,
  Clock,
  XCircle,
  Bike,
  MapPin,
  Users,
  Mail,
  Phone,
  DollarSign,
  Trash2,
  User,
} from "lucide-react";
import ExpandToggleButton from "../ExpandToggleButton";
const CompactParticipantCard = ({
  participante,
  index,
  indiceInicio,
  selecionarParticipante,
  confirmarPagamento,
  excluirParticipante,
  operacaoLoading,
}) => {
  const [expandido, setExpandido] = useState(false);

  // Função helper para tratar valores monetários
  const formatarValor = (valor) => {
    if (!valor && valor !== 0) return "0.00";
    const numeroValor = typeof valor === "number" ? valor : parseFloat(valor);
    return isNaN(numeroValor) ? "0.00" : numeroValor.toFixed(2);
  };

  // Função helper para tratar strings de camiseta
  const formatarTipoCamiseta = (tipo) => {
    if (!tipo) return "N/A";
    return tipo.toString().replace(/_/g, " ").toLowerCase();
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmado":
        return "border-green-400/30 text-green-400/60";
      case "pendente":
        return "border-yellow-400/30 text-yellow-400/60";
      case "cancelado":
        return "border-red-400/30 text-red-400/60";
      default:
        return "border-gray-400/30 text-gray-400/60";
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmado":
        return <CheckCircle size={16} className="text-green-400" />;
      case "pendente":
        return <Clock size={16} className="text-yellow-400" />;
      case "cancelado":
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  // Função para obter cor da categoria
  const getCategoriaColor = (categoria) => {
    return categoria === "nacional"
      ? "bg-yellow-900/50 text-yellow-300"
      : "bg-green-900/50 text-green-300";
  };

  // Função para confirmar pagamento
  const handleConfirmarPagamento = async (e) => {
    e.stopPropagation();
    const valorFormatado = formatarValor(participante.valorInscricao);

    const confirmacao = window.confirm(
      `Confirmar pagamento de ${participante.nome}?\n\nValor: R$ ${valorFormatado}\nEsta ação não pode ser desfeita.`
    );

    if (confirmacao) {
      const observacoes = window.prompt(
        "Observações sobre a confirmação (opcional):",
        "Pagamento confirmado manualmente pelo administrador"
      );

      await confirmarPagamento(participante.id, observacoes || "");
    }
  };

  // Função para excluir participante
  const handleExcluir = async (e) => {
    e.stopPropagation();
    const confirmacao = window.confirm(
      `⚠️ ATENÇÃO: Excluir permanentemente ${participante.nome}?\n\nEsta ação não pode ser desfeita e liberará todas as camisetas reservadas.`
    );

    if (confirmacao) {
      await excluirParticipante(participante);
    }
  };

  return (
    <div
      className={`bg-black/40 backdrop-blur-lg rounded-2xl border transition-all duration-300 ${getStatusColor(
        participante.statusPagamento
      )} ${expandido ? "p-6" : "p-4"} hover:scale-[1.01]`}
    >
      {/* VIEW COMPACTO - Sempre visível */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpandido(!expandido)}
      >
        {/* Informações básicas */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Número */}
          <div className="bg-yellow-500 text-black font-black w-10 h-10 rounded-full flex items-center justify-center text-sm">
            #{indiceInicio + index + 1}
          </div>

          {/* Nome e moto */}
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg leading-tight">
              {participante.nome || "Nome não informado"}
            </h4>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center text-gray-300 text-sm">
                <Bike className="mr-1 text-yellow-400" size={14} />
                {participante.modeloMoto || "Moto não informada"}
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-bold ${getCategoriaColor(
                  participante.categoriaMoto
                )}`}
              >
                {participante.categoriaMoto === "nacional"
                  ? "🇧🇷 Nacional"
                  : "🌍 Importada"}
              </div>
            </div>
          </div>
        </div>

        {/* Status e controles */}
        <div className="flex items-center space-x-3">
          {/* Status */}
          <div className="flex items-center space-x-1">
            {getStatusIcon(participante.statusPagamento)}
            <span className="text-sm font-semibold capitalize">
              {participante.statusPagamento}
            </span>
          </div>

          {/* Botão expandir */}
          <ExpandToggleButton
            isExpanded={expandido}
            onToggle={() => setExpandido(!expandido)}
            expandedText=""
            collapsedText=""
            label=""
            variant="default"
            size="small"
            className="p-1 text-gray-400 hover:text-white"
          />
        </div>
      </div>

      {/* VIEW EXPANDIDO - Condicional */}
      {expandido && (
        <div className="mt-6 space-y-6 animate-fadeIn">
          {/* Divisor */}
          <div className="border-t border-gray-600/30"></div>

          {/* Informações detalhadas em grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* COLUNA 1: Contato */}
            <div className="space-y-3">
              <h5 className="text-white font-semibold text-sm flex items-center">
                <User className="mr-2 text-blue-400" size={16} />
                Contato
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-300">
                  <Mail className="mr-2 text-blue-400" size={14} />
                  {participante.email || "N/A"}
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="mr-2 text-green-400" size={14} />
                  {participante.telefone || "N/A"}
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="mr-2 text-yellow-400" size={14} />
                  {participante.cidade || "N/A"} -{" "}
                  {participante.estado || "N/A"}
                </div>
              </div>
            </div>

            {/* COLUNA 2: Valores e camisetas */}
            <div className="space-y-3">
              <h5 className="text-white font-semibold text-sm flex items-center">
                <DollarSign className="mr-2 text-green-400" size={16} />
                Financeiro
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor total:</span>
                  <span className="text-white font-bold">
                    R$ {formatarValor(participante.valorInscricao)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Camiseta:</span>
                  <span className="text-white">
                    {participante.tamanhoCamiseta || "N/A"} -{" "}
                    {formatarTipoCamiseta(participante.tipoCamiseta)}
                  </span>
                </div>
                {participante.camisetasExtras &&
                  participante.camisetasExtras.length > 0 && (
                    <div className="mt-2">
                      <span className="text-gray-400 text-sm block mb-2">
                        Camisetas extras:
                      </span>

                      {participante.camisetasExtras.map((extra, index) => (
                        <span key={index} className="text-white text-sm">
                          | {extra.tamanho} - {formatarTipoCamiseta(extra.tipo)}{" "}
                          |{" "}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* COLUNA 3: Identificação */}
            <div className="space-y-3">
              <h5 className="text-white font-semibold text-sm flex items-center">
                <Users className="mr-2 text-purple-400" size={16} />
                Identificação
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">CPF:</span>
                  <span className="text-white font-mono">
                    {participante.cpf || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Inscrição:</span>
                  <span className="text-yellow-400 font-bold">
                    {participante.numeroInscricao || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Observações se houver */}
          {participante.observacoes && (
            <div className="bg-black/40 rounded-xl p-3">
              <h5 className="text-white font-semibold text-sm mb-2">
                📝 Observações
              </h5>
              <p className="text-gray-300 text-sm">
                {participante.observacoes}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-600/30">
            {/* Botão Editar - sempre disponível */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                selecionarParticipante(participante);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all flex items-center text-sm font-semibold"
            >
              <Edit3 className="mr-2" size={16} />
              Editar Dados
            </button>

            {/* Botão Confirmar - apenas para pendentes */}
            {participante.statusPagamento === "pendente" && (
              <button
                onClick={handleConfirmarPagamento}
                disabled={operacaoLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all flex items-center text-sm font-semibold disabled:opacity-50"
              >
                <CheckCircle className="mr-2" size={16} />
                Confirmar Pagamento
              </button>
            )}

            <button
              onClick={handleExcluir}
              disabled={operacaoLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all flex items-center text-sm font-semibold disabled:opacity-50"
            >
              <Trash2 className="mr-2" size={16} />
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactParticipantCard;
