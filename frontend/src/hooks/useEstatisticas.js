import { useState, useEffect } from "react";

/**

 * 
 * @returns {Object} Estados e funções necessários para o componente
 */
export const useEstatisticas = () => {
  // ========================================
  // ESTADOS PRINCIPAIS
  // ========================================
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // ========================================
  // ESTATÍSTICAS DETALHADAS
  // ========================================
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

  useEffect(() => {
    carregarDados();
  }, []);


  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log("📊 [Estatisticas] Carregando dados...");

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
          `✅ [Estatisticas] ${participantesConfirmados.length} participantes carregados`
        );
      } else {
        throw new Error(data.erro || "Erro ao carregar dados");
      }
    } catch (error) {
      console.error("❌ [Estatisticas] Erro ao carregar:", error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticasDetalhadas = (dados) => {
    const total = dados.length;
    const nacionais = dados.filter((p) => p.categoriaMoto === "nacional").length;
    const importadas = dados.filter((p) => p.categoriaMoto === "importada").length;

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

    // Contagem por modelo de moto (simplificado)
    const contagemMotos = {};
    dados.forEach((p) => {
      const modelo = p.modeloMoto.toLowerCase();
      
      // Simplificar o nome da moto para agrupar melhor
      let modeloSimplificado = modelo;
      if (modelo.includes("bros")) modeloSimplificado = "Honda Bros";
      else if (modelo.includes("lander")) modeloSimplificado = "Yamaha Lander";
      else if (modelo.includes("ktm")) modeloSimplificado = "KTM";
      else if (modelo.includes("crosser")) modeloSimplificado = "Yamaha Crosser";
      else if (modelo.includes("xre")) modeloSimplificado = "Honda XRE";
      else if (modelo.includes("crf")) modeloSimplificado = "Honda CRF";
      else if (modelo.includes("wr")) modeloSimplificado = "Yamaha WR";
      else if (modelo.includes("husqvarna")) modeloSimplificado = "Husqvarna";

      contagemMotos[modeloSimplificado] =
        (contagemMotos[modeloSimplificado] || 0) + 1;
    });

    // Encontrar cidade com mais participantes
    const cidadeMaisParticipantes = Object.entries(contagemCidades).sort(
      ([, a], [, b]) => b - a
    )[0] || [null, 0];

    // Encontrar estado com mais participantes
    const estadoMaisParticipantes = Object.entries(contagemEstados).sort(
      ([, a], [, b]) => b - a
    )[0] || [null, 0];

    // Top 5 motos mais populares
    const motosPopulares = Object.entries(contagemMotos)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([modelo, quantidade]) => ({ modelo, quantidade }));

    // Atualizar estado
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

 
  return {
    // Estados principais
    participantes,
    loading,
    erro,

    // Estatísticas
    estatisticas,

    // Funções
    carregarDados,
  };
};

export default useEstatisticas;