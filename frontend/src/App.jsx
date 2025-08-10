import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
// 🎯 CONTEXT DE AUTENTICAÇÃO
import { AuthProvider } from "./context/AuthContext";
// 🧪 COMPONENTES DE TESTE (TEMPORÁRIOS)
import TesteAuth from "./componentes/TesteAuth";
import TesteAdminPage from "./componentes/TesteAdminPage";
import ProtectedRoute from "./componentes/ProtectedRoute";
// 🎯 DASHBOARD ADMINISTRATIVO REAL
import AdminDashboard from "./paginas/Admin/Dashboard";
// COMPONENTES NORMAIS DO SITE
import Navbar from "./componentes/NavBar";
import TrilhaoHomePage from "./paginas/PaginaPrincipal";
import Cadastro from "./paginas/Cadastro";
import Pagamento from "./paginas/Pagamento";
import Inscritos from "./paginas/Inscritos";
import Estatisticas from "./paginas/Estatisticas";
import EdicoesAnteriores from "./paginas/EdicoesAnteriores";
import Provas from "./paginas/Provas";
import InformacoesLocal from "./paginas/InformacoesLocal";
import LoginGerente from "./paginas/Login";
import Footer from "./componentes/paginaPrincipal/Footer";
// Componente interno que tem acesso ao useLocation
function AppContent() {
  const location = useLocation();
  // Verificar se deve mostrar a navbar
  // Esconder na: login, páginas de teste e área admin
  const shouldShowNavbar =
    !location.pathname.includes("/login") &&
    !location.pathname.includes("/teste-") &&
    !location.pathname.includes("/admin");
  return (
    <div className="min-h-screen">
      {/* Navbar Condicional - só nas páginas públicas */}
      {shouldShowNavbar && <Navbar />}
      {/* Espaçador para compensar a navbar fixa */}
      <div className={shouldShowNavbar ? "pt-20" : ""}>
        <Routes>
          {/* ================================ */}
          {/* ROTAS PÚBLICAS - SITE PRINCIPAL */}
          {/* ================================ */}
          <Route path="/" element={<TrilhaoHomePage />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/pagamento" element={<Pagamento />} />
          <Route path="/inscritos" element={<Inscritos />} />
          <Route path="/estatisticas" element={<Estatisticas />} />
          <Route path="/edicoes-anteriores" element={<EdicoesAnteriores />} />
          <Route path="/provas" element={<Provas />} />
          <Route path="/informacoes-local" element={<InformacoesLocal />} />

          {/* ================================ */}
          {/* AUTENTICAÇÃO */}
          {/* ================================ */}
          <Route path="/login" element={<LoginGerente />} />

          {/* ================================ */}
          {/* ÁREA ADMINISTRATIVA - PROTEGIDA */}
          {/* ================================ */}

          {/* 🎯 DASHBOARD PRINCIPAL - ROTA REAL */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ================================ */}
          {/* ROTAS DE TESTE - TEMPORÁRIAS */}
          {/* ================================ */}

          {/* 🧪 TESTE DO CONTEXT - PÁGINA PÚBLICA */}
          <Route
            path="/teste-auth"
            element={
              <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
                <div className="container mx-auto px-6">
                  <h1 className="text-4xl font-black text-white text-center mb-4">
                    🧪 TESTE DO AUTHCONTEXT
                  </h1>
                  <p className="text-center text-gray-400 mb-8">
                    Esta página é PÚBLICA - qualquer um pode acessar
                  </p>
                  <TesteAuth />
                </div>
              </div>
            }
          />

          {/* 🔒 TESTE DE ROTA PROTEGIDA */}
          <Route
            path="/teste-admin-protegido"
            element={
              <ProtectedRoute>
                <TesteAdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Footer - só nas páginas públicas */}
      {shouldShowNavbar && <Footer />}
    </div>
  );
}
function App() {
  return (
    <Router>
      {/* 🎯 AUTHPROVIDER ENVOLVENDO TODA A APLICAÇÃO */}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
export default App;
