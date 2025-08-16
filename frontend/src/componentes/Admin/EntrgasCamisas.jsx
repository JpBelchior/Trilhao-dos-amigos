import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
} from "lucide-react";
import LoadingComponent from "../../componentes/Loading";
import ErroComponent from "../../componentes/Erro";
import ExpandToggleButton from "../ExpandToggleButton";

const TabelaCamisasReservadas = () => {
  const { fetchAuth } = useAuth();

  // Estados principais
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [participantesReservados, setParticipantesReservados] = useState([]);
  const [resumoEntregas, setResumoEntregas] = useState({});

  const [expandido, setExpandido] = useState(true);
  // Estados para filtros
  const [filtroNome, setFiltroNome] = useState("");

  // Estados para loading individual dos botões
  const [loadingButtons, setLoadingButtons] = useState({});

  // Enums
  const TipoCamiseta = {
    manga_curta: "Manga Curta",
    manga_longa: "Manga Longa",
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Função principal para carregar dados
  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      // Carregar participantes com suas camisetas reservadas
      const participantesResponse = await fetchAuth(
        "http://localhost:8000/api/participantes"
      );
      const participantesData = await participantesResponse.json();

      // Carregar resumo de entregas do novo endpoint
      const resumoResponse = await fetchAuth(
        "http://localhost:8000/api/entrega/resumo"
      );
      const resumoData = await resumoResponse.json();

      if (participantesData.sucesso && resumoData.sucesso) {
        // Filtrar apenas participantes confirmados (que têm camisetas reservadas)
        const confirmados = participantesData.dados.participantes.filter(
          (p) => p.statusPagamento === "confirmado"
        );
        setParticipantesReservados(confirmados);
        setResumoEntregas(resumoData.dados);
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

  // Função para entrega de camiseta principal
  const toggleEntregaCamisetaPrincipal = async (participanteId) => {
    const buttonKey = `principal_${participanteId}`;

    if (loadingButtons[buttonKey]) return;

    try {
      setLoadingButtons((prev) => ({ ...prev, [buttonKey]: true }));

      const response = await fetchAuth(
        `http://localhost:8000/api/entrega/participante/${participanteId}/camiseta-principal`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.sucesso) {
          await carregarDados();
        }
      }
    } catch (error) {
      console.error("❌ Erro ao alterar entrega principal:", error);
    } finally {
      setLoadingButtons((prev) => {
        const newState = { ...prev };
        delete newState[buttonKey];
        return newState;
      });
    }
  };

  // Função para entrega de camiseta extra
  const toggleEntregaCamisetaExtra = async (camisetaExtraId) => {
    const buttonKey = `extra_${camisetaExtraId}`;

    if (loadingButtons[buttonKey]) return;

    try {
      setLoadingButtons((prev) => ({ ...prev, [buttonKey]: true }));

      const response = await fetchAuth(
        `http://localhost:8000/api/entrega/camiseta-extra/${camisetaExtraId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.sucesso) {
          await carregarDados();
        }
      }
    } catch (error) {
      console.error("❌ Erro ao alterar entrega extra:", error);
    } finally {
      setLoadingButtons((prev) => {
        const newState = { ...prev };
        delete newState[buttonKey];
        return newState;
      });
    }
  };

  // Filtrar participantes por nome
  const participantesFiltrados = participantesReservados.filter(
    (participante) => {
      if (!filtroNome.trim()) return true;
      return participante.nome.toLowerCase().includes(filtroNome.toLowerCase());
    }
  );

  // Componente de botão para camiseta principal
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

  // Componente de botão para camiseta extra
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
            <Loader2 className="animate-spin inline-block w-2 h-2 mr-1" />
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

  if (loading) return <LoadingComponent />;
  if (erro) return <ErroComponent mensagem={erro} />;

  return (
    <div className="bg-black/30 border border-yellow-500/30 rounded-xl p-8">
      {/* Header da seção */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">
          Camisetas Reservadas
        </h2>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Campo de busca */}
          {!expandido && (
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar participante..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none w-full md:w-64"
              />
            </div>
          )}
          <ExpandToggleButton
            isExpanded={!expandido}
            onToggle={() => setExpandido(!expandido)}
            label="Dados do Usuario"
            variant="yellow"
            size="small"
          />
        </div>
      </div>

      {/* Cards de resumo das entregas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/50 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">
                Total Reservadas
              </p>
              <p className="text-2xl font-bold text-white">
                {resumoEntregas.geral?.totalReservadas || 0}
              </p>
            </div>
            <CheckCircle className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-black/50 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">
                Total Entregues
              </p>
              <p className="text-2xl font-bold text-white">
                {resumoEntregas.geral?.totalEntregues || 0}
              </p>
            </div>
            <CheckCircle className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-black/50 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-white">
                {resumoEntregas.geral?.pendentes || 0}
              </p>
            </div>
            <AlertCircle className="text-orange-400" size={24} />
          </div>
        </div>

        <div className="bg-black/50 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">% Entregue</p>
              <p className="text-2xl font-bold text-white">
                {resumoEntregas.geral?.percentualEntregue || 0}%
              </p>
            </div>
            <CheckCircle className="text-purple-400" size={24} />
          </div>
        </div>
      </div>

      {/* Tabela de participantes */}
      {expandido ? (
        participantesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-400 text-lg">
              {filtroNome.trim()
                ? "Nenhum participante encontrado com esse nome"
                : "Nenhuma camiseta reservada encontrada"}
            </p>
          </div>
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-4 px-4 text-gray-300">
                  <User className="inline mr-2" size={16} />
                  Participante
                </th>
                <th className="text-left py-4 px-4 text-gray-300">
                  <MapPin className="inline mr-2" size={16} />
                  Localização
                </th>
                <th className="text-center py-4 px-4 text-gray-300">
                  Camiseta Principal
                </th>
                <th className="text-center py-4 px-4 text-gray-300">
                  Camisetas Extras
                </th>
                <th className="text-center py-4 px-4 text-gray-300">
                  Status Geral
                </th>
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
                                    {new Date(extra.dataEntrega).toLocaleString(
                                      "pt-BR"
                                    )}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TabelaCamisasReservadas;
