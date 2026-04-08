import React, { useRef, useEffect, useState } from "react";

const TrilhaoMap = () => {
  const mapRef = useRef(null);
  const [trajetoGPX, setTrajetoGPX] = useState(null);
  const [loading, setLoading] = useState(true);

  // Buscar trajeto do backend
  useEffect(() => {
    const buscarTrajeto = async () => {
      try {
        console.log(" Buscando trajeto GPX do backend...");
        
        const response = await fetch("http://localhost:8000/api/trajeto/atual");
        const data = await response.json();

        if (data.sucesso && data.dados) {
          console.log("✅ Trajeto GPX carregado:", data.dados);
          setTrajetoGPX(data.dados);
        } else {
          console.log("⚠️ Nenhum trajeto GPX disponível, usando dados padrão");
          setTrajetoGPX(null);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar trajeto:", error);
        setTrajetoGPX(null);
      } finally {
        setLoading(false);
      }
    };

    buscarTrajeto();
  }, []);

  useEffect(() => {
    // Só inicializar mapa quando não estiver loading
    if (loading) return;

    // Carregamos o Leaflet dinamicamente
    const loadMap = async () => {
      if (typeof window !== "undefined" && !window.L) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else if (window.L) {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || mapRef.current._leaflet_id) return;

      const L = window.L;

      
      let center, trilhaRoute, startPoint, endPoint, barrancoPoint, atracaoPoint;

      if (trajetoGPX && trajetoGPX.coordenadas) {
        // 🎯 USAR DADOS DO GPX

        trilhaRoute = trajetoGPX.coordenadas;
        startPoint = trilhaRoute[0];
        endPoint = trilhaRoute[trilhaRoute.length - 1];
        
        // Calcular ponto médio para centro do mapa
        center = trilhaRoute[Math.floor(trilhaRoute.length / 2)];
        
        // Local das atrações (fixo)
        atracaoPoint = [-22.3121252, -44.8171325];

        // Barranco: ponto médio entre largada (endPoint) e local das atrações
        barrancoPoint = [
          (endPoint[0] + atracaoPoint[0]) / 2,
          (endPoint[1] + atracaoPoint[1]) / 2,
        ];
        
      } else {
        // 📍 USAR COORDENADAS PADRÃO (fallback)
        console.log("📍 Usando coordenadas padrão (GPX não disponível)");
        
        center = [-22.2875, -44.8647];
        startPoint = [-22.2875, -44.8647];
        endPoint = [-22.3156, -44.8234];
        atracaoPoint = [-22.3121252, -44.8171325];
        barrancoPoint = [
          (endPoint[0] + atracaoPoint[0]) / 2,
          (endPoint[1] + atracaoPoint[1]) / 2,
        ];
        
      }

      // Criar o mapa
      const map = L.map(mapRef.current).setView(center, 13);

      // Adicionar tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Ícones customizados
      const startIcon = L.divIcon({
        html: '<div style="background: #eab308; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white ;">?</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        className: "custom-marker",
      });

      const endIcon = L.divIcon({
        html: '<div style="background: #16a34a; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold;">🏁</div>',
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        className: "custom-marker",
      });

      const atracaoIcon = L.divIcon({
        html: '<div style="background: #7c3aed; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold;">🎪</div>',
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        className: "custom-marker",
      });

      const barrancoIcon = L.divIcon({
        html: '<div style="background: #ea580c; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold;">⛰️</div>',
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        className: "custom-marker",
      });

      // Marcador MISTERIOSO (início do GPX)
      L.marker(startPoint, { icon: startIcon }).addTo(map).bindPopup(`
        <div style="text-align: center; min-width: 220px;">
          <h3 style="font-weight: bold; color: #eab308; margin-bottom: 8px; font-size: 16px;"> Quer descobrir mais? </h3>
          <p style="color: #374151; margin: 6px 0; font-size: 13px;">O restante da trilha é um misterio...</p>
          <p style="font-weight: bold; color: #ea580c; margin: 8px 0; font-size: 13px;">Se inscreva e venha participar dessa aventura!</p>
        </div>
      `);

      // Marcador de LARGADA (fim do GPX)
      L.marker(endPoint, { icon: endIcon }).addTo(map).bindPopup(`
        <div style="text-align: center; min-width: 200px;">
          <h3 style="font-weight: bold; color: #166534; margin-bottom: 8px;">🏁 LARGADA</h3>
          <p style="margin: 4px 0;">Ilha Grande</p>
          <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">Itamonte/MG</p>
          <p style="font-size: 14px; font-weight: 600; color: #ea580c; margin: 4px 0;">
            Horário: 9:30h
          </p>
          ${trajetoGPX ? `
            <p style="font-size: 14px; font-weight: 600; color: #16a34a; margin: 4px 0;">
               Distância: 50 km
            </p>
            ${trajetoGPX.ganhoElevacao ? `
              <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">
                 Elevação: ${trajetoGPX.ganhoElevacao}m
              </p>
            ` : ''}
          ` : ''}
        </div>
      `);

      // Marcador das ATRAÇÕES
      L.marker(atracaoPoint, { icon: atracaoIcon }).addTo(map).bindPopup(`
        <div style="text-align: center; min-width: 200px;">
          <h3 style="font-weight: bold; color: #7c3aed; margin-bottom: 8px;"> LOCAL DAS ATRAÇÕES</h3>
          <p style="margin: 4px 0;">Centro Comunitário</p>
          <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">Estrada do Picuzinho, Km 5</p>
          <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">Ilha Grande - Itamonte/MG</p>
        </div>
      `);

      // Marcador do BARRANCO
      L.marker(barrancoPoint, { icon: barrancoIcon }).addTo(map).bindPopup(`
        <div style="text-align: center; min-width: 200px;">
          <h3 style="font-weight: bold; color: #166534; margin-bottom: 8px;"> BARRANCO DO DESAFIO</h3>
          <p style="margin: 4px 0;">Prova da Subida</p>
          <p style="font-size: 14px; font-weight: 600; color: #dc2626; margin: 4px 0;">
            Prêmio: R$ 1.500 R$
          </p>
        </div>
      `);

      // Desenhar linha do trajeto
      const polyline = L.polyline(trilhaRoute, {
        color: "red",
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      // Se temos GPX, ajustar zoom automaticamente para mostrar todo trajeto
      if (trajetoGPX && trajetoGPX.coordenadas) {
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }

      // Salvar referência do mapa
      mapRef.current._leaflet_map = map;
    };

    loadMap();

    // Cleanup
    return () => {
      if (mapRef.current && mapRef.current._leaflet_map) {
        mapRef.current._leaflet_map.remove();
        mapRef.current._leaflet_id = undefined;
      }
    };
  }, [loading, trajetoGPX]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full rounded-xl flex items-center justify-center bg-black/40" style={{ minHeight: "400px" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl"
      style={{ minHeight: "400px", zIndex: 1 }}
    />
  );
};

export default TrilhaoMap;