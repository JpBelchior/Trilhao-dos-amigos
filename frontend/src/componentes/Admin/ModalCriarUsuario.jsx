import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  User,
  Bike,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  FileText,
  AlertTriangle,
  Loader2,
  UserPlus,
  Shirt,
} from "lucide-react";

// IMPORTAR COMPONENTES REUTILIZÁVEIS
import {
  InputTexto,
  InputSelect,
  InputTextarea,
  SeletorCategoriaMoto,
} from "../form";

const ModalCriarUsuario = ({ isOpen, onClose, onSuccess, operacaoLoading }) => {
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    estado: "",
    cidade: "",
    modeloMoto: "",
    categoriaMoto: "nacional",
    tamanhoCamiseta: "M",
    tipoCamiseta: "manga_curta",
    observacoes: "",
    camisetasExtras: [],
  });

  // Estado para camiseta extra sendo adicionada
  const [camisetaExtra, setCamisetaExtra] = useState({
    tamanho: "M",
    tipo: "manga_curta",
  });

  const [erro, setErro] = useState("");

  // Opções para selects
  const estadosOptions = [
    { value: "AC", label: "AC - Acre" },
    { value: "AL", label: "AL - Alagoas" },
    { value: "AP", label: "AP - Amapá" },
    { value: "AM", label: "AM - Amazonas" },
    { value: "BA", label: "BA - Bahia" },
    { value: "CE", label: "CE - Ceará" },
    { value: "DF", label: "DF - Distrito Federal" },
    { value: "ES", label: "ES - Espírito Santo" },
    { value: "GO", label: "GO - Goiás" },
    { value: "MA", label: "MA - Maranhão" },
    { value: "MT", label: "MT - Mato Grosso" },
    { value: "MS", label: "MS - Mato Grosso do Sul" },
    { value: "MG", label: "MG - Minas Gerais" },
    { value: "PA", label: "PA - Pará" },
    { value: "PB", label: "PB - Paraíba" },
    { value: "PR", label: "PR - Paraná" },
    { value: "PE", label: "PE - Pernambuco" },
    { value: "PI", label: "PI - Piauí" },
    { value: "RJ", label: "RJ - Rio de Janeiro" },
    { value: "RN", label: "RN - Rio Grande do Norte" },
    { value: "RS", label: "RS - Rio Grande do Sul" },
    { value: "RO", label: "RO - Rondônia" },
    { value: "RR", label: "RR - Roraima" },
    { value: "SC", label: "SC - Santa Catarina" },
    { value: "SP", label: "SP - São Paulo" },
    { value: "SE", label: "SE - Sergipe" },
    { value: "TO", label: "TO - Tocantins" },
  ];

  const tamanhosOptions = [
    { value: "PP", label: "PP" },
    { value: "P", label: "P" },
    { value: "M", label: "M" },
    { value: "G", label: "G" },
    { value: "GG", label: "GG" },
  ];

  const tiposOptions = [
    { value: "manga_curta", label: "Manga Curta" },
    { value: "manga_longa", label: "Manga Longa" },
  ];

  // Resetar form quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nome: "",
        email: "",
        cpf: "",
        telefone: "",
        estado: "",
        cidade: "",
        modeloMoto: "",
        categoriaMoto: "nacional",
        tamanhoCamiseta: "M",
        tipoCamiseta: "manga_curta",
        observacoes: "",
        camisetasExtras: [],
      });
      setCamisetaExtra({
        tamanho: "M",
        tipo: "manga_curta",
      });
      setErro("");
    }
  }, [isOpen]);

  // Atualizar campo do formulário
  const atualizarCampo = (campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    if (erro) setErro("");
  };

  // Atualizar camiseta extra
  const atualizarCamisetaExtra = (campo, valor) => {
    setCamisetaExtra((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // Adicionar camiseta extra
  const adicionarCamisetaExtra = () => {
    setFormData((prev) => ({
      ...prev,
      camisetasExtras: [...prev.camisetasExtras, { ...camisetaExtra }],
    }));

    setErro("");
  };

  // Remover camiseta extra
  const removerCamisetaExtra = (index) => {
    setFormData((prev) => ({
      ...prev,
      camisetasExtras: prev.camisetasExtras.filter((_, i) => i !== index),
    }));
  };

  // Calcular valor total
  const calcularValorTotal = () => {
    const valorBase = parseFloat(formData.valorInscricao) || 100;
    const valorExtras = formData.camisetasExtras.length * 50;
    return valorBase + valorExtras;
  };

  // Validar formulário
  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      setErro("Nome é obrigatório");
      return false;
    }
    if (!formData.email.trim()) {
      setErro("Email é obrigatório");
      return false;
    }
    if (!formData.cpf.trim()) {
      setErro("CPF é obrigatório");
      return false;
    }
    if (!formData.estado) {
      setErro("Estado é obrigatório");
      return false;
    }
    if (!formData.cidade.trim()) {
      setErro("Cidade é obrigatória");
      return false;
    }
    if (!formData.modeloMoto.trim()) {
      setErro("Modelo da moto é obrigatório");
      return false;
    }

    return true;
  };

  // Submeter formulário
  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      // Preparar dados no formato esperado pelo backend
      const dadosEnvio = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf.trim(),
        telefone: formData.telefone.trim(),
        estado: formData.estado,
        cidade: formData.cidade.trim(),
        modeloMoto: formData.modeloMoto.trim(),
        categoriaMoto: formData.categoriaMoto,
        tamanhoCamiseta: formData.tamanhoCamiseta,
        tipoCamiseta: formData.tipoCamiseta,
        observacoes: formData.observacoes.trim(),
        camisetasExtras: formData.camisetasExtras.map((extra) => ({
          tamanho: extra.tamanho,
          tipo: extra.tipo,
        })),
      };

      const resultado = await onSuccess(dadosEnvio);

      if (resultado && resultado.sucesso) {
        onClose();
      } else {
        setErro(resultado?.erro || "Erro desconhecido ao criar participante");
      }
    } catch (error) {
      console.error("Erro ao criar participante:", error);
      setErro(error.message || "Erro desconhecido");
    }
  };

  // Fechar modal
  const handleClose = () => {
    if (!operacaoLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-900/20 via-black to-green-900/20 backdrop-blur-lg rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-green-400/30">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-green-400/30">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <UserPlus className="mr-3 text-green-400" size={28} />
            Criar Novo Participante
          </h2>
          <button
            onClick={handleClose}
            disabled={operacaoLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="mx-6 mt-4 bg-red-900/30 border border-red-400/50 rounded-xl p-4 flex items-center">
            <AlertTriangle className="text-red-400 mr-3" size={20} />
            <span className="text-red-300">{erro}</span>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL */}
        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* COLUNA 1: DADOS PESSOAIS */}
            <div>
              <h3 className="text-xl font-bold text-white flex items-center mb-6">
                <User className="mr-3 text-blue-400" size={24} />
                Dados Pessoais
              </h3>

              <div className="space-y-6">
                <InputTexto
                  label="Nome Completo"
                  value={formData.nome}
                  onChange={(valor) => atualizarCampo("nome", valor)}
                  placeholder="Digite o nome completo"
                  disabled={operacaoLoading}
                  required
                  icon={User}
                  variant="admin"
                />

                <InputTexto
                  label="Email"
                  value={formData.email}
                  onChange={(valor) => atualizarCampo("email", valor)}
                  placeholder="exemplo@email.com"
                  disabled={operacaoLoading}
                  required
                  type="email"
                  icon={Mail}
                  variant="admin"
                />

                <InputTexto
                  label="CPF"
                  value={formData.cpf}
                  onChange={(valor) => atualizarCampo("cpf", valor)}
                  placeholder="000.000.000-00"
                  disabled={operacaoLoading}
                  required
                  icon={CreditCard}
                  variant="admin"
                  maxLength={14}
                />

                <InputTexto
                  label="Telefone"
                  value={formData.telefone}
                  onChange={(valor) => atualizarCampo("telefone", valor)}
                  placeholder="(00) 00000-0000"
                  disabled={operacaoLoading}
                  type="tel"
                  icon={Phone}
                  variant="admin"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputSelect
                    label="Estado"
                    value={formData.estado}
                    onChange={(valor) => atualizarCampo("estado", valor)}
                    options={estadosOptions}
                    disabled={operacaoLoading}
                    required
                    placeholder="Selecione o estado"
                    icon={MapPin}
                    variant="admin"
                  />

                  <InputTexto
                    label="Cidade"
                    value={formData.cidade}
                    onChange={(valor) => atualizarCampo("cidade", valor)}
                    placeholder="Digite a cidade"
                    disabled={operacaoLoading}
                    required
                    icon={MapPin}
                    variant="admin"
                  />
                </div>
              </div>
            </div>

            {/* COLUNA 2: DADOS DA MOTO E INSCRIÇÃO */}
            <div>
              <h3 className="text-xl font-bold text-white flex items-center mb-6">
                <Bike className="mr-3 text-yellow-400" size={24} />
                Moto e Inscrição
              </h3>

              <div className="space-y-6">
                <InputTexto
                  label="Modelo da Moto"
                  value={formData.modeloMoto}
                  onChange={(valor) => atualizarCampo("modeloMoto", valor)}
                  placeholder="Ex: Honda Bros 160, KTM 350 EXC-F"
                  disabled={operacaoLoading}
                  required
                  icon={Bike}
                  variant="admin"
                />

                <SeletorCategoriaMoto
                  value={formData.categoriaMoto}
                  onChange={(categoria) =>
                    atualizarCampo("categoriaMoto", categoria)
                  }
                  disabled={operacaoLoading}
                  size="medium"
                  labelClassName="block text-gray-300 mb-2 font-semibold"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputSelect
                    label="Tamanho da Camiseta"
                    value={formData.tamanhoCamiseta}
                    onChange={(valor) =>
                      atualizarCampo("tamanhoCamiseta", valor)
                    }
                    options={tamanhosOptions}
                    disabled={operacaoLoading}
                    variant="admin"
                  />

                  <InputSelect
                    label="Tipo da Camiseta"
                    value={formData.tipoCamiseta}
                    onChange={(valor) => atualizarCampo("tipoCamiseta", valor)}
                    options={tiposOptions}
                    disabled={operacaoLoading}
                    variant="admin"
                  />
                </div>

                {/* Seção de Camisetas Extras */}
                <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-400/30">
                  <h4 className="text-yellow-400 font-bold mb-3 flex items-center">
                    <Shirt className="mr-2" size={16} />
                    Camisetas Extras
                  </h4>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <InputSelect
                      label="Tamanho"
                      value={camisetaExtra.tamanho}
                      onChange={(valor) =>
                        atualizarCamisetaExtra("tamanho", valor)
                      }
                      options={tamanhosOptions}
                      disabled={operacaoLoading}
                      variant="admin"
                    />

                    <InputSelect
                      label="Tipo"
                      value={camisetaExtra.tipo}
                      onChange={(valor) =>
                        atualizarCamisetaExtra("tipo", valor)
                      }
                      options={tiposOptions}
                      disabled={operacaoLoading}
                      variant="admin"
                    />
                  </div>

                  <button
                    onClick={adicionarCamisetaExtra}
                    disabled={operacaoLoading}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
                  >
                    Adicionar Camiseta Extra
                  </button>

                  {/* Lista de camisetas extras */}
                  {formData.camisetasExtras.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h5 className="text-sm font-semibold text-yellow-300">
                        Camisetas Adicionadas:
                      </h5>
                      {formData.camisetasExtras.map((extra, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-black/30 rounded-lg p-3"
                        >
                          <span className="text-white text-sm">
                            {extra.tamanho} -{" "}
                            {extra.tipo === "manga_curta"
                              ? "Manga Curta"
                              : "Manga Longa"}
                          </span>
                          <div className="flex items-center space-x-3">
                            <span className="text-green-400 font-bold text-sm">
                              R$ 50,00
                            </span>
                            <button
                              onClick={() => removerCamisetaExtra(index)}
                              disabled={operacaoLoading}
                              className="text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Valor total */}
                      <div className="bg-green-900/30 rounded-lg p-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 font-bold">
                            Valor Total:
                          </span>
                          <span className="text-green-400 font-bold text-lg">
                            R$ {calcularValorTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <InputTextarea
                  label="Observações"
                  value={formData.observacoes}
                  onChange={(valor) => atualizarCampo("observacoes", valor)}
                  placeholder="Observações adicionais sobre o participante..."
                  disabled={operacaoLoading}
                  rows={3}
                  icon={FileText}
                  variant="admin"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ COM AÇÕES */}
        <div className="border-t border-green-400/30 p-6">
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClose}
              disabled={operacaoLoading}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={operacaoLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center disabled:opacity-50"
            >
              {operacaoLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={20} />
                  Criar Participante
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCriarUsuario;
