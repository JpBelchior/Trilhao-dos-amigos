import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";
import LoadingComponent from "../../componentes/Loading";
import ErroComponent from "../../componentes/Erro";
import ExpandToggleButton from "../../componentes/ExpandToggleButton";

const EstoqueAdmin = () => {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();

  // Estados principais
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [estoque, setEstoque] = useState({});
  const [participantesReservados, setParticipantesReservados] = useState([]);
  const [resumoEstoque, setResumoEstoque] = useState({});

  // Estados para edição
  const [editando, setEditando] = useState(null);
  const [novaQuantidade, setNovaQuantidade] = useState("");

  // PONTO 2: Estados para filtros
  const [filtroNome, setFiltroNome] = useState("");

  // PONTO 3: Estado para expandir/contrair seção de estoque
  const [estoqueExpandido, setEstoqueExpandido] = useState(false);

  // Estados para loading individual dos botões
  const [loadingButtons, setLoadingButtons] = useState({});

  // PONTO 1: Estados para calcular camisetas entregues
  const [estatisticasEntrega, setEstatisticasEntrega] = useState({
    totalReservadas: 0,
    totalEntregues: 0,
    paraEntrega: 0,
  });

  // Enums
  const TamanhoCamiseta = ["PP", "P", "M", "G", "GG"];
  const TipoCamiseta = {
    manga_curta: "Manga Curta",
    manga_longa: "Manga Longa",
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // PONTO 1: Função para calcular estatísticas de entrega
  const calcularEstatisticasEntrega = (participantes) => {
    let totalCamisetasReservadas = 0;
    let totalCamisetasEntregues = 0;

    participantes.forEach((participante) => {
      // Camiseta principal (sempre tem 1)
      totalCamisetasReservadas += 1;
      if (participante.statusEntregaCamiseta === "entregue") {
        totalCamisetasEntregues += 1;
      }

      // Camisetas extras
      const extras = participante.camisetasExtras || [];
      totalCamisetasReservadas += extras.length;
      extras.forEach((extra) => {
        if (extra.statusEntrega === "entregue") {
          totalCamisetasEntregues += 1;
        }
      });
    });

    const paraEntrega = totalCamisetasReservadas - totalCamisetasEntregues;

    setEstatisticasEntrega({
      totalReservadas: totalCamisetasReservadas,
      totalEntregues: totalCamisetasEntregues,
      paraEntrega: paraEntrega,
    });
  };

  //Função melhorada para verificar se resposta é JSON
  const parseJsonSeguro = async (response) => {
    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const texto = await response.text();
      console.error("❌ Resposta não é JSON:", texto.substring(0, 200));

      // Verificar se é erro de autenticação (página de login HTML)
      if (texto.includes("<!DOCTYPE") || texto.includes("<html")) {
        throw new Error("Erro de autenticação. Faça login novamente.");
      }

      throw new Error(
        "Servidor retornou HTML em vez de JSON. Verifique se o backend está funcionando."
      );
    }

    return response.json();
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log("📊 Carregando dados do estoque...");

      // Carregar estoque detalhado
      const estoqueResponse = await fetchAuth(
        "http://localhost:8000/api/estoque"
      );
      const estoqueData = await parseJsonSeguro(estoqueResponse);

      // Carregar resumo do estoque
      const resumoResponse = await fetchAuth(
        "http://localhost:8000/api/estoque/resumo"
      );
      const resumoData = await parseJsonSeguro(resumoResponse);

      // Carregar participantes com suas camisetas reservadas
      const participantesResponse = await fetchAuth(
        "http://localhost:8000/api/participantes"
      );
      const participantesData = await parseJsonSeguro(participantesResponse);

      if (
        estoqueData.sucesso &&
        resumoData.sucesso &&
        participantesData.sucesso
      ) {
        setEstoque(estoqueData.dados);
        setResumoEstoque(resumoData.dados);

        // Filtrar apenas participantes confirmados (que têm camisetas reservadas)
        const confirmados = participantesData.dados.participantes.filter(
          (p) => p.statusPagamento === "confirmado"
        );
        setParticipantesReservados(confirmados);

        // PONTO 1: Calcular estatísticas de entrega
        calcularEstatisticasEntrega(confirmados);

        console.log("✅ Dados carregados:", {
          estoque: estoqueData.dados,
          resumo: resumoData.dados,
          participantes: confirmados.length,
        });
      } else {
        throw new Error("Erro ao carregar dados do servidor");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  // PONTO 4: Função melhorada para entrega de camiseta principal
  const toggleEntregaCamisetaPrincipal = async (participanteId) => {
    const buttonKey = `principal_${participanteId}`;

    if (loadingButtons[buttonKey]) {
      console.log("🔄 Botão já está processando...");
      return;
    }

    try {
      console.log(
        `🔄 [DEBUG] Processando entrega para participante: ${participanteId}`
      );

      setLoadingButtons((prev) => ({ ...prev, [buttonKey]: true }));

      const response = await fetchAuth(
        `http://localhost:8000/api/entrega/participante/${participanteId}/camiseta-principal`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`📡 [DEBUG] Status da resposta: ${response.status}`);

      if (!response.ok) {
        // PONTO 4: Verificar se backend suporta a operação
        if (response.status === 404) {
          throw new Error(
            "Endpoint de entrega não encontrado no backend. Funcionalidade ainda não implementada."
          );
        } else if (response.status === 401) {
          throw new Error("Não autorizado. Faça login novamente.");
        }
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await parseJsonSeguro(response);
      console.log(`📊 [DEBUG] Dados recebidos:`, data);

      if (data.sucesso) {
        console.log("✅ Status de entrega alterado:", data.mensagem);
        await carregarDados();
      } else {
        throw new Error(data.erro || "Erro desconhecido do servidor");
      }
    } catch (error) {
      console.error("❌ [ERRO] Detalhes completos:", error);

      let mensagemErro = "Erro desconhecido";
      if (error.message.includes("não encontrado")) {
        mensagemErro =
          "Funcionalidade de entrega ainda não implementada no backend";
      } else if (error.message.includes("HTML")) {
        mensagemErro = "Backend não está funcionando corretamente";
      } else if (error.message.includes("Failed to fetch")) {
        mensagemErro =
          "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";
      } else {
        mensagemErro = error.message;
      }

      alert(`Erro ao alterar entrega:\n\n${mensagemErro}`);
    } finally {
      setLoadingButtons((prev) => {
        const newState = { ...prev };
        delete newState[buttonKey];
        return newState;
      });
    }
  };

  // PONTO 4: Função melhorada para entrega de camiseta extra
  const toggleEntregaCamisetaExtra = async (camisetaExtraId) => {
    const buttonKey = `extra_${camisetaExtraId}`;

    if (loadingButtons[buttonKey]) {
      console.log("🔄 Botão extra já está processando...");
      return;
    }

    try {
      console.log(`🔄 [DEBUG] Processando entrega extra: ${camisetaExtraId}`);

      setLoadingButtons((prev) => ({ ...prev, [buttonKey]: true }));

      const response = await fetchAuth(
        `http://localhost:8000/api/entrega/camiseta-extra/${camisetaExtraId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`📡 [DEBUG] Status da resposta extra: ${response.status}`);

      if (!response.ok) {
        // PONTO 4: Verificar se backend suporta a operação
        if (response.status === 404) {
          throw new Error(
            "Endpoint de entrega de camisetas extras não encontrado no backend."
          );
        } else if (response.status === 401) {
          throw new Error("Não autorizado. Faça login novamente.");
        }
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await parseJsonSeguro(response);
      console.log(`📊 [DEBUG] Dados extra recebidos:`, data);

      if (data.sucesso) {
        console.log("✅ Status de entrega extra alterado:", data.mensagem);
        await carregarDados();
      } else {
        throw new Error(data.erro || "Erro desconhecido do servidor");
      }
    } catch (error) {
      console.error("❌ [ERRO EXTRA] Detalhes completos:", error);

      let mensagemErro = "Erro desconhecido";
      if (error.message.includes("não encontrado")) {
        mensagemErro =
          "Funcionalidade de entrega de extras ainda não implementada no backend";
      } else if (error.message.includes("HTML")) {
        mensagemErro = "Backend não está funcionando corretamente";
      } else if (error.message.includes("Failed to fetch")) {
        mensagemErro = "Não foi possível conectar ao servidor";
      } else {
        mensagemErro = error.message;
      }

      alert(`Erro ao alterar entrega da camiseta extra:\n\n${mensagemErro}`);
    } finally {
      setLoadingButtons((prev) => {
        const newState = { ...prev };
        delete newState[buttonKey];
        return newState;
      });
    }
  };

  const iniciarEdicao = (tamanho, tipo, quantidadeAtual) => {
    setEditando({ tamanho, tipo });
    setNovaQuantidade(quantidadeAtual.toString());
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setNovaQuantidade("");
  };

  const salvarAlteracaoEstoque = async () => {
    if (!editando) return;

    try {
      const { tamanho, tipo } = editando;
      const quantidade = parseInt(novaQuantidade);

      if (isNaN(quantidade) || quantidade < 0) {
        alert("Por favor, insira uma quantidade válida (número positivo)");
        return;
      }

      console.log(
        `💾 Atualizando estoque: ${tamanho} ${tipo} para ${quantidade}`
      );

      const response = await fetchAuth(
        `http://localhost:8000/api/estoque/${tamanho}/${tipo}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantidadeTotal: quantidade }),
        }
      );

      const data = await parseJsonSeguro(response);

      if (data.sucesso) {
        console.log("✅ Estoque atualizado com sucesso");
        await carregarDados();
        setEditando(null);
        setNovaQuantidade("");
      } else {
        throw new Error(data.erro || "Erro ao atualizar estoque");
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar estoque:", error);
      alert(`Erro ao atualizar estoque: ${error.message}`);
    }
  };

  // PONTO 2: Filtrar participantes apenas por nome (reutilizando filtro de inscritos)
  const participantesFiltrados = participantesReservados.filter(
    (participante) => {
      if (!filtroNome.trim()) return true;
      return participante.nome.toLowerCase().includes(filtroNome.toLowerCase());
    }
  );

  // Filtrar dados do estoque por tipo (para seção expandida)
  const getEstoqueFiltrado = () => {
    const result = [];

    Object.entries(estoque).forEach(([tipo, tamanhos]) => {
      Object.entries(tamanhos).forEach(([tamanho, dados]) => {
        result.push({
          tipo,
          tamanho,
          ...dados,
        });
      });
    });

    return result.sort((a, b) => {
      if (a.tipo !== b.tipo) return a.tipo.localeCompare(b.tipo);
      return (
        TamanhoCamiseta.indexOf(a.tamanho) - TamanhoCamiseta.indexOf(b.tamanho)
      );
    });
  };

  // PONTO 4: Função para verificar conectividade com o backend
  const verificarBackend = async () => {
    try {
      console.log("🔍 Verificando conectividade com backend...");

      const response = await fetch("http://localhost:8000/api/health");

      if (response.ok) {
        console.log("✅ Backend está online");
        alert("✅ Backend está funcionando normalmente!");
      } else {
        console.error("❌ Backend respondeu com erro:", response.status);
        alert(`❌ Backend retornou erro: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Erro ao conectar com backend:", error);
      alert(
        "❌ Não foi possível conectar ao backend. Verifique se está rodando na porta 8000."
      );
    }
  };

  // Componentes de botões com loading
  const BotaoEntregaPrincipal = ({ participante }) => {
    const buttonKey = `principal_${participante.id}`;
    const isLoading = loadingButtons[buttonKey];
    const camisetaPrincipalEntregue =
      participante.statusEntregaCamiseta === "entregue";

    return (
      <button
        onClick={() => toggleEntregaCamisetaPrincipal(participante.id)}
        disabled={isLoading}
        className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
          isLoading
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : camisetaPrincipalEntregue
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-yellow-600 hover:bg-yellow-700 text-white"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin inline-block w-3 h-3 mr-1" />
            Processando...
          </>
        ) : (
          <>
            {participante.tamanhoCamiseta} -{" "}
            {TipoCamiseta[participante.tipoCamiseta]}
          </>
        )}
      </button>
    );
  };

  const BotaoEntregaExtra = ({ camisetaExtra }) => {
    const buttonKey = `extra_${camisetaExtra.id}`;
    const isLoading = loadingButtons[buttonKey];
    const extraEntregue = camisetaExtra.statusEntrega === "entregue";

    return (
      <button
        onClick={() => toggleEntregaCamisetaExtra(camisetaExtra.id)}
        disabled={isLoading}
        className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
          isLoading
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : extraEntregue
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-yellow-600 hover:bg-yellow-700 text-white"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin inline-block w-3 h-3 mr-1" />
            ...
          </>
        ) : (
          <>
            {camisetaExtra.tamanho} - {TipoCamiseta[camisetaExtra.tipo]}
          </>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <LoadingComponent
        loading="Carregando dados do estoque..."
        className="bg-gradient-to-br from-green-900 via-black to-green-900"
      />
    );
  }

  if (erro) {
    return (
      <ErroComponent
        erro={{
          mensagem: erro,
          tipo: "conexao",
        }}
        onTentarNovamente={carregarDados}
        className="bg-gradient-to-br from-green-900 via-black to-green-900"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate("/admin")}
                className="mr-4 p-2 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-5xl font-black text-white">
                GESTÃO DE <span className="text-yellow-400">ESTOQUE</span>
              </h1>
            </div>
            <p className="text-gray-400 text-xl">
              Controle do estoque e das entregas
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={verificarBackend}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center"
            >
              🔍 Testar Backend
            </button>
            <button
              onClick={carregarDados}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center"
            >
              <RefreshCw className="mr-2" size={20} />
              Atualizar
            </button>
          </div>
        </div>

        {/* PONTO 1: Cards de Resumo com cálculo correto */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          <div className="bg-black/50 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Tipos de Camisa
                </p>
                <p className="text-3xl font-bold text-white">
                  {resumoEstoque.totalProdutos || 0}
                </p>
              </div>
              <Package className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-black/50 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Camisas disponíveis
                </p>
                <p className="text-3xl font-bold text-white">
                  {resumoEstoque.totalDisponiveis}
                </p>
              </div>
              <ShoppingBag className="text-green-400" size={32} />
            </div>
          </div>
          <div className="bg-black/50 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Total Reservado
                </p>
                <p className="text-3xl font-bold text-white">
                  {estatisticasEntrega.totalReservadas}
                </p>
              </div>
              <ShoppingBag className="text-yellow-400" size={32} />
            </div>
          </div>

          <div className="bg-black/50 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Total Entregue
                </p>
                <p className="text-3xl font-bold text-white">
                  {estatisticasEntrega.totalEntregues}
                </p>
              </div>
              <CheckCircle className="text-blue-400" size={32} />
            </div>
          </div>

          {/* PONTO 1: Card com fórmula: reservadas - entregues */}
          <div className="bg-black/50 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Camisas para Entrega
                </p>
                <p className="text-3xl font-bold text-white">
                  {estatisticasEntrega.paraEntrega}
                </p>
              </div>
              <AlertCircle className="text-orange-400" size={32} />
            </div>
          </div>
        </div>

        {/* PONTO 3: Seção de Estoque com botão para expandir/contrair */}
        <div className="bg-black/30 border border-green-500/30 rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">
              Controle de Estoque
            </h2>

            {/* PONTO 3: Botão para expandir/contrair (semelhante ao stat card) */}
            <ExpandToggleButton
              isExpanded={estoqueExpandido}
              onToggle={() => setEstoqueExpandido(!estoqueExpandido)}
              label="Detalhes do Estoque"
              variant="yellow"
              size="medium"
            />
          </div>

          {/* PONTO 3: Conteúdo expandível */}
          {estoqueExpandido && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-4 px-4 text-gray-300">Tipo</th>
                    <th className="text-left py-4 px-4 text-gray-300">
                      Tamanho
                    </th>
                    <th className="text-center py-4 px-4 text-gray-300">
                      Total
                    </th>
                    <th className="text-center py-4 px-4 text-gray-300">
                      Reservado
                    </th>
                    <th className="text-center py-4 px-4 text-gray-300">
                      Disponível
                    </th>
                    <th className="text-center py-4 px-4 text-gray-300">
                      Status
                    </th>
                    <th className="text-center py-4 px-4 text-gray-300">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getEstoqueFiltrado().map((item) => (
                    <tr
                      key={`${item.tipo}-${item.tamanho}`}
                      className="border-b border-gray-700 hover:bg-gray-800/30"
                    >
                      <td className="py-4 px-4 text-white font-medium">
                        {TipoCamiseta[item.tipo]}
                      </td>
                      <td className="py-4 px-4 text-white font-bold">
                        {item.tamanho}
                      </td>
                      <td className="text-center py-4 px-4">
                        {editando?.tamanho === item.tamanho &&
                        editando?.tipo === item.tipo ? (
                          <input
                            type="number"
                            value={novaQuantidade}
                            onChange={(e) => setNovaQuantidade(e.target.value)}
                            className="w-20 bg-gray-800 text-white text-center py-1 px-2 rounded border border-gray-600"
                            min="0"
                          />
                        ) : (
                          <span className="text-white font-bold">
                            {item.quantidadeTotal}
                          </span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4 text-red-400 font-bold">
                        {item.quantidadeReservada}
                      </td>
                      <td className="text-center py-4 px-4 text-green-400 font-bold">
                        {item.quantidadeDisponivel}
                      </td>
                      <td className="text-center py-4 px-4">
                        {item.quantidadeDisponivel === 0 ? (
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            ESGOTADO
                          </span>
                        ) : item.quantidadeDisponivel < 5 ? (
                          <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                            BAIXO
                          </span>
                        ) : (
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {editando?.tamanho === item.tamanho &&
                        editando?.tipo === item.tipo ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={salvarAlteracaoEstoque}
                              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={cancelarEdicao}
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              iniciarEdicao(
                                item.tamanho,
                                item.tipo,
                                item.quantidadeTotal
                              )
                            }
                            className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Seção de Camisetas Reservadas */}
        <div className="bg-black/30 border border-yellow-500/30 rounded-xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">
              Camisetas Reservadas ({participantesFiltrados.length})
            </h2>

            {/* PONTO 2: Filtro simplificado - apenas nome (reutilizando filtro de inscritos) */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              {filtroNome && (
                <button
                  onClick={() => setFiltroNome("")}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Limpar filtro"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Participantes */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-4 px-4 text-gray-300">
                    Participante
                  </th>
                  <th className="text-left py-4 px-4 text-gray-300">Cidade</th>
                  <th className="text-center py-4 px-4 text-gray-300">
                    Camiseta Principal
                  </th>
                  <th className="text-center py-4 px-4 text-gray-300">
                    Camisetas Extras
                  </th>
                  <th className="text-center py-4 px-4 text-gray-300">
                    Status Geral
                  </th>
                  <th className="text-center py-4 px-4 text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {participantesFiltrados.map((participante) => {
                  const camisetaPrincipalEntregue =
                    participante.statusEntregaCamiseta === "entregue";
                  const camisetasExtras = participante.camisetasExtras || [];
                  const todasExtrasEntregues =
                    camisetasExtras.length === 0 ||
                    camisetasExtras.every(
                      (extra) => extra.statusEntrega === "entregue"
                    );
                  const todasCamisetasEntregues =
                    camisetaPrincipalEntregue && todasExtrasEntregues;

                  return (
                    <tr
                      key={participante.id}
                      className="border-b border-gray-700 hover:bg-gray-800/30"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">
                            {participante.nome}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {participante.numeroInscricao}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {participante.cidade}, {participante.estado}
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="flex flex-col items-center gap-2">
                          <BotaoEntregaPrincipal participante={participante} />
                          <span
                            className={`text-xs font-bold ${
                              camisetaPrincipalEntregue
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {camisetaPrincipalEntregue
                              ? "✅ ENTREGUE"
                              : "❌ PENDENTE"}
                          </span>
                          {camisetaPrincipalEntregue &&
                            participante.dataEntregaCamiseta && (
                              <span className="text-gray-400 text-xs">
                                {new Date(
                                  participante.dataEntregaCamiseta
                                ).toLocaleString("pt-BR")}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        {camisetasExtras.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {camisetasExtras.map((extra) => {
                              const extraEntregue =
                                extra.statusEntrega === "entregue";
                              return (
                                <div
                                  key={extra.id}
                                  className="flex flex-col items-center gap-1"
                                >
                                  <BotaoEntregaExtra camisetaExtra={extra} />
                                  <span
                                    className={`text-xs font-bold ${
                                      extraEntregue
                                        ? "text-green-400"
                                        : "text-yellow-400"
                                    }`}
                                  >
                                    {extraEntregue ? "✅" : "❌"}
                                  </span>
                                  {extraEntregue && extra.dataEntrega && (
                                    <span className="text-gray-400 text-xs">
                                      {new Date(
                                        extra.dataEntrega
                                      ).toLocaleString("pt-BR")}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400">Nenhuma</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              todasCamisetasEntregues
                                ? "bg-green-500 text-white"
                                : "bg-orange-500 text-white"
                            }`}
                          >
                            {todasCamisetasEntregues
                              ? "✅ COMPLETO"
                              : "⏳ PENDENTE"}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {1 + camisetasExtras.length} camiseta
                            {1 + camisetasExtras.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="flex justify-center gap-2">
                          {/* Botão de ações rápidas */}
                          <button
                            onClick={() =>
                              toggleEntregaCamisetaPrincipal(participante.id)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              camisetaPrincipalEntregue
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-yellow-600 hover:bg-yellow-700 text-white"
                            }`}
                            title={`${
                              camisetaPrincipalEntregue ? "Desmarcar" : "Marcar"
                            } camiseta principal`}
                          >
                            {camisetaPrincipalEntregue ? (
                              <CheckCircle size={16} />
                            ) : (
                              <X size={16} />
                            )}
                          </button>
                          {camisetasExtras.length > 0 && (
                            <span className="text-gray-400 text-xs self-center">
                              +{camisetasExtras.length} extra
                              {camisetasExtras.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mensagem quando não há participantes */}
          {participantesFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 text-xl">
                {filtroNome
                  ? `Nenhum participante encontrado com o nome "${filtroNome}"`
                  : "Nenhuma camiseta reservada ainda"}
              </p>
            </div>
          )}
        </div>

        {/* Dicas de uso */}
        <div className="mt-8 bg-green-900/30 rounded-2xl p-6 border border-green-400/30">
          <h4 className="text-lg font-bold text-green-400 mb-3">
            💡 Como usar esta página
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <p>
                • <strong>Filtro por Nome:</strong> Digite para encontrar
                participantes específicos
              </p>
              <p>
                • <strong>Botões Coloridos:</strong> Clique nas camisetas para
                marcar como entregues
              </p>
              <p>
                • <strong>Verde:</strong> Camiseta já foi entregue
              </p>
              <p>
                • <strong>Amarelo:</strong> Camiseta ainda não foi entregue
              </p>
            </div>
            <div>
              <p>
                • <strong>Seção de Estoque:</strong> Clique em "Mostrar
                Detalhes" para ver/editar quantidades
              </p>
              <p>
                • <strong>Status Geral:</strong> Mostra se todas as camisetas do
                participante foram entregues
              </p>
              <p>
                • <strong>Camisas para Entrega:</strong> Calculado como:
                Reservadas - Entregues
              </p>
              <p>
                • <strong>Teste de Backend:</strong> Use o botão "Testar
                Backend" se houver problemas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstoqueAdmin;
