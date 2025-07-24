// src/paginas/PaginaPrincipal.jsx - Versão Refatorada
import React, { useState, useEffect } from "react";

// Importando todos os componentes
import HeroSection from "../componentes/paginaPrincipal/HeroSection";
import StatsSection from "../componentes/paginaPrincipal/StatsSection";
import GallerySection from "../componentes/paginaPrincipal/GallerySection";
import ProvasSection from "../componentes/paginaPrincipal/ProvasSection";
import EstruturaSection from "../componentes/paginaPrincipal/EstruturaSection";
import HallFamaSection from "../componentes/paginaPrincipal/HallFamaSection";
import CTASection from "../componentes/paginaPrincipal/CTASection";
import Footer from "../componentes/paginaPrincipal/Footer";

const TrilhaoHomepage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Efeito de scroll parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection isVisible={isVisible} scrollY={scrollY} />

      {/* Divisor */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>

      {/* Stats Section */}
      <StatsSection />

      {/* Divisor */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-8"></div>

      {/* Gallery Section */}
      <GallerySection />

      {/* Divisor */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-8"></div>

      {/* Provas Section */}
      <ProvasSection />

      {/* Divisor */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-8"></div>

      {/* Estrutura Section */}
      <EstruturaSection />

      {/* Divisor */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-8"></div>

      {/* Hall da Fama Section */}
      <HallFamaSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TrilhaoHomepage;
