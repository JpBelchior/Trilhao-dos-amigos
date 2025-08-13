// frontend/src/componentes/Admin/ListaParticipantes.jsx
import React from "react";
import { Users } from "lucide-react";
import CompactParticipantCard from "./ompactParticipantCard";

const ListaParticipantes = ({
  participantesPagina,
  indiceInicio,
  selecionarParticipante,
  confirmarPagamento,
  excluirParticipante,
  operacaoLoading,
}) => {
  // Se não há participantes, mostrar mensagem
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
      {/* Header da lista */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Users className="mr-3 text-green-400" size={24} />
          Participantes ({participantesPagina.length})
        </h3>
        <div className="text-sm text-gray-400">
          💡 Clique para expandir detalhes
        </div>
      </div>

      {/* Lista de cards compactos */}
      {participantesPagina.map((participante, index) => (
        <CompactParticipantCard
          key={participante.id}
          participante={participante}
          index={index}
          indiceInicio={indiceInicio}
          selecionarParticipante={selecionarParticipante}
          confirmarPagamento={confirmarPagamento}
          excluirParticipante={excluirParticipante}
          operacaoLoading={operacaoLoading}
        />
      ))}

      {/* Footer com dicas */}
      <div className="bg-green-900/20 rounded-xl p-4 border border-green-400/20 mt-6">
        <h4 className="text-green-400 font-semibold text-sm mb-2 flex items-center">
          💡 Dicas de navegação
        </h4>
        <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-300">
          <div>
            • <strong>Clique no card</strong> para expandir/contrair informações
          </div>
          <div>
            • <strong>Botão "Editar"</strong> abre modal completo de edição
          </div>
          <div>
            • <strong>Status pendente:</strong> permite confirmar ou excluir
          </div>
          <div>
            • <strong>Status confirmado:</strong> apenas visualização e edição
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaParticipantes;
