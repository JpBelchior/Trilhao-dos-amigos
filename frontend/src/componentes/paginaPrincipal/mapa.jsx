import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";

// Fix para os ícones do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Ícones customizados
const startIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const TrilhaoMap = () => {
  // Coordenadas de Itamonte-MG (aproximadas)
  const center = [-22.2875, -44.8647];

  // Pontos do trajeto da trilha
  const startPoint = [-22.2875, -44.8647]; // Praça da Matriz - Centro
  const endPoint = [-22.3156, -44.8234]; // Mirante da Pedra do Baú

  // Trajeto da trilha (simulado - você pode ajustar os pontos)
  const trilhaRoute = [
    [-22.2875, -44.8647], // Largada - Praça da Matriz
    [-22.292, -44.859], // Saída da cidade
    [-22.298, -44.852], // Entrada na mata
    [-22.302, -44.845], // Cachoeira do Meio
    [-22.308, -44.838], // Subida íngreme
    [-22.312, -44.832], // Cruzamento das trilhas
    [-22.3156, -44.8234], // Chegada - Mirante da Pedra do Baú
  ];

  // Ponto da prova da subida (barranco)
  const barrancoPoint = [-22.32, -44.83]; // Barranco dos Campeões

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcador de Largada */}
        <Marker position={startPoint} icon={startIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-green-900">🏁 LARGADA</h3>
              <p>Praça da Matriz</p>
              <p className="text-sm text-gray-600">Centro de Itamonte</p>
              <p className="text-sm font-semibold text-orange-600">
                Horário: 10:30
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Marcador de Chegada */}
        <Marker position={endPoint}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-green-900">🏆 CHEGADA</h3>
              <p>Mirante da Pedra do Baú</p>
              <p className="text-sm text-gray-600">25km de trilha</p>
              <p className="text-sm font-semibold text-blue-600">
                Vista incrível!
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Marcador do Barranco (2ª Prova) */}
        <Marker position={barrancoPoint}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-green-900">⛰️ BARRANCO</h3>
              <p>Prova da Subida</p>
              <p className="text-sm text-gray-600">Barranco dos Campeões</p>
              <p className="text-sm font-semibold text-red-600">
                Prêmio: R$ 1.000
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Linha do trajeto da trilha */}
        <Polyline
          positions={trilhaRoute}
          color="red"
          weight={4}
          opacity={0.8}
        />
      </MapContainer>
    </div>
  );
};

export default TrilhaoMap;
