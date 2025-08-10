// frontend/src/paginas/LoginGerente.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import ErroComponent from "../componentes/Erro";
import { useAuth } from "../context/AuthContext";

const LoginGerente = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estados do formulário
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  // Estados da UI
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Atualizar dados do formulário
  const atualizarFormData = (campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
    // Limpar erro quando usuário começar a digitar
    if (erro) setErro(null);
  };

  // Validar formulário
  const validarFormulario = () => {
    if (!formData.email.trim()) {
      setErro("Email é obrigatório");
      return false;
    }

    if (!formData.email.includes("@")) {
      setErro("Email inválido");
      return false;
    }

    if (!formData.senha.trim()) {
      setErro("Senha é obrigatória");
      return false;
    }

    if (formData.senha.length < 6) {
      setErro("Senha deve ter pelo menos 6 caracteres");
      return false;
    }

    return true;
  };

  // Submeter login
  const submeterLogin = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      console.log("🔑 Tentando fazer login como gerente:", formData.email);
      // Usar o login do AuthContext ao invés de fetch direto
      const resultado = await login(
        formData.email.trim().toLowerCase(),
        formData.senha
      );

      if (!resultado.sucesso) {
        throw new Error(resultado.erro || "Erro ao fazer login");
      }

      console.log("✅ Login realizado com sucesso:", resultado.dados);

      // 🎯 REDIRECIONAMENTO CORRIGIDO
      console.log("🔄 Redirecionando para /admin...");

      // Verificar se veio de alguma página específica
      const destination = location.state?.from || "/admin";
      console.log("🎯 Destino do redirecionamento:", destination);

      // Fazer o redirecionamento
      navigate(destination, { replace: true });

      console.log("✅ Navigate executado para:", destination);
    } catch (error) {
      console.error("❌ Erro no login:", error);
      setErro(error.message || "Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  // Alternar visibilidade da senha
  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  // Tentar novamente (limpar erro)
  const tentarNovamente = () => {
    setErro(null);
    setFormData({ email: "", senha: "" });
  };

  // Se há erro, mostrar componente de erro
  if (erro && !loading) {
    return (
      <ErroComponent
        erro={{
          mensagem: erro,
          tipo: "validacao",
        }}
        onTentarNovamente={tentarNovamente}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="text-black" size={40} />
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            ÁREA <span className="text-yellow-400">RESTRITA</span>
          </h1>
          <p className="text-gray-400 text-xl">
            Login para gerentes do Trilhão dos Amigos
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        {/* Formulário de Login */}
        <div className="max-w-md mx-auto bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30">
          <form onSubmit={submeterLogin} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Email do Gerente *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => atualizarFormData("email", e.target.value)}
                disabled={loading}
                className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none transition-all disabled:opacity-50"
                placeholder="gerente@trilhao.com"
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => atualizarFormData("senha", e.target.value)}
                  disabled={loading}
                  className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 pr-12 text-white focus:border-yellow-400 focus:outline-none transition-all disabled:opacity-50"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={toggleMostrarSenha}
                  disabled={loading}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={
                loading || !formData.email.trim() || !formData.senha.trim()
              }
              className={`w-full font-bold py-4 px-6 rounded-xl transition-all transform ${
                loading || !formData.email.trim() || !formData.senha.trim()
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 inline" size={20} />
                  Verificando Credenciais...
                </>
              ) : (
                <>
                  <Shield className="mr-2 inline" size={20} />
                  Entrar na Área Restrita
                </>
              )}
            </button>
          </form>

          {/* Link para voltar */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-white transition-colors underline"
            >
              ← Voltar à Página Principal
            </button>
          </div>

          {/* Informações de Segurança */}
          <div className="mt-8 bg-yellow-900/30 rounded-2xl p-4">
            <div className="flex items-start">
              <AlertCircle
                className="text-yellow-400 mr-3 mt-1 flex-shrink-0"
                size={16}
              />
              <div className="text-yellow-200 text-sm">
                <strong>Área Restrita:</strong> Esta área é destinada
                exclusivamente para gerentes autorizados do Trilhão dos Amigos.
                O acesso não autorizado é proibido.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginGerente;
