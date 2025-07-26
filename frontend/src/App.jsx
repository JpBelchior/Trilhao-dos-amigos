// src/App.jsx - VERSÃO ATUALIZADA
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./componentes/NavBar";
import ApiStatus from "./componentes/Pagamento/ApiStatus";
import TrilhaoHomePage from "./paginas/PaginaPrincipal";
import Cadastro from "./paginas/Cadastro";
import Pagamento from "./paginas/Pagamento";
import Inscritos from "./paginas/Inscritos";
import EdicoesAnteriores from "./paginas/EdicoesAnteriores";
import Provas from "./paginas/Provas";
import InformacoesLocal from "./paginas/InformacoesLocal";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        {/* Navbar Global */}
        <Navbar />

        {/* Espaçador para compensar a navbar fixa */}
        <div className="pt-20">
          <Routes>
            <Route path="/" element={<TrilhaoHomePage />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/pagamento" element={<Pagamento />} />
            <Route path="/inscritos" element={<Inscritos />} />
            <Route path="/edicoes-anteriores" element={<EdicoesAnteriores />} />
            <Route path="/provas" element={<Provas />} />
            <Route path="/informacoes-local" element={<InformacoesLocal />} />
          </Routes>
        </div>

        {/* Status da API (só em desenvolvimento) */}
        {process.env.NODE_ENV === "development" && <ApiStatus />}
      </div>
    </Router>
  );
}

export default App;
