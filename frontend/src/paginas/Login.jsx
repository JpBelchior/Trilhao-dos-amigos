import React from "react";
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import ErroComponent from "../componentes/Erro";
import useLogin from "../hooks/useLogin";

const LoginGerente = () => {
  
  const {
    formData,
    mostrarSenha,
    loading,
    erro,
    atualizarFormData,
    submeterLogin,
    toggleMostrarSenha,
    tentarNovamente,
    voltarParaHome,
  } = useLogin();

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
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-yellow-400/50">
            <Shield className="text-black" size={40} />
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            ÁREA <span className="text-yellow-400">RESTRITA</span>
          </h1>
          <p className="text-gray-400 text-xl">
            Acesso exclusivo para gerentes autorizados
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        {/* Formulário */}
        <div className="max-w-md mx-auto bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
          <form onSubmit={submeterLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => atualizarFormData("email", e.target.value)}
                placeholder="e-mail"
                className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-colors"
                disabled={loading}
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => atualizarFormData("senha", e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={toggleMostrarSenha}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
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
              onClick={voltarParaHome}
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