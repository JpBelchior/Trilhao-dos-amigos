// frontend/src/componentes/Admin/ModalAdminParticipante.jsx
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

// IMPORTAR COMPONENTES REUTILIZÁVEIS
import {
  InputTexto,
  InputSelect,
  InputTextarea,
  SeletorCategoriaMoto,
} from "../form";

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
    categoriaMoto: "",
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
    { value: "pendente", label: "⏳ Pendente" },
    { value: "confirmado", label: "✅ Confirmado" },
    { value: "cancelado", label: "❌ Cancelado" },
  ];

  // Carregar dados do participante quando modal abrir
  useEffect(() => {
    if (isOpen && participante) {
      setFormData({
        nome: participante.nome || "",
        modeloMoto: participante.modeloMoto || "",
        categoriaMoto: participante.categoriaMoto || "nacional",
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
      setAlteracoes((prev) => {
        const novas = { ...prev };
        delete novas[campo];
        return novas;
      });
    }

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
    if (!validarFormulario()) return;

    if (Object.keys(alteracoes).length === 0) {
      setErro("Nenhuma alteração foi feita");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const response = await fetchAuth(
        `http://localhost:8000/api/participantes/${participante.id}`,
        {
          method: "PUT",
          body: JSON.stringify(alteracoes),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        onSuccess && onSuccess(data.dados);
        setModoEdicao(false);
        setAlteracoes({});
        alert(`✅ Dados de ${formData.nome} atualizados com sucesso!`);
      } else {
        throw new Error(data.erro || "Erro ao atualizar participante");
      }
    } catch (error) {
      setErro(error.message || "Erro ao salvar alterações");
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edição
  const cancelarEdicao = () => {
    setFormData({
      nome: participante.nome || "",
      modeloMoto: participante.modeloMoto || "",
      categoriaMoto: participante.categoriaMoto || "nacional",
      statusPagamento: participante.statusPagamento || "pendente",
      observacoes: participante.observacoes || "",
    });
    setAlteracoes({});
    setErro("");
    setModoEdicao(false);
  };

  if (!isOpen || !participante) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-900/20 via-black to-green-900/20 backdrop-blur-lg rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-green-400/30">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-green-400/30">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <User className="mr-3 text-green-400" size={28} />
            {participante.nome}
            <span className="text-sm text-gray-400 ml-3">
              #{participante.numeroInscricao}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="mx-6 mt-4 bg-red-900/30 border border-red-400/50 rounded-xl p-4 flex items-center">
            <AlertTriangle className="text-red-400 mr-3" size={20} />
            <span className="text-red-300">{erro}</span>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL */}
        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* COLUNA 1: DADOS FIXOS */}
            <div>
              <h3 className="text-xl font-bold text-white flex items-center mb-6">
                <Eye className="mr-3 text-blue-400" size={24} />
                Informações Gerais
              </h3>

              <div className="space-y-4">
                {/* Dados pessoais não editáveis */}
                <div className="bg-black/40 rounded-xl p-4">
                  <h4 className="text-blue-400 font-bold mb-3">
                    👤 Dados Pessoais
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">CPF:</span>
                      <span className="text-white ml-2">
                        {participante.cpf}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white ml-2">
                        {participante.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Telefone:</span>
                      <span className="text-white ml-2">
                        {participante.telefone}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Cidade:</span>
                      <span className="text-white ml-2">
                        {participante.cidade}/{participante.estado}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informações da inscrição */}
                <div className="bg-black/40 rounded-xl p-4">
                  <h4 className="text-blue-400 font-bold mb-3">📋 Inscrição</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Data:</span>
                      <span className="text-white ml-2">
                        {new Date(
                          participante.dataInscricao
                        ).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Valor:</span>
                      <span className="text-green-400 font-bold ml-2">
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
                  <h4 className="text-blue-400 font-bold mb-3">👕 Camiseta</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Tamanho:</span>
                      <span className="text-white ml-2">
                        {participante.tamanhoCamiseta}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tipo:</span>
                      <span className="text-white ml-2">
                        {participante.tipoCamiseta === "manga_curta"
                          ? "Manga Curta"
                          : "Manga Longa"}
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
                {/* USANDO COMPONENTES REUTILIZÁVEIS */}
                <InputTexto
                  label="Nome Completo"
                  value={formData.nome}
                  onChange={(valor) => atualizarCampo("nome", valor)}
                  placeholder="Nome do participante"
                  disabled={!modoEdicao || loading}
                  required
                  icon={User}
                  variant="admin"
                />

                <InputTexto
                  label="Modelo da Moto"
                  value={formData.modeloMoto}
                  onChange={(valor) => atualizarCampo("modeloMoto", valor)}
                  placeholder="Ex: Honda Bros 160, KTM 350 EXC-F"
                  disabled={!modoEdicao || loading}
                  required
                  icon={Bike}
                  variant="admin"
                />

                <SeletorCategoriaMoto
                  value={formData.categoriaMoto}
                  onChange={(categoria) =>
                    atualizarCampo("categoriaMoto", categoria)
                  }
                  disabled={!modoEdicao || loading}
                  size="medium"
                  labelClassName="block text-gray-300 mb-2 font-semibold"
                />

                <InputSelect
                  label="Status de Pagamento"
                  value={formData.statusPagamento}
                  onChange={(valor) => atualizarCampo("statusPagamento", valor)}
                  options={statusOptions}
                  disabled={!modoEdicao || loading}
                  required
                  icon={CreditCard}
                  variant="admin"
                />

                <InputTextarea
                  label="Observações"
                  value={formData.observacoes}
                  onChange={(valor) => atualizarCampo("observacoes", valor)}
                  placeholder="Observações sobre o participante..."
                  disabled={!modoEdicao || loading}
                  rows={4}
                  icon={FileText}
                  variant="admin"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ COM AÇÕES */}
        <div className="border-t border-green-400/30 p-6">
          {!modoEdicao ? (
            // Modo visualização
            <div className=" flex justify-center items-center">
              <button
                onClick={() => setModoEdicao(true)}
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center"
              >
                <Edit3 className="mr-2" size={16} />
                Editar Dados
              </button>
            </div>
          ) : (
            // Modo edição
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
                  <Loader2 className="mr-2 animate-spin" size={16} />
                ) : (
                  <Save className="mr-2" size={16} />
                )}
                Salvar Alterações
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalAdminParticipante;
