import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, CreditCard, ArrowLeft } from "lucide-react";

const PagamentoConfirmado = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dados vindos da tela de pagamento
  const { dadosParticipante, valorTotal, numeroPagamento } = location.state || {};

  // Se não tem dados, redireciona pro cadastro
  if (!dadosParticipante) {
    navigate("/cadastro", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 flex items-center justify-center p-6">
      <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 max-w-2xl w-full">
        
        {/* Ícone de sucesso */}
        <div className="text-center mb-6">
          <CheckCircle2 className="text-green-400 mx-auto mb-4" size={80} />
          <h2 className="text-4xl font-bold text-white mb-2">
            Pagamento Confirmado! 🎉
          </h2>
          <p className="text-green-400 font-semibold text-lg">
            Sua inscrição foi aprovada com sucesso!
          </p>
        </div>

        {/* Dados do Participante */}
        <div className="bg-green-900/20 rounded-2xl p-6 border border-green-400/30 mb-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
            <CreditCard className="mr-2" size={24} />
            Dados da Inscrição
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Número de Inscrição:</span>
              <span className="text-white font-bold text-lg">
                {dadosParticipante.numeroInscricao}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Nome:</span>
              <span className="text-white font-semibold">
                {dadosParticipante.nome}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Valor Pago:</span>
              <span className="text-green-400 font-bold text-xl">
                R$ {valorTotal?.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Cidade/Estado:</span>
              <span className="text-white font-semibold">
                {dadosParticipante.cidade} - {dadosParticipante.estado}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Modelo da Moto:</span>
              <span className="text-white font-semibold">
                {dadosParticipante.modeloMoto}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Tipo:</span>
              <span className={`font-bold ${
                dadosParticipante.categoriaMoto === 'nacional' 
                  ? 'text-green-400' 
                  : 'text-yellow-400'
              }`}>
                {dadosParticipante.categoriaMoto === 'nacional' ? 'Nacional' : 'Importada'}
              </span>
            </div>
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="bg-yellow-900/20 rounded-2xl p-4 border border-yellow-400/30 mb-6">
          <h4 className="text-yellow-400 font-bold mb-2">📋 Próximos Passos:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>✅ Pagamento confirmado</li>
            <li>✅ Inscrição registrada</li>
            <li>✅ Camiseta reservada</li>
          </ul>
        </div>

        {/* Botão Voltar */}
        <button
          onClick={() => navigate("/", { replace: true })}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
        >
          <ArrowLeft className="mr-2" size={20} />
          Voltar para Página Inicial
        </button>
      </div>
    </div>
  );
};

export default PagamentoConfirmado;