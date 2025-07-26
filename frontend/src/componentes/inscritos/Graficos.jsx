// frontend/src/componentes/graficos/GraficosParticipantes.jsx
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { BarChart3, Users, MapPin, Bike } from "lucide-react";

const GraficosParticipantes = ({ participantes = [] }) => {
  const [dadosCidades, setDadosCidades] = useState([]);
  const [dadosMotos, setDadosMotos] = useState([]);
  const [dadosEstados, setDadosEstados] = useState([]);

  // Cores para os gráficos
  const coresCidades = [
    "#22c55e", // verde
    "#eab308", // amarelo
    "#ef4444", // vermelho
    "#3b82f6", // azul
    "#f97316", // laranja
    "#8b5cf6", // roxo
    "#06b6d4", // ciano
    "#f59e0b", // âmbar
    "#10b981", // esmeralda
    "#6366f1", // índigo
  ];

  const coresMotos = {
    nacional: "#22c55e", // verde
    importada: "#eab308", // amarelo
  };

  const coresEstados = [
    "#22c55e",
    "#eab308",
    "#ef4444",
    "#3b82f6",
    "#f97316",
    "#8b5cf6",
    "#06b6d4",
    "#f59e0b",
    "#10b981",
    "#6366f1",
  ];

  useEffect(() => {
    if (participantes.length > 0) {
      processarDados();
    }
  }, [participantes]);

  const processarDados = () => {
    console.log(
      "📊 Processando dados dos participantes:",
      participantes.length
    );

    // 1. Processar dados por cidade (top 10)
    const contagemCidades = {};
    participantes.forEach((p) => {
      const cidadeCompleta = `${p.cidade}/${p.estado}`;
      contagemCidades[cidadeCompleta] =
        (contagemCidades[cidadeCompleta] || 0) + 1;
    });

    const cidadesOrdenadas = Object.entries(contagemCidades)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Top 10 cidades

    const totalCidades = cidadesOrdenadas.reduce(
      (sum, [, count]) => sum + count,
      0
    );
    const outrasCount = participantes.length - totalCidades;

    const dadosCidadesProcessados = cidadesOrdenadas.map(
      ([cidade, count], index) => ({
        name: cidade,

        value: count,
        percentage: ((count / participantes.length) * 100).toFixed(1),
        color: coresCidades[index] || "#94a3b8",
      })
    );

    if (outrasCount > 0) {
      dadosCidadesProcessados.push({
        name: "Outras",
        value: outrasCount,
        percentage: ((outrasCount / participantes.length) * 100).toFixed(1),
        color: "#94a3b8",
      });
    }

    // 2. Processar dados por categoria de moto
    const contagemMotos = {};
    participantes.forEach((p) => {
      const categoria = p.categoriaMoto || "não informado";
      contagemMotos[categoria] = (contagemMotos[categoria] || 0) + 1;
    });

    const dadosMotosProcessados = Object.entries(contagemMotos).map(
      ([categoria, count]) => ({
        name:
          categoria === "nacional"
            ? "Motos Nacionais"
            : categoria === "importada"
            ? "Motos Importadas"
            : "Não Informado",
        categoria: categoria,
        value: count,
        percentage: ((count / participantes.length) * 100).toFixed(1),
        color: coresMotos[categoria] || "#94a3b8",
      })
    );
    console.log("🏍️ Dados das motos:", dadosMotosProcessados);
    // 3. Processar dados por estado (top 8)
    const contagemEstados = {};
    participantes.forEach((p) => {
      const estado = p.estado || "Não informado";
      contagemEstados[estado] = (contagemEstados[estado] || 0) + 1;
    });

    const estadosOrdenados = Object.entries(contagemEstados)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8); // Top 8 estados

    const totalEstados = estadosOrdenados.reduce(
      (sum, [, count]) => sum + count,
      0
    );
    const outrosEstados = participantes.length - totalEstados;

    const dadosEstadosProcessados = estadosOrdenados.map(
      ([estado, count], index) => ({
        name: estado,
        value: count,
        percentage: ((count / participantes.length) * 100).toFixed(1),
        color: coresEstados[index] || "#94a3b8",
      })
    );

    if (outrosEstados > 0) {
      dadosEstadosProcessados.push({
        name: "Outros",
        value: outrosEstados,
        percentage: ((outrosEstados / participantes.length) * 100).toFixed(1),
        color: "#94a3b8",
      });
    }

    setDadosCidades(dadosCidadesProcessados);
    setDadosMotos(dadosMotosProcessados);
    setDadosEstados(dadosEstadosProcessados);

    console.log("✅ Dados processados:", {
      cidades: dadosCidadesProcessados.length,
      motos: dadosMotosProcessados.length,
      estados: dadosEstadosProcessados.length,
    });
  };

  // Componente customizado para tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 backdrop-blur-lg border border-gray-600 rounded-xl p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-yellow-400">
            {data.value} participantes ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (participantes.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-gray-600/30 text-center">
        <BarChart3 className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-2xl font-bold text-white mb-2">
          Sem Dados para Exibir
        </h3>
        <p className="text-gray-400">
          Carregue os dados dos participantes para visualizar os gráficos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-black text-white mb-4">
          <BarChart3 className="inline mr-3 text-yellow-400" size={40} />
          ESTATÍSTICAS DOS{" "}
          <span className="text-yellow-400">PARTICIPANTES</span>
        </h2>
        <p className="text-gray-400 text-lg">
          Análise da distribuição de {participantes.length} participantes
          confirmados
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-4"></div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Gráfico de Motos */}
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-yellow-400/30">
          <h3 className="text-xl font-bold text-center text-white mb-4">
            Categoria das Motos
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosMotos}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dadosMotos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda customizada para motos */}
          <div className="space-y-2 mt-4">
            {dadosMotos.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-black/40 rounded-xl p-3"
              >
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white font-semibold">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold">{item.value}</div>
                  <div className="text-gray-400 text-sm">
                    {item.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Estados */}
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30">
          <h3 className="text-xl font-bold text-center text-white mb-4">
            Estados
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosEstados}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {dadosEstados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista dos estados */}
          <div className="mt-4 max-h-32 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {dadosEstados.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-300 text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico de Cidades */}
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30">
          <h3 className="text-xl font-bold text-center text-white mb-4">
            Cidades (Top 10)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosCidades}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {dadosCidades.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista das cidades em scroll */}
          <div className="mt-4 max-h-32 overflow-y-auto">
            <div className="space-y-1">
              {dadosCidades.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center">
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-green-400 font-semibold">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Estatístico */}
      <div className="bg-gradient-to-r from-green-900/40 to-yellow-900/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
        <h3 className="text-2xl font-bold text-center text-white mb-6">
          Resumo Estatístico
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-black/40 rounded-2xl p-4">
            <div className="text-3xl font-black text-green-400">
              {participantes.length}
            </div>
            <div className="text-gray-300">Total de Participantes</div>
          </div>
          <div className="bg-black/40 rounded-2xl p-4">
            <div className="text-3xl font-black text-yellow-400">
              {dadosEstados.length}
            </div>
            <div className="text-gray-300">Estados Representados</div>
          </div>

          <div className="bg-black/40 rounded-2xl p-4">
            <div className="text-3xl font-black text-yellow-400">
              {(() => {
                const nacionais = dadosMotos.find(
                  (m) => m.categoria === "nacional"
                );
                return nacionais ? nacionais.percentage : "0";
              })()}
              %
            </div>
            <div className="text-gray-300">Motos Nacionais</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficosParticipantes;
