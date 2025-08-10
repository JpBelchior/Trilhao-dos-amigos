// frontend/src/componentes/Admin/ListaParticipantes.jsx
import React from "react";
import {
  Users,
  MapPin,
  Bike,
  CheckCircle,
  Clock,
  XCircle,
  Edit3,
  Phone,
  Mail,
  Trash2, // NOVO: ícone para excluir
} from "lucide-react";

const ListaParticipantes = ({
  participantesPagina,
  indiceInicio,
  selecionarParticipante,
  confirmarPagamento,
  excluirParticipante, // NOVO: função para excluir
  operacaoLoading,
}) => {
  // Função para obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmado":
        return "bg-green-900/50 text-green-400 border-green-400/50";
      case "pendente":
        return "bg-yellow-900/50 text-yellow-400 border-yellow-400/50";
      case "cancelado":
        return "bg-red-900/50 text-red-400 border-red-400/50";
      default:
        return "bg-gray-900/50 text-gray-400 border-gray-400/50";
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmado":
        return <CheckCircle size={16} />;
      case "pendente":
        return <Clock size={16} />;
      case "cancelado":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  // Função para obter texto do status
  const getStatusText = (status) => {
    switch (status) {
      case "confirmado":
        return "Confirmado";
      case "pendente":
        return "Pendente";
      case "cancelado":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  // Função para confirmar pagamento com prompt
  const handleConfirmarPagamento = async (participante) => {
    const confirmacao = window.confirm(
      `Confirmar pagamento de ${participante.nome}?\n\nValor: R$ ${participante.valorInscricao}\nEsta ação não pode ser desfeita.`
    );

    if (confirmacao) {
      const observacoes = window.prompt(
        "Observações sobre a confirmação (opcional):",
        "Pagamento confirmado manualmente pelo administrador"
      );

      const resultado = await confirmarPagamento(
        participante.id,
        observacoes || ""
      );

      if (resultado.sucesso) {
        alert(`✅ Pagamento de ${participante.nome} confirmado com sucesso!`);
      } else {
        alert(`❌ Erro ao confirmar pagamento: ${resultado.erro}`);
      }
    }
  };

  // NOVO: Função para excluir participante com confirmação
  const handleExcluirParticipante = async (participante) => {
    const confirmacao = window.confirm(
      `⚠️ ATENÇÃO: Excluir permanentemente ${participante.nome}?\n\nEsta ação não pode ser desfeita e liberará todas as camisetas reservadas.`
    );

    if (confirmacao) {
      const resultado = await excluirParticipante(participante.id);

      if (resultado.sucesso) {
        alert(`✅ ${participante.nome} foi excluído com sucesso!`);
      } else {
        alert(`❌ Erro ao excluir: ${resultado.erro}`);
      }
    }
  };

  if (participantesPagina.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-12 border border-gray-600/30 text-center">
        <Users className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-2xl font-bold text-white mb-2">
          Nenhum participante encontrado
        </h3>
        <p className="text-gray-400">
          Tente ajustar os filtros ou aguarde novas inscrições.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {participantesPagina.map((participante, index) => (
        <div
          key={participante.id}
          className={`bg-black/40 backdrop-blur-lg rounded-2xl p-6 border transition-all hover:scale-102 ${
            participante.statusPagamento === "confirmado"
              ? "border-green-400/30 hover:border-green-400/60"
              : participante.statusPagamento === "pendente"
              ? "border-yellow-400/30 hover:border-yellow-400/60"
              : "border-red-400/30 hover:border-red-400/60"
          }`}
        >
          <div className="grid lg:grid-cols-4 gap-6">
            {/* COLUNA 1: DADOS BÁSICOS */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-500 text-black font-black w-10 h-10 rounded-full flex items-center justify-center text-sm mr-4">
                  #{indiceInicio + index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg">
                    {participante.nome}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {participante.numeroInscricao}
                  </p>
                </div>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-300">
                  <Mail className="mr-2 text-blue-400" size={14} />
                  {participante.email}
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="mr-2 text-green-400" size={14} />
                  {participante.telefone}
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="mr-2 text-yellow-400" size={14} />
                  {participante.cidade} - {participante.estado}
                </div>
              </div>
            </div>

            {/* COLUNA 2: MOTO E VALORES */}
            <div>
              <div className="bg-black/40 rounded-xl p-4 mb-4">
                <div className="flex items-center mb-2">
                  <Bike className="mr-2 text-yellow-400" size={16} />
                  <span className="text-white font-semibold text-sm">Moto</span>
                </div>
                <div className="text-white font-bold mb-1">
                  {participante.modeloMoto}
                </div>
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                    participante.categoriaMoto === "nacional"
                      ? "bg-green-900/50 text-green-400"
                      : "bg-yellow-900/50 text-yellow-400"
                  }`}
                >
                  {participante.categoriaMoto === "nacional" ? "🇧🇷" : "🌍"}
                  {participante.categoriaMoto === "nacional"
                    ? " Nacional"
                    : " Importada"}
                </div>
              </div>

              {/* Valor da Inscrição */}
              <div className="bg-black/40 rounded-xl p-4">
                <div className="text-gray-400 text-sm">Valor da Inscrição</div>
                <div className="text-green-400 font-bold text-lg">
                  R$ {parseFloat(participante.valorInscricao || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* COLUNA 3: STATUS E AÇÕES */}
            <div>
              {/* Status do Pagamento */}
              <div className="mb-4">
                <div
                  className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(
                    participante.statusPagamento
                  )}`}
                >
                  {getStatusIcon(participante.statusPagamento)}
                  <span className="ml-2">
                    {getStatusText(participante.statusPagamento)}
                  </span>
                </div>
              </div>

              {/* Ações Administrativas */}
              <div className="space-y-2">
                {/* LINHA COM BOTÕES LADO A LADO */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Botão Editar */}
                  <button
                    onClick={() => selecionarParticipante(participante)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center text-sm"
                  >
                    <Edit3 className="mr-1" size={12} />
                    Editar
                  </button>

                  {/* Botão Excluir */}
                  <button
                    onClick={() => handleExcluirParticipante(participante)}
                    disabled={operacaoLoading}
                    className={`font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center text-sm ${
                      operacaoLoading
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    <Trash2 className="mr-1" size={12} />
                    Excluir
                  </button>
                </div>

                {/* BOTÕES ESPECÍFICOS POR STATUS - EMBAIXO */}
                {participante.statusPagamento === "pendente" && (
                  <button
                    onClick={() => handleConfirmarPagamento(participante)}
                    disabled={operacaoLoading}
                    className={`w-full font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center text-sm ${
                      operacaoLoading
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    <CheckCircle className="mr-2" size={14} />
                    Confirmar Pagamento
                  </button>
                )}

                {participante.statusPagamento === "cancelado" && (
                  <div className="text-center text-gray-500 text-sm py-2">
                    Inscrição cancelada
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Observações (se houver) */}
          {participante.observacoes && (
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="text-gray-400 text-sm">
                <strong>Observações:</strong> {participante.observacoes}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ListaParticipantes;
