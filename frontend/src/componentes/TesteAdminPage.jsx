import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, User, LogOut, Home } from "lucide-react";
const TesteAdminPage = () => {
  const { gerente, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    console.log("🧪 [TesteAdmin] Fazendo logout...");
    logout();
    // Após logout, será redirecionado automaticamente para login
  };
  const handleVoltar = () => {
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="text-black" size={40} />
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            🧪 PÁGINA <span className="text-yellow-400">PROTEGIDA</span>
          </h1>
          <p className="text-gray-400 text-xl">
            Esta página só pode ser acessada por gerentes logados
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>
        {/* Card Principal */}
        <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
          {/* Informações do Gerente */}
          <div className="bg-green-900/30 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
              <User className="mr-3" size={24} />
              Gerente Logado
            </h2>

            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-300">ID:</span>
                <span className="text-white font-semibold">{gerente?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Nome:</span>
                <span className="text-white font-semibold">
                  {gerente?.nome}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Email:</span>
                <span className="text-white font-semibold">
                  {gerente?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Criado em:</span>
                <span className="text-white font-semibold">
                  {gerente?.createdAt
                    ? new Date(gerente.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Status de Proteção */}
          <div className="bg-yellow-900/30 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">
              🔒 STATUS DE PROTEÇÃO
            </h3>

            <div className="space-y-3 text-center">
              <div className="bg-green-600/20 border border-green-400/50 rounded-xl p-4">
                <div className="text-green-400 font-bold text-lg">
                  ✅ ACESSO AUTORIZADO
                </div>
                <div className="text-gray-300 text-sm">
                  O ProtectedRoute validou sua autenticação com sucesso
                </div>
              </div>

              <div className="text-gray-300 text-sm">
                <strong>Como funciona:</strong>
                <br />
                1. ProtectedRoute verifica se você está logado
                <br />
                2. Se não estiver, redireciona para /login
                <br />
                3. Se estiver logado, mostra esta página
                <br />
                4. Se o token expirar, faz logout automático
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleVoltar}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
            >
              <Home className="mr-2" size={20} />
              Voltar ao Site
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
            >
              <LogOut className="mr-2" size={20} />
              Sair (Teste Logout)
            </button>
          </div>

          {/* Instruções de Teste */}
          <div className="mt-8 bg-blue-900/30 rounded-2xl p-4">
            <h4 className="text-blue-400 font-bold mb-2">
              🧪 Testes que você pode fazer:
            </h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Clique em "Sair" e veja se é redirecionado para login</li>
              <li>
                • Faça logout e tente acessar /teste-admin-protegido diretamente
              </li>
              <li>
                • Verifique se após login é redirecionado de volta para esta
                página
              </li>
              <li>• Abra outra aba e veja se o login persiste</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TesteAdminPage;
