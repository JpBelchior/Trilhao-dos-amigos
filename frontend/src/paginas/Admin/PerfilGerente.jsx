// CRIAR NOVO ARQUIVO: frontend/src/paginas/Admin/PerfilGerente.jsx

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

    // Validar nome se foi alterado
    if (nomeAlterado) {
      if (formData.nome.trim().length < 2) {
        setErro("Nome deve ter pelo menos 2 caracteres");
        return false;
      }
      if (formData.nome.trim().length > 100) {
        setErro("Nome deve ter no máximo 100 caracteres");
        return false;
      }
    }

    // Validar email se foi alterado
    if (emailAlterado) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setErro("Email inválido");
        return false;
      }
    }

    // Validar senha se há dados de senha
    if (temDadosSenha) {
      if (!formData.senhaAtual) {
        setErro("Senha atual é obrigatória para alterar a senha");
        return false;
      }
      if (!formData.novaSenha) {
        setErro("Nova senha é obrigatória");
        return false;
      }
      if (formData.novaSenha.length < 6) {
        setErro("Nova senha deve ter pelo menos 6 caracteres");
        return false;
      }
      if (formData.novaSenha !== formData.confirmarSenha) {
        setErro("Confirmação de senha não confere");
        return false;
      }
      if (formData.novaSenha === formData.senhaAtual) {
        setErro("Nova senha deve ser diferente da senha atual");
        return false;
      }
    }

    return true;
  };

  // Salvar alterações
  const salvarAlteracoes = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setErro("");
    setSucesso("");

    try {
      console.log("💾 Salvando alterações no perfil...");

      // Preparar dados para envio
      const dadosParaEnviar = {};

      // Adicionar nome se foi alterado
      if (formData.nome.trim() !== gerente.nome) {
        dadosParaEnviar.nome = formData.nome.trim();
      }

      // Adicionar email se foi alterado
      if (formData.email.trim().toLowerCase() !== gerente.email.toLowerCase()) {
        dadosParaEnviar.email = formData.email.trim().toLowerCase();
      }

      // Adicionar senha se foi preenchida
      if (formData.novaSenha) {
        dadosParaEnviar.senhaAtual = formData.senhaAtual;
        dadosParaEnviar.novaSenha = formData.novaSenha;
        dadosParaEnviar.confirmarSenha = formData.confirmarSenha;
      }

      console.log("📤 Enviando dados:", {
        alterandoNome: !!dadosParaEnviar.nome,
        alterandoEmail: !!dadosParaEnviar.email,
        alterandoSenha: !!dadosParaEnviar.novaSenha,
      });

      // Chamar API através do AuthContext
      const resultado = await atualizarPerfil(dadosParaEnviar);

      if (!resultado.sucesso) {
        throw new Error(resultado.erro || "Erro ao atualizar perfil");
      }

      console.log("✅ Perfil atualizado com sucesso:", resultado.dados);

      // Mostrar mensagem de sucesso
      const alteracoes = resultado.alteracoes || [];
      let mensagemSucesso = "Perfil atualizado com sucesso!";

      if (alteracoes.length === 3) {
        mensagemSucesso = "Nome, email e senha atualizados com sucesso!";
      } else if (alteracoes.includes("nome") && alteracoes.includes("email")) {
        mensagemSucesso = "Nome e email atualizados com sucesso!";
      } else if (alteracoes.includes("nome") && alteracoes.includes("senha")) {
        mensagemSucesso = "Nome e senha atualizados com sucesso!";
      } else if (alteracoes.includes("email") && alteracoes.includes("senha")) {
        mensagemSucesso = "Email e senha atualizados com sucesso!";
      } else if (alteracoes.includes("nome")) {
        mensagemSucesso = "Nome atualizado com sucesso!";
      } else if (alteracoes.includes("email")) {
        mensagemSucesso = "Email atualizado com sucesso!";
      } else if (alteracoes.includes("senha")) {
        mensagemSucesso = "Senha atualizada com sucesso!";
      }

      setSucesso(mensagemSucesso);

      // Limpar campos de senha
      setFormData((prev) => ({
        ...prev,
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      }));

      // Esconder senhas
      setMostrarSenhas({
        atual: false,
        nova: false,
        confirmar: false,
      });
    } catch (error) {
      console.error("❌ Erro ao salvar alterações:", error);
      setErro(error.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-black text-white mb-4">
              MEU <span className="text-yellow-400">PERFIL</span>
            </h1>
            <p className="text-gray-400 text-xl">
              Edite suas informações pessoais e de segurança
            </p>
          </div>

          <button
            onClick={() => navigate("/admin")}
            className=" bg-yellow-500 hover:bg-yellow-400 hover:scale-105  disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center"
          >
            <ArrowLeft className="mr-2" size={20} />
            Voltar ao Dashboard
          </button>
        </div>

        {/* Formulário de Perfil */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
            {/* Mensagens de Feedback */}
            {sucesso && (
              <div className="bg-green-900/50 border border-green-400/50 rounded-2xl p-4 mb-6 flex items-center">
                <CheckCircle className="text-green-400 mr-3" size={20} />
                <span className="text-green-300">{sucesso}</span>
              </div>
            )}

            {erro && (
              <div className="bg-red-900/50 border border-red-400/50 rounded-2xl p-4 mb-6 flex items-center">
                <AlertTriangle className="text-red-400 mr-3" size={20} />
                <span className="text-red-300">{erro}</span>
              </div>
            )}

            {/* Seção: Informações Básicas */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center mb-6">
                <User className="mr-3 text-yellow-400" size={24} />
                Informações Básicas
              </h3>

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => atualizarCampo("email", e.target.value)}
                    disabled={loading}
                    className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none transition-all disabled:opacity-50"
                    placeholder="Digite seu email"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Email será usado para fazer login
                  </p>
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => atualizarCampo("nome", e.target.value)}
                    disabled={loading}
                    className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none transition-all disabled:opacity-50"
                    placeholder="Digite seu nome completo"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Segurança */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center mb-6">
                <Lock className="mr-3 text-yellow-400" size={24} />
                Alterar Senha
              </h3>

              <div className="space-y-4">
                {/* Senha Atual */}
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenhas.atual ? "text" : "password"}
                      value={formData.senhaAtual}
                      onChange={(e) =>
                        atualizarCampo("senhaAtual", e.target.value)
                      }
                      disabled={loading}
                      className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 pr-12 text-white focus:border-yellow-400 focus:outline-none transition-all disabled:opacity-50"
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => toggleMostrarSenha("atual")}
                      disabled={loading}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {mostrarSenhas.atual ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nova Senha */}
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenhas.nova ? "text" : "password"}
                      value={formData.novaSenha}
                      onChange={(e) =>
                        atualizarCampo("novaSenha", e.target.value)
                      }
                      disabled={loading}
                      className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 pr-12 text-white focus:border-yellow-400 focus:outline-none transition-all disabled:opacity-50"
                      placeholder="Digite sua nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => toggleMostrarSenha("nova")}
                      disabled={loading}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {mostrarSenhas.nova ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    Mínimo 6 caracteres
                  </p>
                </div>

                {/* Confirmar Nova Senha */}
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenhas.confirmar ? "text" : "password"}
                      value={formData.confirmarSenha}
                      onChange={(e) =>
                        atualizarCampo("confirmarSenha", e.target.value)
                      }
                      disabled={loading}
                      className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 pr-12 text-white focus:border-yellow-400 focus:outline-none transition-all disabled:opacity-50"
                      placeholder="Confirme sua nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => toggleMostrarSenha("confirmar")}
                      disabled={loading}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
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

            {/* Botões de Ação */}
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => navigate("/admin")}
                disabled={loading}
                className=" bg-yellow-500 hover:bg-yellow-400 hover:scale-105 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={salvarAlteracoes}
                disabled={loading}
                className={`font-bold py-3 px-6 rounded-xl transition-all flex items-center ${
                  loading
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:from-green-400 hover:to-green-500 text-white transform hover:scale-105"
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

          {/* Informações de Segurança */}
          <div className="mt-8 bg-yellow-900/30 rounded-2xl p-6 border border-yellow-400/30">
            <h4 className="text-lg font-bold text-yellow-400 mb-3">
              🔒 Informações de Segurança
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Sua senha é criptografada e não pode ser recuperada</p>
              <p>• Use uma senha forte com pelo menos 6 caracteres</p>
              <p>• Se alterar o email, use-o para fazer login na próxima vez</p>
              <p>• Email deve ser válido e único no sistema</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilGerente;
