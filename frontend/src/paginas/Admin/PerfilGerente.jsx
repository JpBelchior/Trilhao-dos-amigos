import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { InputTexto } from "../../componentes/form";

const PerfilGerente = () => {
  const { gerente, atualizarPerfil } = useAuth();
  const navigate = useNavigate();

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: gerente?.nome || "",
    email: gerente?.email || "",
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  // Estados da UI
  const [mostrarSenhas, setMostrarSenhas] = useState({
    atual: false,
    nova: false,
    confirmar: false,
  });
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  // Atualizar campo do formulário
  const atualizarCampo = (campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
    // Limpar mensagens quando usuário digitar
    if (erro) setErro("");
    if (sucesso) setSucesso("");
  };

  // Alternar visibilidade das senhas
  const toggleMostrarSenha = (tipo) => {
    setMostrarSenhas((prev) => ({
      ...prev,
      [tipo]: !prev[tipo],
    }));
  };

  // Validar dados antes de enviar
  const validarFormulario = () => {
    // Verificar se nome foi alterado
    const nomeAlterado = formData.nome.trim() !== gerente.nome;

    // Verificar se email foi alterado
    const emailAlterado =
      formData.email.trim().toLowerCase() !== gerente.email.toLowerCase();

    // Verificar se há dados de senha
    const temDadosSenha =
      formData.novaSenha || formData.senhaAtual || formData.confirmarSenha;

    // Se não há nenhuma alteração
    if (!nomeAlterado && !emailAlterado && !temDadosSenha) {
      setErro("Nenhuma alteração foi feita");
      return false;
    }

    if (temDadosSenha) {
      if (!formData.senhaAtual.trim()) {
        setErro("Senha atual é obrigatória para alterar dados");
        return false;
      }

      if (formData.novaSenha) {
        if (formData.novaSenha.length < 6) {
          setErro("Nova senha deve ter pelo menos 6 caracteres");
          return false;
        }

        if (formData.novaSenha !== formData.confirmarSenha) {
          setErro("Confirmação de senha não confere");
          return false;
        }
      }
    }

    return true;
  };

  // Submeter alterações
  const submeterAlteracoes = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setErro("");
    setSucesso("");

    try {
      // Preparar dados apenas com campos alterados
      const dadosAlteracao = {};

      // Adicionar senha atual se fornecida
      if (formData.senhaAtual.trim()) {
        dadosAlteracao.senhaAtual = formData.senhaAtual;
      }

      // Adicionar nova senha se fornecida
      if (formData.novaSenha) {
        dadosAlteracao.novaSenha = formData.novaSenha;
        dadosAlteracao.confirmarSenha = formData.confirmarSenha;
      }

      // Usar função do contexto para atualizar
      const resultado = await atualizarPerfil(dadosAlteracao);

      if (resultado.sucesso) {
        setSucesso("✅ Perfil atualizado com sucesso!");

        // Limpar campos de senha
        setFormData((prev) => ({
          ...prev,
          senhaAtual: "",
          novaSenha: "",
          confirmarSenha: "",
        }));

        // Atualizar dados locais se nome/email mudaram
        if (dadosAlteracao.nome || dadosAlteracao.email) {
          setFormData((prev) => ({
            ...prev,
            nome: resultado.dados.nome,
            email: resultado.dados.email,
          }));
        }
      } else {
        throw new Error(resultado.erro || "Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar perfil:", error);
      setErro(error.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin")}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-white">Perfil do Gerente</h1>
          </div>
        </div>

        {/* Formulário */}
        <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
          {/* Mensagens */}
          {sucesso && (
            <div className="mb-6 bg-green-900/30 border border-green-400/50 rounded-xl p-4 flex items-center">
              <CheckCircle className="text-green-400 mr-3" size={20} />
              <span className="text-green-300">{sucesso}</span>
            </div>
          )}

          {erro && (
            <div className="mb-6 bg-red-900/30 border border-red-400/50 rounded-xl p-4 flex items-center">
              <AlertTriangle className="text-red-400 mr-3" size={20} />
              <span className="text-red-300">{erro}</span>
            </div>
          )}

          <form onSubmit={submeterAlteracoes} className="space-y-6">
            {/* Dados Básicos */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <User className="mr-3 text-green-400" size={24} />
                Dados Básicos
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <InputTexto
                  label="Nome Completo"
                  value={formData.nome}
                  onChange={(valor) => atualizarCampo("nome", valor)}
                  placeholder="Seu nome completo"
                  disabled={loading}
                  required
                  maxLength={100}
                />

                <InputTexto
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(valor) => atualizarCampo("email", valor)}
                  placeholder="seu@email.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Alteração de Senha */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Lock className="mr-3 text-yellow-400" size={24} />
                Alterar Senha
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <InputTexto
                    label="Senha Atual"
                    type={mostrarSenhas.atual ? "text" : "password"}
                    value={formData.senhaAtual}
                    onChange={(valor) => atualizarCampo("senhaAtual", valor)}
                    placeholder="Digite sua senha atual"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => toggleMostrarSenha("atual")}
                    className="absolute right-3 top-9 text-gray-400 hover:text-white"
                  >
                    {mostrarSenhas.atual ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Nova Senha */}
                  <div className="relative">
                    <InputTexto
                      label="Nova Senha"
                      type={mostrarSenhas.nova ? "text" : "password"}
                      value={formData.novaSenha}
                      onChange={(valor) => atualizarCampo("novaSenha", valor)}
                      placeholder="Nova senha (mín. 6 caracteres)"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => toggleMostrarSenha("nova")}
                      className="absolute right-3 top-9 text-gray-400 hover:text-white"
                    >
                      {mostrarSenhas.nova ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>

                  {/* Confirmar Senha */}
                  <div className="relative">
                    <InputTexto
                      label="Confirmar Nova Senha"
                      type={mostrarSenhas.confirmar ? "text" : "password"}
                      value={formData.confirmarSenha}
                      onChange={(valor) =>
                        atualizarCampo("confirmarSenha", valor)
                      }
                      placeholder="Confirme a nova senha"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => toggleMostrarSenha("confirmar")}
                      className="absolute right-3 top-9 text-gray-400 hover:text-white"
                    >
                      {mostrarSenhas.confirmar ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {loading ? (
                  <Loader2 className="mr-2 animate-spin" size={20} />
                ) : (
                  <Save className="mr-2" size={20} />
                )}
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PerfilGerente;
