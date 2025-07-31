// frontend/src/paginas/Estatisticas.jsx
import React, { useState, useEffect } from "react";
import { BarChart3, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GraficosParticipantes from "../componentes/inscritos/Graficos";
import ErroComponent from "../componentes/Erro";
import LoadingComponent from "../componentes/Loading";

const Estatisticas = () => {
  const navigate = useNavigate();

  // Estados principais
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Estatísticas detalhadas
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    nacionais: 0,
    importadas: 0,
    percentualNacionais: 0,
    percentualImportadas: 0,
    cidades: [],
    estados: [],
    totalCidades: 0,
    totalEstados: 0,
    cidadeMaisParticipantes: null,
    estadoMaisParticipantes: null,
    motosPopulares: [],
  });

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      const response = await fetch(
        "http://localhost:8000/api/participantes?status=confirmado"
      );
      const data = await response.json();

      if (data.sucesso) {
        const participantesData = data.dados.participantes || [];
        const participantesConfirmados = participantesData.filter(
          (p) => p.statusPagamento === "confirmado"
        );

        setParticipantes(participantesConfirmados);
        calcularEstatisticasDetalhadas(participantesConfirmados);
        console.log(
          "✅ Dados carregados para estatísticas:",
          participantesConfirmados.length
        );
      } else {
        throw new Error(data.erro || "Erro ao carregar dados");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticasDetalhadas = (dados) => {
    const total = dados.length;
    const nacionais = dados.filter(
      (p) => p.categoriaMoto === "nacional"
    ).length;
    const importadas = dados.filter(
      (p) => p.categoriaMoto === "importada"
    ).length;

    // Percentuais
    const percentualNacionais =
      total > 0 ? ((nacionais / total) * 100).toFixed(1) : 0;
    const percentualImportadas =
      total > 0 ? ((importadas / total) * 100).toFixed(1) : 0;

    // Contagem por cidade
    const contagemCidades = {};
    dados.forEach((p) => {
      const chave = `${p.cidade}/${p.estado}`;
      contagemCidades[chave] = (contagemCidades[chave] || 0) + 1;
    });

    // Contagem por estado
    const contagemEstados = {};
    dados.forEach((p) => {
      contagemEstados[p.estado] = (contagemEstados[p.estado] || 0) + 1;
    });

    // Contagem por modelo de moto
    const contagemMotos = {};
    dados.forEach((p) => {
      const modelo = p.modeloMoto.toLowerCase();
      // Simplificar o nome da moto para agrupar melhor
      let modeloSimplificado = modelo;
      if (modelo.includes("bros")) modeloSimplificado = "Honda Bros";
      else if (modelo.includes("lander")) modeloSimplificado = "Yamaha Lander";
      else if (modelo.includes("ktm")) modeloSimplificado = "KTM";
      else if (modelo.includes("crosser"))
        modeloSimplificado = "Yamaha Crosser";
      else if (modelo.includes("xre")) modeloSimplificado = "Honda XRE";
      else if (modelo.includes("crf")) modeloSimplificado = "Honda CRF";
      else if (modelo.includes("wr")) modeloSimplificado = "Yamaha WR";
      else if (modelo.includes("husqvarna")) modeloSimplificado = "Husqvarna";

      contagemMotos[modeloSimplificado] =
        (contagemMotos[modeloSimplificado] || 0) + 1;
    });

    // Encontrar cidade e estado com mais participantes
    const cidadeMaisParticipantes = Object.entries(contagemCidades).sort(
      ([, a], [, b]) => b - a
    )[0] || [null, 0];

    const estadoMaisParticipantes = Object.entries(contagemEstados).sort(
      ([, a], [, b]) => b - a
    )[0] || [null, 0];

    // Top 5 motos mais populares
    const motosPopulares = Object.entries(contagemMotos)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([modelo, quantidade]) => ({ modelo, quantidade }));

    setEstatisticas({
      total,
      nacionais,
      importadas,
      percentualNacionais,
      percentualImportadas,
      cidades: Object.keys(contagemCidades).sort(),
      estados: Object.keys(contagemEstados).sort(),
      totalCidades: Object.keys(contagemCidades).length,
      totalEstados: Object.keys(contagemEstados).length,
      cidadeMaisParticipantes: {
        nome: cidadeMaisParticipantes[0],
        quantidade: cidadeMaisParticipantes[1],
      },
      estadoMaisParticipantes: {
        nome: estadoMaisParticipantes[0],
        quantidade: estadoMaisParticipantes[1],
      },
      motosPopulares,
    });
  };

  if (loading) {
    return <LoadingComponent loading="Calculando estatísticas..." />;
  }

  if (erro) {
    return <ErroComponent erro={erro} onTentarNovamente={carregarDados} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            <BarChart3 className="inline mr-4 text-yellow-400" size={40} />
            ESTATÍSTICAS DO <span className="text-yellow-400">TRILHÃO</span>
          </h1>
          <p className="text-gray-400 text-xl">
            Vamos conferir as curiosidades e números da edição de 2025!
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        {/* Seção Única de Estatísticas Completas */}
        <div className="max-w-6xl mx-auto mb-12">
          {/* Estatísticas Básicas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center">
              <div className="text-4xl font-black text-green-400 mb-2">
                {estatisticas.total}
              </div>
              <div className="text-gray-300">Total de Participantes</div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center">
              <div className="text-4xl font-black text-green-400 mb-2">
                {estatisticas.nacionais}
              </div>
              <div className="text-gray-300">Motos Nacionais</div>
              <div className="text-green-400 text-sm">
                ({estatisticas.percentualNacionais}%)
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/30 text-center">
              <div className="text-4xl font-black text-yellow-400 mb-2">
                {estatisticas.importadas}
              </div>
              <div className="text-gray-300">Motos Importadas</div>
              <div className="text-yellow-400 text-sm">
                ({estatisticas.percentualImportadas}%)
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center">
              <div className="text-4xl font-black text-green-400 mb-2">
                {estatisticas.totalCidades}
              </div>
              <div className="text-gray-300">Cidades Distintas</div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 text-center">
              <div className="text-4xl font-black text-green-400 mb-2">
                {estatisticas.totalEstados}
              </div>
              <div className="text-gray-300">Estados Distintos</div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto mb-5">
            <GraficosParticipantes participantes={participantes} />
          </div>

          {/* Destaques Principais */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Cidade Campeã */}
            <div className="bg-gradient-to-r from-yellow-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
                Cidade com Mais Participantes
              </h3>
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-2">
                  {estatisticas.cidadeMaisParticipantes?.nome || "N/A"}
                </div>
                <div className="text-yellow-400 text-lg">
                  {estatisticas.cidadeMaisParticipantes?.quantidade || 0}{" "}
                  participantes
                </div>
              </div>
            </div>

            {/* Estado Campeão */}
            <div className="bg-gradient-to-r from-green-900/40 to-black/60 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
              <h3 className="text-2xl font-bold text-green-400 mb-4 text-center">
                Estado Com Mais Participantes
              </h3>
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-2">
                  {estatisticas.estadoMaisParticipantes?.nome || "N/A"}
                </div>
                <div className="text-green-400 text-lg">
                  {estatisticas.estadoMaisParticipantes?.quantidade || 0}{" "}
                  participantes
                </div>
              </div>
            </div>
          </div>

          {/* Top Motos */}
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 mb-12">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
              MOTOS MAIS POPULARES
            </h3>
            <div className="grid md:grid-cols-5 gap-4">
              {estatisticas.motosPopulares.map((moto, index) => (
                <div
                  key={index}
                  className="bg-black/40 rounded-xl p-4 text-center"
                >
                  <div className="text-2xl font-black text-white mb-1">
                    {moto.quantidade}
                  </div>
                  <div className="text-yellow-400 text-sm font-semibold">
                    {moto.modelo}
                  </div>
                  <div className="text-gray-400 text-xs">#{index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estatisticas;
