import React from "react";
import {
  ShoppingBag,
  User,
  Mail,
  Phone,
  CreditCard,
  Loader2,
  AlertCircle,
  Shirt,
} from "lucide-react";
import InputTexto from "../componentes/form/InputTexto";
import { SeletorCamisas } from "../componentes/form";
import { usePedidoCamisa } from "../hooks/usePedidoCamisa";

const ComprarCamisa = () => {
  const {
    dadosPessoais,
    camisas,
    camisaSelecionada,
    setCamisaSelecionada,
    loading,
    erro,
    valorTotal,
    precoCamisa,
    atualizarDadosPessoais,
    adicionarCamisa,
    removerCamisa,
    submeterPedido,
    getDisponibilidade,
    TamanhoCamiseta,
    TipoCamiseta,
  } = usePedidoCamisa();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-2xl">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Comprar <span className="text-yellow-400">Camisa</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Adquira a camisa oficial do Trilhão dos Amigos sem precisar se inscrever no evento.
          </p>
          <p className="text-green-400 font-bold mt-2">{precoCamisa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} por camisa — Retirada no evento</p>
        </div>

        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">

          {/* Dados Pessoais */}
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <User size={20} className="text-yellow-400" />
            Seus Dados
          </h2>

          <div className="space-y-4 mb-8">
            <InputTexto
              label="Nome Completo"
              value={dadosPessoais.nome}
              onChange={(v) => atualizarDadosPessoais("nome", v)}
              placeholder="Seu nome completo"
              required
            />
            <InputTexto
              label="CPF"
              value={dadosPessoais.cpf}
              onChange={(v) => atualizarDadosPessoais("cpf", v)}
              placeholder="000.000.000-00"
              required
              icon={CreditCard}
            />
            <InputTexto
              label="Email"
              value={dadosPessoais.email}
              onChange={(v) => atualizarDadosPessoais("email", v)}
              placeholder="seu@email.com"
              type="email"
              required
              icon={Mail}
            />
            <InputTexto
              label="Telefone"
              value={dadosPessoais.telefone}
              onChange={(v) => atualizarDadosPessoais("telefone", v)}
              placeholder="(00) 00000-0000"
              required
              icon={Phone}
            />
          </div>

          {/* Seletor de Camisas */}
          <div className="bg-yellow-900/30 rounded-2xl p-6 border-2 border-yellow-400/50 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                <Shirt size={24} />
                Escolha as Camisas
              </h2>
              <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                {precoCamisa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} cada
              </span>
            </div>

            <p className="text-gray-300 mb-4 text-sm">
              Selecione o tipo e tamanho e clique em adicionar. Pode repetir quantas quiser.
            </p>

            <SeletorCamisas
              camisas={camisas}
              camisaSelecionada={camisaSelecionada}
              setCamisaSelecionada={setCamisaSelecionada}
              adicionarCamisa={adicionarCamisa}
              removerCamisa={removerCamisa}
              getDisponibilidade={getDisponibilidade}
              TamanhoCamiseta={TamanhoCamiseta}
              TipoCamiseta={TipoCamiseta}
              precoCamisa={precoCamisa}
            />
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-900/30 border border-red-400/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-300 text-sm">{erro}</p>
            </div>
          )}

          {/* Resumo */}
          <div className="border-t border-gray-700 pt-5 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-lg">
                Total ({camisas.length} camisa{camisas.length !== 1 ? "s" : ""})
              </span>
              <span className="text-green-400 font-black text-2xl">
                R$ {valorTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={submeterPedido}
            disabled={loading.submetendo || loading.estoque}
            className={`w-full font-bold py-4 rounded-xl text-lg transition-all flex items-center justify-center ${
              loading.submetendo || loading.estoque
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-400 text-black"
            }`}
          >
            {loading.submetendo ? (
              <>
                <Loader2 className="animate-spin mr-2" size={22} />
                Processando...
              </>
            ) : (
              <>
                <ShoppingBag className="mr-2" size={22} />
                Ir para Pagamento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComprarCamisa;
