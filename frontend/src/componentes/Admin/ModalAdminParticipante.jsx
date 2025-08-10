import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  User,
  Bike,
  CreditCard,
  FileText,
  AlertTriangle,
  Loader2,
  Eye,
  Edit3,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ModalAdminParticipante = ({
  participante,
  isOpen,
  onClose,
  onSuccess,
  onDelete,
}) => {
  const { fetchAuth } = useAuth();

  // Estados do formulário - APENAS CAMPOS EDITÁVEIS
  const [formData, setFormData] = useState({
    nome: "",
    modeloMoto: "",
    statusPagamento: "",
    observacoes: "",
  });

  // Estados da UI
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [alteracoes, setAlteracoes] = useState({});

  // Opções de status de pagamento
  const statusOptions = [
    { value: "pendente", label: "⏳ Pendente", color: "text-yellow-400" },
    { value: "confirmado", label: "✅ Confirmado", color: "text-green-400" },
    { value: "cancelado", label: "❌ Cancelado", color: "text-red-400" },
  ];

  // Carregar dados do participante quando modal abrir
  useEffect(() => {
    if (isOpen && participante) {
      console.log(
        "📝 [ModalAdminParticipante] Carregando dados:",
        participante.nome
      );

      setFormData({
        nome: participante.nome || "",
        modeloMoto: participante.modeloMoto || "",
        statusPagamento: participante.statusPagamento || "pendente",
        observacoes: participante.observacoes || "",
      });

      setAlteracoes({});
      setErro("");
      setModoEdicao(false);
    }
  }, [isOpen, participante]);

  // Atualizar campo e marcar como alterado
  const atualizarCampo = (campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    // Marcar campo como alterado se for diferente do original
    const valorOriginal = participante?.[campo] || "";
    if (valor !== valorOriginal) {
      setAlteracoes((prev) => ({
        ...prev,
        [campo]: valor,
      }));
    } else {
      // Remover das alterações se voltou ao valor original
      setAlteracoes((prev) => {
        const novas = { ...prev };
        delete novas[campo];
        return novas;
      });
    }

    // Limpar erro ao digitar
    if (erro) setErro("");
  };

  // Validar formulário
  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      setErro("Nome é obrigatório");
      return false;
    }

    if (!formData.modeloMoto.trim()) {
      setErro("Modelo da moto é obrigatório");
      return false;
    }

    if (!formData.statusPagamento) {
      setErro("Status de pagamento é obrigatório");
      return false;
    }

    return true;
  };

  // Salvar alterações
  const salvarAlteracoes = async () => {
    if (!validarFormulario()) {
      return;
    }

    // Verificar se há alterações
    if (Object.keys(alteracoes).length === 0) {
      setErro("Nenhuma alteração foi feita");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      console.log("💾 [ModalAdminParticipante] Salvando alterações:", {
        participanteId: participante.id,
        alteracoes: Object.keys(alteracoes),
      });

      // Endpoint para atualizar participante (será implementado no backend)
      const response = await fetchAuth(
        `http://localhost:8000/api/participantes/${participante.id}`,
        {
          method: "PUT",
          body: JSON.stringify(alteracoes), // Enviar apenas as alterações
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        console.log(
          "✅ [ModalAdminParticipante] Participante atualizado com sucesso"
        );

        // Chamar callback de sucesso
        onSuccess && onSuccess(data.dados);

        // Sair do modo edição
        setModoEdicao(false);
        setAlteracoes({});

        alert(`✅ Dados de ${formData.nome} atualizados com sucesso!`);
      } else {
        throw new Error(data.erro || "Erro ao atualizar participante");
      }
    } catch (error) {
      console.error("❌ [ModalAdminParticipante] Erro ao salvar:", error);
      setErro(error.message || "Erro ao salvar alterações");
    } finally {
      setLoading(false);
    }
  };

  // Excluir participante
  const excluirParticipante = async () => {
    const confirmacao = window.confirm(
      `⚠️ ATENÇÃO: Excluir permanentemente ${participante.nome}?\n\nEsta ação não pode ser desfeita e liberará todas as camisetas reservadas.`
    );

    if (!confirmacao) return;

    const confirmacaoFinal = window.confirm(
      `Tem certeza absoluta? Digite "EXCLUIR" para confirmar.`
    );

    const textoConfirmacao = window.prompt(
      'Digite "EXCLUIR" (em maiúsculas) para confirmar a exclusão:'
    );

    if (textoConfirmacao !== "EXCLUIR") {
      alert("Exclusão cancelada. Texto de confirmação incorreto.");
      return;
    }

    setLoading(true);

    try {
      console.log(
        "🗑️ [ModalAdminParticipante] Excluindo participante:",
        participante.id
      );

      const response = await fetchAuth(
        `http://localhost:8000/api/participantes/${participante.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        console.log(
          "✅ [ModalAdminParticipante] Participante excluído com sucesso"
        );

        // Chamar callback de exclusão
        onDelete && onDelete(participante.id);

        // Fechar modal
        onClose();

        alert(`✅ ${participante.nome} excluído com sucesso!`);
      } else {
        throw new Error(data.erro || "Erro ao excluir participante");
      }
    } catch (error) {
      console.error("❌ [ModalAdminParticipante] Erro ao excluir:", error);
      setErro(error.message || "Erro ao excluir participante");
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edição
  const cancelarEdicao = () => {
    // Restaurar dados originais
    setFormData({
      nome: participante.nome || "",
      modeloMoto: participante.modeloMoto || "",
      statusPagamento: participante.statusPagamento || "pendente",
      observacoes: participante.observacoes || "",
    });

    setAlteracoes({});
    setErro("");
    setModoEdicao(false);
  };

  // Não renderizar se não estiver aberto
  if (!isOpen || !participante) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-900/90 to-black/90 backdrop-blur-lg rounded-3xl border border-green-400/30 w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between p-6 border-b border-green-400/30">
          <div>
            <h2 className="text-3xl font-black text-white">
              {modoEdicao ? "EDITAR" : "VISUALIZAR"}{" "}
              <span className="text-yellow-400">PARTICIPANTE</span>
            </h2>
            <p className="text-gray-400">
              {participante.numeroInscricao} - {participante.nome}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {!modoEdicao && (
              <>
                <button
                  onClick={() => setModoEdicao(true)}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all flex items-center"
                >
                  <Edit3 className="mr-2" size={16} />
                  Editar
                </button>

                <button
                  onClick={excluirParticipante}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all flex items-center"
                >
                  <Trash2 className="mr-2" size={16} />
                  Excluir
                </button>
              </>
            )}

            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* CONTEÚDO - SCROLLÁVEL */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {/* MENSAGEM DE ERRO */}
          {erro && (
            <div className="bg-red-900/50 border border-red-400/50 rounded-2xl p-4 mb-6 flex items-center">
              <AlertTriangle className="text-red-400 mr-3" size={20} />
              <span className="text-red-300">{erro}</span>
            </div>
          )}

          {/* INDICADOR DE ALTERAÇÕES */}
          {Object.keys(alteracoes).length > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-400/50 rounded-2xl p-4 mb-6">
              <h4 className="text-yellow-400 font-bold mb-2">
                Alterações Pendentes:
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(alteracoes).map((campo) => (
                  <span
                    key={campo}
                    className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold"
                  >
                    {campo === "statusPagamento" ? "Status" : campo}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* COLUNA 1: DADOS SOMENTE LEITURA */}
            <div>
              <h3 className="text-xl font-bold text-white flex items-center mb-6">
                <Eye className="mr-3 text-green-400" size={24} />
                Dados de Visualização (Somente Leitura)
              </h3>

              <div className="space-y-4">
                {/* Dados pessoais */}
                <div className="bg-black/40 rounded-xl p-4">
                  <h4 className="text-green-400 font-bold mb-3">
                    📋 Dados Pessoais
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Email:</span>{" "}
                      <span className="text-white">{participante.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Telefone:</span>{" "}
                      <span className="text-white">
                        {participante.telefone}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">CPF:</span>{" "}
                      <span className="text-white">{participante.cpf}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Cidade/Estado:</span>{" "}
                      <span className="text-white">
                        {participante.cidade} - {participante.estado}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dados da inscrição */}
                <div className="bg-black/40 rounded-xl p-4">
                  <h4 className="text-green-400 font-bold mb-3">
                    🎫 Dados da Inscrição
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Número:</span>{" "}
                      <span className="text-white font-bold">
                        {participante.numeroInscricao}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Data:</span>{" "}
                      <span className="text-white">
                        {new Date(
                          participante.dataInscricao
                        ).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Valor:</span>{" "}
                      <span className="text-green-400 font-bold">
                        R${" "}
                        {parseFloat(participante.valorInscricao || 0).toFixed(
                          2
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Camiseta */}
                <div className="bg-black/40 rounded-xl p-4">
                  <h4 className="text-green-400 font-bold mb-3">👕 Camiseta</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Tamanho:</span>{" "}
                      <span className="text-white">
                        {participante.tamanhoCamiseta}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tipo:</span>{" "}
                      <span className="text-white">
                        {participante.tipoCamiseta === "manga_curta"
                          ? "Manga Curta"
                          : "Manga Longa"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Categoria Moto:</span>{" "}
                      <span className="text-white">
                        {participante.categoriaMoto === "nacional"
                          ? "🇧🇷 Nacional"
                          : "🌍 Importada"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUNA 2: DADOS EDITÁVEIS */}
            <div>
              <h3 className="text-xl font-bold text-white flex items-center mb-6">
                <Edit3 className="mr-3 text-yellow-400" size={24} />
                Dados Editáveis
              </h3>

              <div className="space-y-6">
                {/* Nome */}
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    <User className="inline mr-2" size={16} />
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => atualizarCampo("nome", e.target.value)}
                    disabled={!modoEdicao || loading}
                    className={`w-full border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${
                      modoEdicao && !loading
                        ? "bg-black/50 border-gray-600 focus:border-yellow-400"
                        : "bg-gray-800 border-gray-700 cursor-not-allowed"
                    }`}
                    placeholder="Nome do participante"
                  />
                </div>

                {/* Modelo da Moto */}
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    <Bike className="inline mr-2" size={16} />
                    Modelo da Moto *
                  </label>
                  <input
                    type="text"
                    value={formData.modeloMoto}
                    onChange={(e) =>
                      atualizarCampo("modeloMoto", e.target.value)
                    }
                    disabled={!modoEdicao || loading}
                    className={`w-full border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${
                      modoEdicao && !loading
                        ? "bg-black/50 border-gray-600 focus:border-yellow-400"
                        : "bg-gray-800 border-gray-700 cursor-not-allowed"
                    }`}
                    placeholder="Ex: Honda Bros 160, KTM 350 EXC-F"
                  />
                </div>

                {/* Status de Pagamento */}
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    <CreditCard className="inline mr-2" size={16} />
                    Status de Pagamento *
                  </label>
                  <select
                    value={formData.statusPagamento}
                    onChange={(e) =>
                      atualizarCampo("statusPagamento", e.target.value)
                    }
                    disabled={!modoEdicao || loading}
                    className={`w-full border rounded-xl px-4 py-3 text-white focus:outline-none appearance-none transition-all ${
                      modoEdicao && !loading
                        ? "bg-black/50 border-gray-600 focus:border-yellow-400"
                        : "bg-gray-800 border-gray-700 cursor-not-allowed"
                    }`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    <FileText className="inline mr-2" size={16} />
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) =>
                      atualizarCampo("observacoes", e.target.value)
                    }
                    disabled={!modoEdicao || loading}
                    rows="4"
                    className={`w-full border rounded-xl px-4 py-3 text-white focus:outline-none resize-none transition-all ${
                      modoEdicao && !loading
                        ? "bg-black/50 border-gray-600 focus:border-yellow-400"
                        : "bg-gray-800 border-gray-700 cursor-not-allowed"
                    }`}
                    placeholder="Observações sobre o participante..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ COM AÇÕES */}
        {modoEdicao && (
          <div className="border-t border-green-400/30 p-6">
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelarEdicao}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={salvarAlteracoes}
                disabled={loading || Object.keys(alteracoes).length === 0}
                className={`font-bold py-3 px-6 rounded-xl transition-all flex items-center ${
                  loading || Object.keys(alteracoes).length === 0
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={20} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalAdminParticipante;
