import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TrilhaoHomePage from "./paginas/PaginaPrincipal";
import Cadastro from "./paginas/Cadastro";
import Inscritos from "./paginas/Inscritos";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrilhaoHomePage />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/inscritos" element={<Inscritos />} />
      </Routes>
    </Router>
  );
}

export default App;
