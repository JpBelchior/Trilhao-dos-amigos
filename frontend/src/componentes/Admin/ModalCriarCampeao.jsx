import React, { useState, useEffect } from "react";
import {
  X,
  Trophy,
  Save,
  User,
  Bike,
  MapPin,
  Target,
  Calendar,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAdminCampeoes } from "../../hooks/useAdminCampeoes";
import { calcularEdicao, anoEhValido } from "../../utils/calcularEdicao";

const ModalCriarCampeao = ({ isOpen, onClose, onSuccess, operacaoLoading }) => {
 
  const { criarCampeao } = useAdminCampeoes();

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

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
    if (isOpen) {
      const anoAtual = new Date().getFullYear();
      const { edicao } = calcularEdicao(anoAtual);

      // Resetar form ao abrir
      setFormData({
        nome: "",
        resultadoAltura: "",
        modeloMoto: "",
        categoriaMoto: "nacional",
        cidade: "",
        estado: "",
        edicao: edicao, 
        ano: anoAtual.toString(), 
      });
      setErro("");
      setSucesso("");
    }
  }, [isOpen]);


  useEffect(() => {
    if (formData.ano) {
      const { edicao } = calcularEdicao(formData.ano);
      
      // Só atualizar se a edição calculada for diferente da atual
      if (edicao && edicao !== formData.edicao) {
        setFormData((prev) => ({ ...prev, edicao }));
        console.log(`🔢 Edição calculada automaticamente: ${edicao} (ano: ${formData.ano})`);
      }
    }
  }, [formData.ano]);

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    setErro(""); // Limpar erro ao digitar
  };

  const validarFormulario = () => {
   
    if (!formData.nome.trim()) {
      setErro("Nome é obrigatório");
      return false;
    }

    if (!formData.resultadoAltura || parseFloat(formData.resultadoAltura) <= 0) {
      setErro("Resultado deve ser maior que zero");
      return false;
    }

    if (!formData.modeloMoto.trim()) {
      setErro("Modelo da moto é obrigatório");
      return false;
    }

    if (!formData.cidade.trim()) {
      setErro("Cidade é obrigatória");
      return false;
    }

    if (!formData.estado.trim() || formData.estado.length !== 2) {
      setErro("Estado deve ter 2 letras (ex: MG)");
      return false;
    }


    if (!anoEhValido(formData.ano)) {
      setErro("Ano inválido (deve ser entre 2017 e o ano atual)");
      return false;
    }

    if (!formData.edicao) {
      setErro("Erro ao calcular edição");
      return false;
    }

    return true;
  };

  const handleSalvar = async () => {
    try {
      if (!validarFormulario()) {
        return;
      }

      setLoading(true);
      setErro("");
      setSucesso("");

      const resultado = await criarCampeao(formData);

      if (resultado.sucesso) {
        console.log("✅ [ModalCriarCampeao] Campeão criado com sucesso");
        setSucesso(`🏆 ${formData.nome} foi registrado como campeão!`);

        // Aguardar 1.5s para mostrar mensagem de sucesso
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        throw new Error(resultado.erro || "Erro ao criar campeão");
      }
    } catch (error) {
      console.error("❌ [ModalCriarCampeao] Erro ao criar:", error);
      setErro(error.message || "Erro ao criar campeão");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (
      formData.nome ||
      formData.resultadoAltura ||
      formData.modeloMoto ||
      formData.cidade
    ) {
      if (!confirm("Deseja descartar as alterações?")) {
        return;
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-yellow-400/30">
        <div className="bg-gradient-to-r from-yellow-900 to-green-900 p-6 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="mr-3 text-yellow-400" size={28} />
              Adicionar Novo Campeão
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              Preencha todos os dados do campeão
            </p>
          </div>
          <button
            onClick={handleCancelar}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        <div className="px-6 pt-6">
          {erro && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4 flex items-center">
              <AlertCircle className="text-red-400 mr-3 flex-shrink-0" size={20} />
              <p className="text-red-400 text-sm">{erro}</p>
            </div>
          )}

          {sucesso && (
            <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 mb-4 flex items-center">
              <Trophy className="text-green-400 mr-3 flex-shrink-0" size={20} />
              <p className="text-green-400 text-sm">{sucesso}</p>
            </div>
          )}
        </div>

        {/* FORMULÁRIO */}
        <div className="p-6 space-y-6">
          {/* DADOS PRINCIPAIS */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nome */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <User className="mr-2" size={16} />
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                placeholder="Nome do campeão"
                disabled={loading}
              />
            </div>

            {/* Resultado */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <Target className="mr-2" size={16} />
                Resultado (metros) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.resultadoAltura}
                onChange={(e) => handleChange("resultadoAltura", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                placeholder="Ex: 45.5"
                disabled={loading}
              />
            </div>
          </div>

          {/* MOTO E CATEGORIA */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Modelo da Moto */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <Bike className="mr-2" size={16} />
                Modelo da Moto *
              </label>
              <input
                type="text"
                value={formData.modeloMoto}
                onChange={(e) => handleChange("modeloMoto", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                placeholder="Ex: Honda CRF 250"
                disabled={loading}
              />
            </div>

            {/* Categoria */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <Award className="mr-2" size={16} />
                Categoria *
              </label>
              <select
                value={formData.categoriaMoto}
                onChange={(e) => handleChange("categoriaMoto", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                disabled={loading}
              >
                <option value="nacional">🇧🇷 Nacional</option>
                <option value="importada">🌎 Importada</option>
              </select>
            </div>
          </div>

          {/* LOCALIZAÇÃO */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cidade */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <MapPin className="mr-2" size={16} />
                Cidade *
              </label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleChange("cidade", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                placeholder="Ex: Itamonte"
                disabled={loading}
              />
            </div>

            {/* Estado */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <MapPin className="mr-2" size={16} />
                Estado (UF) *
              </label>
              <input
                type="text"
                value={formData.estado}
                onChange={(e) =>
                  handleChange("estado", e.target.value.toUpperCase())
                }
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                placeholder="Ex: MG"
                maxLength={2}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Ano */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                <Calendar className="mr-2" size={16} />
                Ano *
              </label>
              <input
                type="number"
                value={formData.ano}
                onChange={(e) => handleChange("ano", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-400 focus:outline-none"
                placeholder="Ex: 2024"
                min="2017"
                max={new Date().getFullYear() + 1}
                disabled={loading}
              />
              <p className="text-gray-500 text-xs mt-1">
                Primeira edição: 2017
              </p>
            </div>
            {/* Edição (AUTO-CALCULADA) */}
            <div>
              <label className=" text-gray-400 text-sm mb-2 flex items-center">
                Edição 
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.edicao}
                  className="w-full bg-gray-700 text-yellow-400 font-semibold rounded-lg px-4 py-3 border border-yellow-500/30 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2"> 
                </div>
              </div>
              <p className="text-yellow-500 text-xs mt-1 flex items-center">
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-yellow-400/30 p-6 bg-gray-900/50">
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
                  Criar Campeão
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCriarCampeao;