import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./componentes/NavBar";
import TrilhaoHomePage from "./paginas/PaginaPrincipal";
import Cadastro from "./paginas/Cadastro";
import Inscritos from "./paginas/Inscritos";

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
            <Route path="/inscritos" element={<Inscritos />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
