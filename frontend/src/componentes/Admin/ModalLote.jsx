import React, { useState, useEffect } from "react";
import { DATA_LIMITE_COMPETICAO, DATA_LIMITE_COMPETICAO_DISPLAY } from "../../constants";
import { X, Layers, Save, AlertCircle, Loader2, Calendar, DollarSign } from "lucide-react";

const ModalLote = ({ isOpen, lote, onClose, criarLote, editarLote, operacaoLoading }) => {
  const modoEdicao = lote != null;

  const [formData, setFormData] = useState({
    numero: "",
    dataInicio: "",
    dataFim: "",
    precoInscricao: "",
    precoCamisa: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (modoEdicao) {
        setFormData({
          numero: lote.numero,
          dataInicio: lote.dataInicio,
          dataFim: lote.dataFim,
          precoInscricao: String(Number(lote.precoInscricao)),
          precoCamisa: String(Number(lote.precoCamisa)),
        });
      } else {
        setFormData({ numero: "", dataInicio: "", dataFim: "", precoInscricao: "", precoCamisa: "" });
      }
      setErro("");
    }
  }, [isOpen, lote]);

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    setErro("");
  };

  const validar = () => {
    if (!formData.numero.trim()) {
      setErro("Número do lote é obrigatório");
      return false;
    }
    if (!formData.dataInicio) {
      setErro("Data de início é obrigatória");
      return false;
    }
    if (!formData.dataFim) {
      setErro("Data de fim é obrigatória");
      return false;
    }
    if (formData.dataFim < formData.dataInicio) {
      setErro("Data de fim deve ser igual ou posterior à data de início");
      return false;
    }
    if (formData.dataFim > DATA_LIMITE_COMPETICAO) {
      setErro(`A data de fim não pode ultrapassar ${DATA_LIMITE_COMPETICAO_DISPLAY} (dia da competição)`);
      return false;
    }
    if (formData.precoInscricao === "" || Number(formData.precoInscricao) < 0) {
      setErro("Preço de inscrição inválido");
      return false;
    }
    if (formData.precoCamisa === "" || Number(formData.precoCamisa) < 0) {
      setErro("Preço da camisa inválido");
      return false;
    }
    return true;
  };

  const handleSalvar = async () => {
    if (!validar()) return;

    setLoading(true);
    setErro("");

    const dados = {
      numero: formData.numero.trim(),
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      precoInscricao: Number(formData.precoInscricao),
      precoCamisa: Number(formData.precoCamisa),
    };

    const resultado = modoEdicao
      ? await editarLote(lote.id, dados)
      : await criarLote(dados);

    if (resultado.sucesso) {
      onClose();
    } else {
      setErro(resultado.erro || "Erro ao salvar lote");
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-lg w-full border border-yellow-400/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-900 to-green-900 p-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Layers className="mr-3 text-yellow-400" size={26} />
              {modoEdicao ? `Editar Lote ${lote.numero}` : "Novo Lote"}
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              {modoEdicao ? "Altere os dados do lote." : "Preencha os dados do novo lote."} <br/> Data limite: {DATA_LIMITE_COMPETICAO_DISPLAY}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {erro && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 flex items-center">
              <AlertCircle className="text-red-400 mr-2 flex-shrink-0" size={18} />
              <p className="text-red-400 text-sm">{erro}</p>
            </div>
          )}

          {/* Número */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Número do Lote *
            </label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) => handleChange("numero", e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
              placeholder="Ex: 1, 2, VIP"
              disabled={loading}
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1 flex items-center gap-1">
                <Calendar size={14} />
                Data de Início *
              </label>
              <input
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleChange("dataInicio", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1 flex items-center gap-1">
                <Calendar size={14} />
                Data de Fim *
              </label>
              <input
                type="date"
                value={formData.dataFim}
                max={DATA_LIMITE_COMPETICAO}
                onChange={(e) => handleChange("dataFim", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* Preços */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1 flex items-center gap-1">
                <DollarSign size={14} />
                Preço Inscrição (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precoInscricao}
                onChange={(e) => handleChange("precoInscricao", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                placeholder="100.00"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1 flex items-center gap-1">
                <DollarSign size={14} />
                Preço Camisa (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precoCamisa}
                onChange={(e) => handleChange("precoCamisa", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                placeholder="50.00"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-yellow-400/30 p-6 bg-gray-900/50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading || operacaoLoading}
            className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={loading || operacaoLoading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all flex items-center font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2" size={18} />
                {modoEdicao ? "Salvar Alterações" : "Criar Lote"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalLote;
