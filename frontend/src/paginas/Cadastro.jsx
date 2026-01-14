// frontend/src/paginas/Cadastro.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Loader2 } from "lucide-react";

// Importar hook customizado
import useCadastro from "../hooks/UseCadastro";

// Importar componentes dos steps
import StepDadosIniciais from "../componentes/Cadastro/DadosIniciais";
import StepCamisetas from "../componentes/Cadastro/Camisetas";

const Cadastro = () => {
  const navigate = useNavigate();

  // Usar hook customizado
  const {
    loading,
    step,
    formData,
    camisetaExtra,
    setCamisetaExtra,
    atualizarFormData,
    calcularValorTotal,
    verificarDisponibilidade,
    adicionarCamisetaExtra,
    removerCamisetaExtra,
    submeterInscricao,
    validarStep,
    proximoStep,
    stepAnterior,
    TamanhoCamiseta,
    TipoCamiseta,
    CategoriaMoto,
  } = useCadastro();

  //  Finalizar cadastro (cria participante pendente)
  const finalizarCadastro = async () => {
    console.log("🎯 Finalizando cadastro - criando participante pendente...");

    const resultado = await submeterInscricao();

    if (resultado.sucesso) {
      console.log(
        "✅ Participante criado como PENDENTE, redirecionando para pagamento"
      );

      // Redirecionar para página de pagamento com os dados do participante criado
      navigate("/pagamento", {
        state: {
          dadosInscricao: resultado.dados, // Dados do participante já criado no banco
          valorTotal: calcularValorTotal(),
        },
      });
    } else {
      alert(resultado.erro);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            INSCREVA-SE NO <span className="text-yellow-400">TRILHÃO</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400 mx-auto"></div>
        </div>

        {/* Progress Bar - AJUSTADO PARA 2 STEPS */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-center items-center gap-8">
            {[1, 2].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    step >= stepNum
                      ? "bg-green-500 text-black"
                      : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 2 && (
                  <div
                    className={`w-32 h-1 mx-4 ${
                      step > stepNum ? "bg-green-500" : "bg-gray-600"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-32 mt-4 text-sm text-gray-400">
            <span className="text-center">Informações Gerais</span>
            <span className="text-center">Escolha de Camisetas</span>
          </div>
        </div>

        {/* Formulário */}
        <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
          {/* Renderizar step atual */}
          {step === 1 && (
            <StepDadosIniciais
              formData={formData}
              atualizarFormData={atualizarFormData}
              CategoriaMoto={CategoriaMoto}
            />
          )}

          {step === 2 && (
            <StepCamisetas
              formData={formData}
              atualizarFormData={atualizarFormData}
              camisetaExtra={camisetaExtra}
              setCamisetaExtra={setCamisetaExtra}
              verificarDisponibilidade={verificarDisponibilidade}
              adicionarCamisetaExtra={adicionarCamisetaExtra}
              removerCamisetaExtra={removerCamisetaExtra}
              TamanhoCamiseta={TamanhoCamiseta}
              TipoCamiseta={TipoCamiseta}
            />
          )}

          {/* Navegação */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={stepAnterior}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Voltar
              </button>
            )}

            {step < 2 ? (
              <button
                onClick={proximoStep}
                disabled={!validarStep(step)}
                className={`ml-auto font-bold py-3 px-6 rounded-xl transition-all ${
                  validarStep(step)
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                Próximo
              </button>
            ) : (
              <div className="ml-auto space-y-4">
                {/* Resumo do Valor */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    Valor Total:{" "}
                    <span className="text-green-400">
                      R$ {calcularValorTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Inclui: Inscrição + {1 + formData.camisetasExtras.length}{" "}
                    camiseta(s)
                  </div>
                </div>

                {/* Botão Finalizar */}
                <button
                  onClick={finalizarCadastro}
                  disabled={loading || !validarStep(step)}
                  className={`font-bold py-4 px-8 rounded-xl transition-all flex items-center ${
                    loading || !validarStep(step)
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white transform hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Criando Inscrição...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2" size={20} />
                      Finalizar e Ir para Pagamento
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;