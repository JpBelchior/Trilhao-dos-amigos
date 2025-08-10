import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingComponent from "./Loading";
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading, gerente } = useAuth();
  const location = useLocation();
  console.log(
    "🔒 [ProtectedRoute] Verificando acesso para:",
    location.pathname
  );
  console.log(
    "🔒 [ProtectedRoute] Loading:",
    loading,
    "| Logado:",
    isLoggedIn()
  );
  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    console.log(
      "🔄 [ProtectedRoute] Aguardando verificação de autenticação..."
    );
    return (
      <LoadingComponent
        loading="Verificando autenticação..."
        className="bg-gradient-to-br from-green-900 via-black to-green-900"
      />
    );
  }
  // Se não está logado, redirecionar para login
  if (!isLoggedIn()) {
    console.log(
      "🔒 [ProtectedRoute] Acesso negado - redirecionando para login"
    );
    console.log("🔒 [ProtectedRoute] Página tentada:", location.pathname);
    // Salvar a URL que tentou acessar para redirecionar depois do login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  // Se está logado, mostrar o conteúdo protegido
  console.log("✅ [ProtectedRoute] Acesso autorizado para:", gerente?.nome);
  console.log("✅ [ProtectedRoute] Renderizando página:", location.pathname);
  return children;
};
export default ProtectedRoute;
