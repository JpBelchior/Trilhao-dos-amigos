import React, { useState, useEffect } from "react";

import HeroSection from "../componentes/paginaPrincipal/HeroSection";
import StatsSection from "../componentes/paginaPrincipal/StatsSection";
import CTASection from "../componentes/paginaPrincipal/CTASection";

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
      {/* Hero Section - Apresentação principal */}
      <HeroSection isVisible={isVisible} scrollY={scrollY} />
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>

      {/* Stats Section - Estatísticas gerais */}
      <StatsSection />
      <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
      {/* CTA Section - Call to Action */}
      <CTASection />
    </div>
  );
};

export default TrilhaoHomepage;
