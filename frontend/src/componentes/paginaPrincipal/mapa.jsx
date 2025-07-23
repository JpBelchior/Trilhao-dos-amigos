import React, { useRef, useEffect } from "react";

const TrilhaoMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Carregamos o Leaflet dinamicamente
    const loadMap = async () => {
      if (typeof window !== "undefined" && !window.L) {
        // Carrega CSS do Leaflet
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Carrega JavaScript do Leaflet
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

      // Coordenadas de Itamonte-MG (aproximadas)
      const center = [-22.2875, -44.8647];

      // Criar o mapa
      const map = L.map(mapRef.current).setView(center, 13);

      // Adicionar tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Pontos do trajeto da trilha
      const startPoint = [-22.2875, -44.8647]; // Praça da Matriz - Centro
      const endPoint = [-22.3156, -44.8234]; // Mirante da Pedra do Baú
      const barrancoPoint = [-22.32, -44.83]; // Barranco dos Campeões

      // Trajeto da trilha (simulado)
      const trilhaRoute = [
        [-22.2875, -44.8647], // Largada - Praça da Matriz
        [-22.292, -44.859], // Saída da cidade
        [-22.298, -44.852], // Entrada na mata
        [-22.302, -44.845], // Cachoeira do Meio
        [-22.308, -44.838], // Subida íngreme
        [-22.312, -44.832], // Cruzamento das trilhas
        [-22.3156, -44.8234], // Chegada - Mirante da Pedra do Baú
      ];

      // Ícone customizado para largada
      const startIcon = L.divIcon({
        html: '<div style="background: #16a34a; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold;">🏁</div>',
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        className: "custom-marker",
      });

      // Ícone customizado para chegada
      const endIcon = L.divIcon({
        html: '<div style="background: #dc2626; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold;">🏆</div>',
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        className: "custom-marker",
      });

      // Ícone customizado para barranco
      const barrancoIcon = L.divIcon({
        html: '<div style="background: #ea580c; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold;">⛰️</div>',
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        className: "custom-marker",
      });

      // Marcador de Largada
      L.marker(startPoint, { icon: startIcon }).addTo(map).bindPopup(`
          <div style="text-align: center; min-width: 200px;">
            <h3 style="font-weight: bold; color: #166534; margin-bottom: 8px;">🏁 LARGADA</h3>
            <p style="margin: 4px 0;">Praça da Matriz</p>
            <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">Centro de Itamonte</p>
            <p style="font-size: 14px; font-weight: 600; color: #ea580c; margin: 4px 0;">
              Horário: 10:30h
            </p>
          </div>
        `);

      // Marcador de Chegada
      L.marker(endPoint, { icon: endIcon }).addTo(map).bindPopup(`
          <div style="text-align: center; min-width: 200px;">
            <h3 style="font-weight: bold; color: #166534; margin-bottom: 8px;">🏆 CHEGADA</h3>
            <p style="margin: 4px 0;">Mirante da Pedra do Baú</p>
            <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">25km de trilha</p>
            <p style="font-size: 14px; font-weight: 600; color: #2563eb; margin: 4px 0;">
              Vista incrível!
            </p>
          </div>
        `);

      // Marcador do Barranco
      L.marker(barrancoPoint, { icon: barrancoIcon }).addTo(map).bindPopup(`
          <div style="text-align: center; min-width: 200px;">
            <h3 style="font-weight: bold; color: #166534; margin-bottom: 8px;">⛰️ BARRANCO</h3>
            <p style="margin: 4px 0;">Prova da Subida</p>
            <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">Barranco dos Campeões</p>
            <p style="font-size: 14px; font-weight: 600; color: #dc2626; margin: 4px 0;">
              Prêmio: R$ 1.000
            </p>
          </div>
        `);

      // Linha do trajeto da trilha
      L.polyline(trilhaRoute, {
        color: "red",
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

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
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl"
      style={{ minHeight: "400px", zIndex: 1 }}
    />
  );
};

export default TrilhaoMap;
