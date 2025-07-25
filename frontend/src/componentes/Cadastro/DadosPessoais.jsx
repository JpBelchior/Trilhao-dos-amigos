// src/componentes/cadastro/StepDadosPessoais.jsx
import React from "react";
import { User } from "lucide-react";

const StepDadosPessoais = ({ formData, atualizarFormData }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        <User className="inline mr-3" size={32} />
        Seus Dados
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 mb-2">Nome Completo *</label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => atualizarFormData({ nome: e.target.value })}
            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">CPF *</label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) => atualizarFormData({ cpf: e.target.value })}
            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
            placeholder="000.000.000-00"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => atualizarFormData({ email: e.target.value })}
            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Telefone *</label>
          <input
            type="tel"
            value={formData.telefone}
            onChange={(e) => atualizarFormData({ telefone: e.target.value })}
            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
            placeholder="(35) 99999-9999"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-300 mb-2">Cidade *</label>
          <input
            type="text"
            value={formData.cidade}
            onChange={(e) => atualizarFormData({ cidade: e.target.value })}
            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
            placeholder="Sua cidade"
          />
        </div>
      </div>
    </div>
  );
};

export default StepDadosPessoais;
