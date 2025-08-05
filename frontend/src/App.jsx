// src/App.jsx - VERSÃO CORRIGIDA PARA HASHROUTER
import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./componentes/NavBar";
import ApiStatus from "./componentes/Pagamento/ApiStatus";
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

  // Verificar se deve mostrar a navbar - agora usando useLocation do React Router
  const shouldShowNavbar = location.pathname !== "/login";

  return (
    <div className="min-h-screen">
      {/* Navbar Condicional - só esconde na página de login */}
      {shouldShowNavbar && <Navbar />}

      {/* Espaçador para compensar a navbar fixa (só quando navbar está visível) */}
      <div className={shouldShowNavbar ? "pt-20" : ""}>
        <Routes>
          <Route path="/" element={<TrilhaoHomePage />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/pagamento" element={<Pagamento />} />
          <Route path="/inscritos" element={<Inscritos />} />
          <Route path="/estatisticas" element={<Estatisticas />} />
          <Route path="/edicoes-anteriores" element={<EdicoesAnteriores />} />
          <Route path="/provas" element={<Provas />} />
          <Route path="/informacoes-local" element={<InformacoesLocal />} />

          {/* Rota de Login - sem navbar */}
          <Route path="/login" element={<LoginGerente />} />
        </Routes>
      </div>

      {/* Footer - só nas páginas normais (esconde na página de login) */}
      {shouldShowNavbar && <Footer />}

      {/* Status da API (só em desenvolvimento) */}
      {/* {process.env.NODE_ENV === "development" && <ApiStatus />} */}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
