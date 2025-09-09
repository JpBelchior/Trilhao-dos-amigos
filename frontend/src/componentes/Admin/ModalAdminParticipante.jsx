import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  User,
  Bike,
  CreditCard,
  FileText,
  AlertTriangle,
  Loader2,
  Eye,
  Edit3,
  Trash2,
  Plus,
  ShirtIcon,
  Undo2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import {
  InputTexto,
  InputSelect,
  InputTextarea,
  SeletorCategoriaMoto,
} from "../form";

const ModalAdminParticipante = ({
  participante,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { fetchAuth } = useAuth();

  // ======= ESTADOS DO FORMULÁRIO =======
  const [formData, setFormData] = useState({
    nome: "",
    modeloMoto: "",
    categoriaMoto: "",
    statusPagamento: "",
    observacoes: "",
  });

  // ======= ESTADOS PARA CAMISETAS EXTRAS =======
  const [camisetasExtras, setCamisetasExtras] = useState([]);
  const [camisetasOriginais, setCamisetasOriginais] = useState([]); // Para comparação
  const [camisetasAdicionadas, setCamisetasAdicionadas] = useState([]); // Temporárias
  const [camisetasRemovidas, setCamisetasRemovidas] = useState([]); // IDs para remover
  const [estoque, setEstoque] = useState({});
  const [camisetaExtra, setCamisetaExtra] = useState({
    tamanho: "M",
    tipo: "manga_curta",
  });

  // ======= ESTADOS DA UI =======
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [alteracoes, setAlteracoes] = useState({});

  // ======= CONSTANTES =======
  const TamanhoCamiseta = ["PP", "P", "M", "G", "GG"];
  const TipoCamiseta = {
    manga_curta: "Manga Curta",
    manga_longa: "Manga Longa",
  };

  const statusOptions = [
    { value: "pendente", label: "⏳ Pendente" },
    { value: "confirmado", label: "✅ Confirmado" },
    { value: "cancelado", label: "❌ Cancelado" },
  ];

  // ======= CARREGAR ESTOQUE =======
  const carregarEstoque = async () => {
    try {
      console.log(" [Estoque] Carregando estoque...");
      const response = await fetch("http://localhost:8000/api/estoque");
      const data = await response.json();

      if (data.sucesso) {
        setEstoque(data.dados || {});
        console.log("✅ [Estoque] Carregado com sucesso:", data.dados);
      } else {
        console.error("❌ [Estoque] Erro:", data.erro);
      }
    } catch (error) {
      console.error("❌ [Estoque] Erro de conexão:", error);
    }
  };

  // ======= VERIFICAR DISPONIBILIDADE =======
  const verificarDisponibilidade = (tamanho, tipo) => {
    try {
      const item = estoque[tipo]?.[tamanho];
      const disponivel = item ? item.quantidadeDisponivel : 0;

      // Reduzir do estoque as camisetas que estão sendo adicionadas temporariamente
      const reservadas = camisetasAdicionadas.filter(
        (c) => c.tamanho === tamanho && c.tipo === tipo
      ).length;

      const disponivelReal = Math.max(0, disponivel - reservadas);
      console.log(
        `📊 [Estoque] ${tipo}.${tamanho}: ${disponivelReal} disponíveis (${disponivel} total - ${reservadas} reservadas)`
      );
      return disponivelReal;
    } catch (error) {
      console.error("❌ [Estoque] Erro ao verificar:", error);
      return 0;
    }
  };

  // ======= INICIALIZAR QUANDO MODAL ABRIR =======
  useEffect(() => {
    if (isOpen && participante) {
      console.log(
        "🔄 [Modal] Inicializando com participante:",
        participante.nome
      );

      // Carregar dados do formulário
      setFormData({
        nome: participante.nome || "",
        modeloMoto: participante.modeloMoto || "",
        categoriaMoto: participante.categoriaMoto || "nacional",
        statusPagamento: participante.statusPagamento || "pendente",
        observacoes: participante.observacoes || "",
      });

      // Carregar camisetas extras
      const camisetasOriginais = participante.camisetasExtras || [];
      setCamisetasExtras(camisetasOriginais);
      setCamisetasOriginais(camisetasOriginais);

      // Reset estados temporários
      setCamisetasAdicionadas([]);
      setCamisetasRemovidas([]);
      setAlteracoes({});
      setErro("");
      setModoEdicao(false);

      // Carregar estoque
      carregarEstoque();
    }
  }, [isOpen, participante]);

  // ======= ATUALIZAR CAMPO E MARCAR ALTERAÇÃO =======
  const atualizarCampo = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));

    // Marcar como alterado se diferente do original
    const valorOriginal = participante?.[campo] || "";
    if (valor !== valorOriginal) {
      setAlteracoes((prev) => ({ ...prev, [campo]: true }));
    } else {
      setAlteracoes((prev) => {
        const novas = { ...prev };
        delete novas[campo];
        return novas;
      });
    }

    if (erro) setErro("");
  };

  // ======= ADICIONAR CAMISETA EXTRA (TEMPORARIAMENTE) =======
  const adicionarCamisetaExtra = () => {
    const disponivel = verificarDisponibilidade(
      camisetaExtra.tamanho,
      camisetaExtra.tipo
    );

    if (disponivel <= 0) {
      setErro("Camiseta não disponível no estoque");
      return;
    }

    // Criar camiseta temporária com ID único
    const novaCamiseta = {
      id: `temp_${Date.now()}`, // ID temporário
      tamanho: camisetaExtra.tamanho,
      tipo: camisetaExtra.tipo,
      statusEntrega: "nao_entregue",
      isTemporary: true, // Flag para identificar como temporária
    };

    console.log("[Camiseta] Adicionando temporariamente:", novaCamiseta);

    // Adicionar à lista temporária
    setCamisetasAdicionadas((prev) => [...prev, novaCamiseta]);

    // Adicionar à visualização
    setCamisetasExtras((prev) => [...prev, novaCamiseta]);

    // Marcar que há alterações de camisetas
    setAlteracoes((prev) => ({ ...prev, camisetas: true }));

    setErro("");
  };

  // ======= REMOVER CAMISETA EXTRA (TEMPORARIAMENTE) =======
  const removerCamisetaExtra = (camisetaId) => {
    const camiseta = camisetasExtras.find((c) => c.id === camisetaId);

    if (camiseta?.isTemporary) {
      // Se é temporária, apenas remove das listas
      console.log(" [Camiseta] Removendo temporária:", camisetaId);
      setCamisetasAdicionadas((prev) =>
        prev.filter((c) => c.id !== camisetaId)
      );
      setCamisetasExtras((prev) => prev.filter((c) => c.id !== camisetaId));
    } else {
      // Se é original, marca para remoção
      console.log(" [Camiseta] Marcando para remoção:", camisetaId);
      setCamisetasRemovidas((prev) => [...prev, camisetaId]);
      setCamisetasExtras((prev) => prev.filter((c) => c.id !== camisetaId));
    }

    // Marcar que há alterações de camisetas
    setAlteracoes((prev) => ({ ...prev, camisetas: true }));
    setErro("");
  };

  // ======= PROCESSAR ALTERAÇÕES DE CAMISETAS =======
  const processarAlteracoesCamisetas = async () => {
    const resultados = [];

    // Processar remoções
    for (const camisetaId of camisetasRemovidas) {
      try {
        const response = await fetchAuth(
          `http://localhost:8000/api/camisetas-extras/${camisetaId}`,
          { method: "DELETE" }
        );

        const data = await response.json();
        if (!data.sucesso) {
          throw new Error(data.erro || "Erro ao remover camiseta");
        }

        console.log("✅ [Camiseta] Removida:", camisetaId);
        resultados.push({ tipo: "remoção", sucesso: true, id: camisetaId });
      } catch (error) {
        console.error("❌ [Camiseta] Erro ao remover:", error);
        resultados.push({
          tipo: "remoção",
          sucesso: false,
          erro: error.message,
        });
      }
    }

    // Processar adições
    for (const camiseta of camisetasAdicionadas) {
      try {
        const response = await fetchAuth(
          `http://localhost:8000/api/camisetas-extras/participantes/${participante.id}/camiseta-extra`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tamanho: camiseta.tamanho,
              tipo: camiseta.tipo,
            }),
          }
        );

        const data = await response.json();
        if (!data.sucesso) {
          throw new Error(data.erro || "Erro ao adicionar camiseta");
        }

        console.log("✅ [Camiseta] Adicionada:", data.dados.camisetaExtra);
        resultados.push({
          tipo: "adição",
          sucesso: true,
          dados: data.dados.camisetaExtra,
        });
      } catch (error) {
        console.error("❌ [Camiseta] Erro ao adicionar:", error);
        resultados.push({
          tipo: "adição",
          sucesso: false,
          erro: error.message,
        });
      }
    }

    return resultados;
  };

  // ======= SALVAR TODAS AS ALTERAÇÕES =======
  const salvarAlteracoes = async () => {
    const temAlteracoesDados = Object.keys(alteracoes).some(
      (key) => key !== "camisetas"
    );
    const temAlteracoesCamisetas = alteracoes.camisetas;

    if (!temAlteracoesDados && !temAlteracoesCamisetas) {
      setModoEdicao(false);
      return;
    }

    try {
      setLoading(true);
      setErro("");

      // 1. Salvar alterações dos dados do participante
      if (temAlteracoesDados) {
        const dadosParaAtualizar = {};
        Object.keys(alteracoes).forEach((campo) => {
          if (campo !== "camisetas") {
            dadosParaAtualizar[campo] = formData[campo];
          }
        });

        const response = await fetchAuth(
          `http://localhost:8000/api/participantes/${participante.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosParaAtualizar),
          }
        );

        const data = await response.json();
        if (!data.sucesso) {
          throw new Error(data.erro || "Erro ao salvar dados do participante");
        }

        console.log("✅ [Participante] Dados atualizados");
      }

      // 2. Processar alterações de camisetas
      if (temAlteracoesCamisetas) {
        const resultadosCamisetas = await processarAlteracoesCamisetas();

        // Verificar se houve erros
        const erros = resultadosCamisetas.filter((r) => !r.sucesso);
        if (erros.length > 0) {
          console.warn("⚠️ [Camisetas] Alguns erros ocorreram:", erros);
          setErro(
            `Alguns erros ocorreram: ${erros.map((e) => e.erro).join(", ")}`
          );
        }
      }

      // 3. Finalizar
      setModoEdicao(false);
      setAlteracoes({});
      setCamisetasAdicionadas([]);
      setCamisetasRemovidas([]);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("❌ [Modal] Erro ao salvar:", error);
      setErro(error.message || "Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  // ======= CANCELAR EDIÇÃO =======
  const cancelarEdicao = () => {
    // Restaurar dados originais
    setFormData({
      nome: participante.nome || "",
      modeloMoto: participante.modeloMoto || "",
      categoriaMoto: participante.categoriaMoto || "nacional",
      statusPagamento: participante.statusPagamento || "pendente",
      observacoes: participante.observacoes || "",
    });

    // Restaurar camisetas originais
    setCamisetasExtras(camisetasOriginais);
    setCamisetasAdicionadas([]);
    setCamisetasRemovidas([]);

    // Limpar estados
    setAlteracoes({});
    setErro("");
    setModoEdicao(false);
  };

  // ======= FORMATADORES =======
  const formatarTipoCamiseta = (tipo) => TipoCamiseta[tipo] || tipo;
  const calcularValorTotal = () => 100 + camisetasExtras.length * 50;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-green-400/30">
        {/* ======= HEADER ======= */}
        <div className="bg-gradient-to-r from-green-900 to-yellow-900 p-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {modoEdicao
                ? "Editando Participante"
                : "Detalhes do Participante"}
            </h2>
            <p className="text-green-200 mt-1">
              {participante?.numeroInscricao} - {participante?.nome}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-300 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* ======= ERRO ======= */}
        {erro && (
          <div className="mx-6 mt-4 bg-red-900/50 border border-red-400 rounded-xl p-4 flex items-center">
            <AlertTriangle className="text-red-400 mr-3" size={20} />
            <span className="text-red-200">{erro}</span>
          </div>
        )}

        {/* ======= CONTEÚDO PRINCIPAL ======= */}
        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* ======= COLUNA 1: DADOS FIXOS ======= */}
            <div>
              <h3 className="text-xl font-bold text-white flex items-center mb-6">
                <Eye className="mr-3 text-blue-400" size={24} />
                Dados Cadastrais
              </h3>

              <div className="space-y-4 bg-gray-800/50 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 block">CPF:</span>
                    <span className="text-white font-mono">
                      {participante?.cpf}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Email:</span>
                    <span className="text-white">{participante?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Telefone:</span>
                    <span className="text-white">{participante?.telefone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Localização:</span>
                    <span className="text-white">
                      {participante?.cidade}, {participante?.estado}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <ShirtIcon className="mr-2 text-yellow-400" size={18} />
                    Camiseta Principal
                  </h4>
                  <div className="bg-black/30 rounded-lg p-3">
                    <span className="text-white font-medium">
                      {participante?.tamanhoCamiseta} -{" "}
                      {formatarTipoCamiseta(participante?.tipoCamiseta)}
                    </span>
                    <span className="text-green-400 ml-3 font-bold">
                      R$ 100,00
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ======= COLUNA 2: DADOS EDITÁVEIS ======= */}
            <div>
              <h3 className="text-xl font-bold text-white flex items-center mb-6">
                <Edit3 className="mr-3 text-yellow-400" size={24} />
                Dados Editáveis
              </h3>

              <div className="space-y-6">
                <InputTexto
                  label="Nome Completo"
                  value={formData.nome}
                  onChange={(valor) => atualizarCampo("nome", valor)}
                  placeholder="Nome do participante"
                  disabled={!modoEdicao || loading}
                  required
                  icon={User}
                  variant="admin"
                />

                <InputTexto
                  label="Modelo da Moto"
                  value={formData.modeloMoto}
                  onChange={(valor) => atualizarCampo("modeloMoto", valor)}
                  placeholder="Ex: Honda Bros 160, KTM 350 EXC-F"
                  disabled={!modoEdicao || loading}
                  required
                  icon={Bike}
                  variant="admin"
                />

                <SeletorCategoriaMoto
                  value={formData.categoriaMoto}
                  onChange={(categoria) =>
                    atualizarCampo("categoriaMoto", categoria)
                  }
                  disabled={!modoEdicao || loading}
                  size="medium"
                  labelClassName="block text-gray-300 mb-2 font-semibold"
                />

                <InputSelect
                  label="Status de Pagamento"
                  value={formData.statusPagamento}
                  onChange={(valor) => atualizarCampo("statusPagamento", valor)}
                  options={statusOptions}
                  disabled={!modoEdicao || loading}
                  required
                  icon={CreditCard}
                  variant="admin"
                />

                <InputTextarea
                  label="Observações"
                  value={formData.observacoes}
                  onChange={(valor) => atualizarCampo("observacoes", valor)}
                  placeholder="Observações sobre o participante..."
                  disabled={!modoEdicao || loading}
                  rows={4}
                  icon={FileText}
                  variant="admin"
                />
              </div>
            </div>
          </div>

          {/* ======= SEÇÃO DE CAMISETAS EXTRAS ======= */}
          <div className="mt-8 border-t border-gray-600 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <ShirtIcon className="mr-3 text-yellow-400" size={24} />
                Camisetas Extras
              </h3>
              <span className="text-gray-300">
                Total:{" "}
                <span className="text-green-400 font-bold">
                  R$ {calcularValorTotal().toFixed(2)}
                </span>
              </span>
            </div>

            {/* ======= FORM PARA ADICIONAR CAMISETA  ======= */}
            {modoEdicao && (
              <div className="bg-yellow-900/30 rounded-xl p-6 mb-6 border border-yellow-400/30">
                <h4 className="text-white font-semibold mb-4">
                  Nova Camiseta Extra
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">
                      Tamanho
                    </label>
                    <select
                      value={camisetaExtra.tamanho}
                      onChange={(e) =>
                        setCamisetaExtra((prev) => ({
                          ...prev,
                          tamanho: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none transition-colors"
                    >
                      {TamanhoCamiseta.map((tamanho) => {
                        const disponivel = verificarDisponibilidade(
                          tamanho,
                          camisetaExtra.tipo
                        );
                        return (
                          <option key={tamanho} value={tamanho}>
                            {tamanho} - {disponivel} disponíveis
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">
                      Tipo
                    </label>
                    <select
                      value={camisetaExtra.tipo}
                      onChange={(e) =>
                        setCamisetaExtra((prev) => ({
                          ...prev,
                          tipo: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none transition-colors"
                    >
                      {Object.entries(TipoCamiseta).map(([key, label]) => {
                        const disponivel = verificarDisponibilidade(
                          camisetaExtra.tamanho,
                          key
                        );
                        return (
                          <option key={key} value={key}>
                            {label} - {disponivel} disponíveis
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      onClick={adicionarCamisetaExtra}
                      disabled={
                        verificarDisponibilidade(
                          camisetaExtra.tamanho,
                          camisetaExtra.tipo
                        ) <= 0
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition-all flex items-center justify-center font-semibold"
                    >
                      <Plus className="mr-2" size={16} />
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======= LISTA DE CAMISETAS EXTRAS ======= */}
            <div className="space-y-3">
              {camisetasExtras.length === 0 ? (
                <div className="text-center py-8 bg-gray-800/30 rounded-xl">
                  <ShirtIcon className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-400">
                    Nenhuma camiseta extra adicionada
                  </p>
                </div>
              ) : (
                camisetasExtras.map((camiseta, index) => {
                  const isTemporary = camiseta.isTemporary;
                  const isMarkedForRemoval = camisetasRemovidas.includes(
                    camiseta.id
                  );

                  return (
                    <div
                      key={camiseta.id || index}
                      className={`rounded-xl p-4 flex items-center justify-between transition-all ${
                        isTemporary
                          ? "bg-green-900/30 border border-green-400/50"
                          : isMarkedForRemoval
                          ? "bg-red-900/30 border border-red-400/50 opacity-60"
                          : "bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-lg ${
                            isTemporary
                              ? "bg-green-600/20 text-green-400"
                              : isMarkedForRemoval
                              ? "bg-red-600/20 text-red-400"
                              : camiseta.statusEntrega === "entregue"
                              ? "bg-green-600/20 text-green-400"
                              : "bg-yellow-600/20 text-yellow-400"
                          }`}
                        >
                          <ShirtIcon size={20} />
                        </div>
                        <div>
                          <p className="text-white font-semibold flex items-center">
                            {camiseta.tamanho} -{" "}
                            {formatarTipoCamiseta(camiseta.tipo)}
                            {isTemporary && (
                              <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                Nova
                              </span>
                            )}
                            {isMarkedForRemoval && (
                              <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                Será removida
                              </span>
                            )}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Status:{" "}
                            {isTemporary
                              ? "Pendente salvamento"
                              : isMarkedForRemoval
                              ? "Marcada para remoção"
                              : camiseta.statusEntrega === "entregue"
                              ? "Entregue"
                              : "Não entregue"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-green-400 font-bold">
                          R$ 50,00
                        </span>
                        {modoEdicao && (
                          <button
                            onClick={() => removerCamisetaExtra(camiseta.id)}
                            disabled={loading}
                            className={`p-2 rounded-lg transition-all ${
                              isMarkedForRemoval
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            } disabled:opacity-50`}
                          >
                            {loading ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : isMarkedForRemoval ? (
                              <Undo2 size={16} />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ======= RODAPÉ COM AÇÕES ======= */}
        <div className="border-t border-green-400/30 p-6">
          {!modoEdicao ? (
            <div className="flex justify-between">
              <button
                onClick={() => setModoEdicao(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl transition-all flex items-center font-semibold"
              >
                <Edit3 className="mr-2" size={18} />
                Editar Dados
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <div className="text-gray-300 text-sm">
                {Object.keys(alteracoes).length > 0 ? (
                  <span className="text-yellow-400">
                    Alterações detectadas: {Object.keys(alteracoes).join(", ")}
                  </span>
                ) : (
                  "Nenhuma alteração detectada"
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={cancelarEdicao}
                  disabled={loading}
                  className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all font-semibold"
                >
                  Cancelar
                </button>

                <button
                  onClick={salvarAlteracoes}
                  disabled={loading || Object.keys(alteracoes).length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all flex items-center font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={18} />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalAdminParticipante;
