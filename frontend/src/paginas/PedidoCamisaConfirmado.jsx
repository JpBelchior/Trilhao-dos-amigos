import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, ShoppingBag, Home } from "lucide-react";
import { TipoCamisetaLabel } from "../constants";

const PedidoCamisaConfirmado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pedido, numeroPagamento } = location.state || {};

  if (!pedido) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 flex items-center justify-center p-6">
      <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30 max-w-2xl w-full">

        <div className="text-center mb-6">
          <CheckCircle2 className="text-green-400 mx-auto mb-4" size={80} />
          <h2 className="text-4xl font-bold text-white mb-2">Pedido Confirmado! 🎉</h2>
          <p className="text-green-400 font-semibold text-lg">
            Seu pagamento foi aprovado com sucesso!
          </p>
        </div>

        <div className="bg-green-900/20 rounded-2xl p-6 border border-green-400/30 mb-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
            <ShoppingBag className="mr-2" size={24} />
            Detalhes do Pedido
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Nome:</span>
              <span className="text-white font-bold">{pedido.nome}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Email:</span>
              <span className="text-white">{pedido.email}</span>
            </div>
            {(pedido.itens || []).map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">
                  Camisa {pedido.itens.length > 1 ? i + 1 : ""}:
                </span>
                <span className="text-white font-bold">
                  {item.tamanho} — {TipoCamisetaLabel[item.tipo]} × {item.quantidade}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Valor pago:</span>
              <span className="text-green-400 font-black text-xl">
                R$ {Number(pedido.valorTotal)?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900/20 rounded-2xl p-5 border border-yellow-400/30 mb-6">
          <h4 className="text-yellow-400 font-bold mb-2">📍 Retirada</h4>
          <p className="text-gray-300 text-sm">
            Sua camisa será entregue no dia do evento.
            Apresente este número de pedido na retirada:{" "}
            <span className="text-yellow-400 font-bold">
              {numeroPagamento || pedido.id}
            </span>
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center text-lg"
        >
          <Home className="mr-2" size={20} />
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default PedidoCamisaConfirmado;
