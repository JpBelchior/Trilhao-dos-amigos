import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  MapPin,
  Bike,
  RefreshCw,
  XCircle,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import GraficosParticipantes from "../componentes/inscritos/Graficos";

const Inscritos = () => {
  // Estados principais
  const [participantes, setParticipantes] = useState([]);
  const [participantesFiltrados, setParticipantesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    nome: "",
    cidade: "",
    categoriaMoto: "todos",
  });

  // Estados para UI
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarGraficos, setMostrarGraficos] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  // Estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    nacionais: 0,
    importadas: 0,
    cidades: [],
    estados: [],
  });

  // Carregar participantes
  useEffect(() => {
    carregarParticipantes();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    aplicarFiltros();
  }, [participantes, filtros]);

  const carregarParticipantes = async () => {
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
        calcularEstatisticas(participantesConfirmados);
        console.log(
          "✅ Participantes carregados:",
          participantesConfirmados.length
        );
      } else {
        throw new Error(data.erro || "Erro ao carregar participantes");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar participantes:", error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (dados) => {
    const total = dados.length;
    const nacionais = dados.filter(
      (p) => p.categoriaMoto === "nacional"
    ).length;
    const importadas = dados.filter(
      (p) => p.categoriaMoto === "importada"
    ).length;
    const cidadesUnicas = [...new Set(dados.map((p) => p.cidade))].sort();
    const estadosUnicos = [...new Set(dados.map((p) => p.estado))].sort();

    setEstatisticas({
      total,
      nacionais,
      importadas,
      cidades: cidadesUnicas,
      estados: estadosUnicos,
    });
  };

  const aplicarFiltros = () => {
    let resultado = [...participantes];

    if (filtros.nome.trim()) {
      resultado = resultado.filter((p) =>
        p.nome.toLowerCase().includes(filtros.nome.toLowerCase())
      );
    }

    if (filtros.cidade.trim()) {
      resultado = resultado.filter((p) =>
        p.cidade.toLowerCase().includes(filtros.cidade.toLowerCase())
      );
    }

    if (filtros.categoriaMoto !== "todos") {
      resultado = resultado.filter(
        (p) => p.categoriaMoto === filtros.categoriaMoto
      );
    }

    setParticipantesFiltrados(resultado);
    setPaginaAtual(1);
  };

  const atualizarFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      nome: "",
      cidade: "",
      categoriaMoto: "todos",
    });
  };

  // Paginação
  const totalPaginas = Math.ceil(
    participantesFiltrados.length / itensPorPagina
  );
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const participantesPagina = participantesFiltrados.slice(
    indiceInicio,
    indiceInicio + itensPorPagina
  );

  const irParaPagina = (pagina) => {
    setPaginaAtual(Math.max(1, Math.min(pagina, totalPaginas)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="text-white">
            <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-xl">Carregando participantes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-black py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-red-900/40 backdrop-blur-lg rounded-3xl p-8 border border-red-400/30 text-center">
            <XCircle className="mx-auto text-red-400 mb-6" size={80} />
            <h1 className="text-4xl font-black text-white mb-4">Erro</h1>
            <p className="text-red-300 mb-6">Erro ao carregar dados</p>
            <button
              onClick={carregarParticipantes}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition-all"
            >
              <RefreshCw className="mr-2 inline" size={20} />
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            <Users className="inline mr-4" size={48} />
            INSCRITOS NO <span className="text-yellow-400">TRILHÃO</span>
          </h1>
          <p className="text-gray-400 text-xl">
            Veja quem vai participar da maior aventura off-road da Serra da
            Mantiqueira
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto mt-6"></div>
        </div>

        {/* Estatísticas Simples */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white">
            Dados Estastisticos
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-8">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-green-400/30 text-center">
            <div className="text-3xl font-black text-green-400">
              {estatisticas.total}
            </div>
            <div className="text-gray-300 text-sm">Total de Participantes</div>
          </div>
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-green-400/30 text-center">
            <div className="text-3xl font-black text-green-400">
              {estatisticas.nacionais}
            </div>
            <div className="text-gray-300 text-sm"> Motos Nacionais</div>
          </div>
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-yellow-400/30 text-center">
            <div className="text-3xl font-black text-yellow-400">
              {estatisticas.importadas}
            </div>
            <div className="text-gray-300 text-sm">Motos Importadas</div>
          </div>
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-green-400/30 text-center">
            <div className="text-3xl font-black text-green-400">
              {estatisticas.cidades.length}
            </div>
            <div className="text-gray-300 text-sm">Cidades Distintas</div>
          </div>
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-green-400/30 text-center">
            <div className="text-3xl font-black text-green-400">
              {estatisticas.estados.length}
            </div>
            <div className="text-gray-300 text-sm">Estados Distintos</div>
          </div>
        </div>

        {/* Botão para mostrar/ocultar gráficos */}
        <div className="text-center mb-8">
          <button
            onClick={() => setMostrarGraficos(!mostrarGraficos)}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-3 px-8 rounded-2xl transition-all transform hover:scale-105 flex items-center mx-auto"
          >
            <BarChart3 className="mr-3" size={24} />
            {mostrarGraficos ? "Ocultar Gráficos" : "Ver Gráficos Estatísticos"}
          </button>
        </div>

        {/* Gráficos Estatísticos */}
        {mostrarGraficos && (
          <div className="mb-12">
            <GraficosParticipantes participantes={participantes} />
          </div>
        )}

        {/* Filtros */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Filter className="text-yellow-400 mr-3" size={24} />
                <h3 className="text-xl font-bold text-white">Filtros</h3>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  {participantesFiltrados.length} participantes
                </span>
                <button
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-xl transition-all flex items-center"
                >
                  <ChevronDown
                    className={`mr-2 transition-transform ${
                      mostrarFiltros ? "rotate-180" : ""
                    }`}
                    size={16}
                  />
                  {mostrarFiltros ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {mostrarFiltros && (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Nome
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-3 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      value={filtros.nome}
                      onChange={(e) => atualizarFiltro("nome", e.target.value)}
                      placeholder="Buscar por nome..."
                      className="w-full bg-black/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:border-green-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Cidade
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-3 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      value={filtros.cidade}
                      onChange={(e) =>
                        atualizarFiltro("cidade", e.target.value)
                      }
                      placeholder="Buscar por cidade..."
                      className="w-full bg-black/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:border-green-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Categoria da Moto
                  </label>
                  <div className="relative">
                    <Bike
                      className="absolute left-3 top-3 text-gray-400"
                      size={20}
                    />
                    <select
                      value={filtros.categoriaMoto}
                      onChange={(e) =>
                        atualizarFiltro("categoriaMoto", e.target.value)
                      }
                      className="w-full bg-black/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:border-green-400 focus:outline-none appearance-none"
                    >
                      <option value="todos">Todas as categorias</option>
                      <option value="nacional">Motos Nacionais</option>
                      <option value="importada">Motos Importadas</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {mostrarFiltros &&
              (filtros.nome ||
                filtros.cidade ||
                filtros.categoriaMoto !== "todos") && (
                <div className="mt-4 text-center">
                  <button
                    onClick={limparFiltros}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-xl transition-all"
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Lista de Participantes */}
        <div className="max-w-6xl mx-auto">
          {participantesPagina.length === 0 ? (
            <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-12 border border-gray-600/30 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-2xl font-bold text-white mb-2">
                Nenhum participante encontrado
              </h3>
              <p className="text-gray-400">
                Tente ajustar os filtros ou aguarde novas inscrições.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {participantesPagina.map((participante, index) => (
                <div
                  key={participante.id}
                  className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 hover:border-green-400/60 transition-all"
                >
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    <div>
                      <div className="flex items-center">
                        <div className="bg-yellow-500 text-black font-black w-9 h-9 rounded-full flex items-center justify-center text-sm mr-3">
                          #
                          {participante.numeroInscricao?.split("TRI2025")[1] ||
                            indiceInicio + index + 1}
                        </div>
                        <div>
                          <h4 className="text-white font-bold">
                            {participante.nome}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400 flex items-center">
                        <MapPin className="mr-1 text-yellow-400" size={14} />
                        {participante.cidade}-{participante.estado}
                      </p>
                    </div>

                    <div>
                      <p className="text-white font-semibold">
                        {participante.modeloMoto}
                      </p>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          participante.categoriaMoto === "nacional"
                            ? "bg-green-900/50 text-green-400 border border-green-400/30"
                            : "bg-yellow-900/50 text-yellow-400 border border-yellow-400/30"
                        }`}
                      >
                        <Bike className="mr-1" size={12} />
                        {participante.categoriaMoto === "nacional"
                          ? "Nacional"
                          : "Importada"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <button
                onClick={() => irParaPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  paginaAtual === 1
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                Anterior
              </button>

              <div className="flex space-x-1">
                {[...Array(totalPaginas)].map((_, i) => {
                  const pagina = i + 1;
                  if (
                    pagina === 1 ||
                    pagina === totalPaginas ||
                    (pagina >= paginaAtual - 2 && pagina <= paginaAtual + 2)
                  ) {
                    return (
                      <button
                        key={pagina}
                        onClick={() => irParaPagina(pagina)}
                        className={`px-3 py-2 rounded-xl font-bold transition-all ${
                          paginaAtual === pagina
                            ? "bg-yellow-500 text-black"
                            : "bg-black/40 text-white hover:bg-gray-700"
                        }`}
                      >
                        {pagina}
                      </button>
                    );
                  } else if (
                    pagina === paginaAtual - 3 ||
                    pagina === paginaAtual + 3
                  ) {
                    return (
                      <span key={pagina} className="px-2 py-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => irParaPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  paginaAtual === totalPaginas
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                Próximo
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={carregarParticipantes}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
            >
              <RefreshCw className="mr-2 inline" size={20} />
              Atualizar Lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscritos;
