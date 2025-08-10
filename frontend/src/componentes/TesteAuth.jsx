import React from "react";
import { useAuth } from "../context/AuthContext";
const TesteAuth = () => {
  const { gerente, token, loading, isLoggedIn, login, logout } = useAuth();
  const handleTesteLogin = async () => {
    console.log("🧪 Testando login via Context...");
    const resultado = await login("admin@trilhao.com", "admin123");
    console.log("🧪 Resultado do login:", resultado);
  };
  const handleTesteLogout = () => {
    console.log("🧪 Testando logout via Context...");
    logout();
  };
  if (loading) {
    return (
      <div className="p-6 bg-blue-900/30 rounded-xl border border-blue-400/30 m-4">
        <h3 className="text-white font-bold mb-2">🔄 Context Loading...</h3>
        <p className="text-gray-300">Verificando autenticação...</p>
      </div>
    );
  }
  return (
    <div className="p-6 bg-black/40 rounded-xl border border-green-400/30 m-4">
      <h3 className="text-white font-bold mb-4">🧪 Teste do AuthContext</h3>
      <div className="space-y-4">
        <div>
          <strong className="text-green-400">Status:</strong>
          <span className="text-white ml-2">
            {isLoggedIn() ? "✅ Logado" : "❌ Não logado"}
          </span>
        </div>

        {gerente && (
          <div>
            <strong className="text-green-400">Gerente:</strong>
            <span className="text-white ml-2">{gerente.nome}</span>
          </div>
        )}

        <div>
          <strong className="text-green-400">Token:</strong>
          <span className="text-white ml-2">
            {token ? `${token.substring(0, 20)}...` : "Nenhum"}
          </span>
        </div>

        <div className="flex space-x-4">
          {!isLoggedIn() ? (
            <button
              onClick={handleTesteLogin}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              🔐 Testar Login
            </button>
          ) : (
            <button
              onClick={handleTesteLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              👋 Testar Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default TesteAuth;
