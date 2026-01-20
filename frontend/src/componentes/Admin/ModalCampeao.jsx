// frontend/src/componentes/Admin/ModalCampeao.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Trophy,
  Edit3,
  Trash2,
  Save,
  User,
  Bike,
  MapPin,
  Target,
  Calendar,
  Award,
  Loader2,
} from "lucide-react";

const ModalCampeao = ({
  campeao,
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  editarCampeao,
  excluirCampeao,
  operacaoLoading,
}) => {

  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    resultadoAltura: "",
    modeloMoto: "",
    categoriaMoto: "nacional",
    cidade: "",
    estado: "",
    edicao: "",
    ano: "",
  });

  useEffect(() => {
    if (campeao && isOpen) {
      setFormData({
        nome: campeao.nome || "",
        resultadoAltura: campeao.resultadoAltura || "",
        modeloMoto: campeao.modeloMoto || "",
        categoriaMoto: campeao.categoriaMoto || "nacional",
        cidade: campeao.cidade || "",
        estado: campeao.estado || "",
        edicao: campeao.edicao || "",
        ano: campeao.ano || "",
      });
      setModoEdicao(false);
      setErro("");
    }
  }, [campeao, isOpen]);

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSalvar = async () => {
    try {
      setLoading(true);
      setErro("");

      // Validações
      if (!formData.nome.trim()) {
        setErro("Nome é obrigatório");
        return;
      }

      if (!formData.resultadoAltura || parseFloat(formData.resultadoAltura) <= 0) {
        setErro("Resultado deve ser maior que zero");
        return;
      }

      const resultado = await editarCampeao(campeao.id, formData);

      if (resultado.sucesso) {
        console.log("✅ [ModalCampeao] Campeão atualizado com sucesso");
        setModoEdicao(false);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(resultado.erro || "Erro ao salvar");
      }
    } catch (error) {
      console.error("❌ [ModalCampeao] Erro ao salvar:", error);
      setErro(error.message || "Erro ao salvar alterações");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async () => {
    if (
      !confirm(
        `⚠️ Tem certeza que deseja excluir o campeão ${campeao.nome}?\n\nEsta ação não pode ser desfeita!`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setErro("");

      const resultado = await excluirCampeao(campeao.id);

      if (resultado.sucesso) {
        console.log("✅ [ModalCampeao] Campeão excluído com sucesso");
        if (onDelete) onDelete();
      } else {
        throw new Error(resultado.erro || "Erro ao excluir");
      }
    } catch (error) {
      console.error("❌ [ModalCampeao] Erro ao excluir:", error);
      setErro(error.message || "Erro ao excluir campeão");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    // Restaurar dados originais
    setFormData({
      nome: campeao.nome || "",
      resultadoAltura: campeao.resultadoAltura || "",
      modeloMoto: campeao.modeloMoto || "",
      categoriaMoto: campeao.categoriaMoto || "nacional",
      cidade: campeao.cidade || "",
      estado: campeao.estado || "",
      edicao: campeao.edicao || "",
      ano: campeao.ano || "",
    });
    setErro("");
    setModoEdicao(false);
  };

  if (!isOpen || !campeao) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-yellow-400/30">
       
        <div className="bg-gradient-to-r from-yellow-900 to-green-900 p-6 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="mr-3 text-yellow-400" size={28} />
              {modoEdicao ? "Editar Campeão" : "Detalhes do Campeão"}
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              {campeao.edicao} • {campeao.ano}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {erro && (
          <div className="mx-6 mt-6 bg-red-900/30 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 text-sm">{erro}</p>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* DADOS PRINCIPAIS */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nome */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <User className="mr-2" size={16} />
                Nome Completo
              </label>
              {modoEdicao ? (
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  placeholder="Nome do campeão"
                />
              ) : (
                <p className="text-white font-semibold text-lg">{campeao.nome}</p>
              )}
            </div>

            {/* Resultado */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <Target className="mr-2" size={16} />
                Resultado (metros)
              </label>
              {modoEdicao ? (
                <input
                  type="number"
                  step="0.01"
                  value={formData.resultadoAltura}
                  onChange={(e) => handleChange("resultadoAltura", e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  placeholder="Ex: 45.5"
                />
              ) : (
                <div className="bg-green-600/30 rounded-lg px-4 py-2 inline-block">
                  <span className="text-green-400 font-bold text-2xl">
                    {campeao.resultadoAltura}m
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* MOTO E CATEGORIA */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Modelo da Moto */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <Bike className="mr-2" size={16} />
                Modelo da Moto
              </label>
              {modoEdicao ? (
                <input
                  type="text"
                  value={formData.modeloMoto}
                  onChange={(e) => handleChange("modeloMoto", e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  placeholder="Ex: Honda CRF 250"
                />
              ) : (
                <p className="text-white font-medium">{campeao.modeloMoto}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <Award className="mr-2" size={16} />
                Categoria
              </label>
              {modoEdicao ? (
                <select
                  value={formData.categoriaMoto}
                  onChange={(e) => handleChange("categoriaMoto", e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                >
                  <option value="nacional">🇧🇷 Nacional</option>
                  <option value="importada">🌎 Importada</option>
                </select>
              ) : (
                <p className="text-white font-medium">
                  {campeao.categoriaMoto === "nacional" ? "🇧🇷 Nacional" : "🌎 Importada"}
                </p>
              )}
            </div>
          </div>

          {/* LOCALIZAÇÃO */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cidade */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <MapPin className="mr-2" size={16} />
                Cidade
              </label>
              {modoEdicao ? (
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  placeholder="Ex: Itamonte"
                />
              ) : (
                <p className="text-white">{campeao.cidade}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <MapPin className="mr-2" size={16} />
                Estado
              </label>
              {modoEdicao ? (
                <input
                  type="text"
                  value={formData.estado}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  placeholder="Ex: MG"
                  maxLength={2}
                />
              ) : (
                <p className="text-white">{campeao.estado}</p>
              )}
            </div>
          </div>

          {/* EDIÇÃO E ANO */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Edição */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <Calendar className="mr-2" size={16} />
                Edição
              </label>
              {modoEdicao ? (
                <input
                  type="text"
                  value={formData.edicao}
                  onChange={(e) => handleChange("edicao", e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  placeholder="Ex: 8ª Edição"
                />
              ) : (
                <p className="text-yellow-400 font-semibold">{campeao.edicao}</p>
              )}
            </div>

            {/* Ano */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <Calendar className="mr-2" size={16} />
                Ano
              </label>
              {modoEdicao ? (
                <input
                  type="number"
                  value={formData.ano}
                  onChange={(e) => handleChange("ano", e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  placeholder="Ex: 2024"
                  min="2000"
                  max="2100"
                />
              ) : (
                <p className="text-white">{campeao.ano}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-yellow-400/30 p-6 bg-gray-900/50">
          {!modoEdicao ? (
            <div className="flex justify-between">
              <button
                onClick={handleExcluir}
                disabled={loading || operacaoLoading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all flex items-center font-semibold"
              >
                {loading ? (
                  <Loader2 className="mr-2 animate-spin" size={18} />
                ) : (
                  <Trash2 className="mr-2" size={18} />
                )}
                Excluir Campeão
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all font-semibold"
                >
                  Fechar
                </button>

                <button
                  onClick={() => setModoEdicao(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black px-6 py-3 rounded-xl transition-all flex items-center font-semibold"
                >
                  <Edit3 className="mr-2" size={18} />
                  Editar Dados
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelar}
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
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCampeao;