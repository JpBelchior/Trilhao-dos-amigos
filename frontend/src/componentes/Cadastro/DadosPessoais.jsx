// frontend/src/componentes/Cadastro/DadosPessoais.jsx
import React from "react";
import { User } from "lucide-react";
import { InputTexto } from "../form";

const StepDadosPessoais = ({ formData, atualizarFormData }) => {
  // Função para formatar CPF
  const formatarCPF = (valor) => {
    const numeros = valor.replace(/\D/g, "");
    return numeros
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  // Função para formatar telefone
  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 10) {
      return numeros
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return numeros
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        <User className="inline mr-3" size={32} />
        Seus Dados
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <InputTexto
          label="Nome Completo"
          value={formData.nome}
          onChange={(valor) => atualizarFormData({ nome: valor })}
          placeholder="Seu nome completo"
          required
        />

        <InputTexto
          label="CPF"
          value={formData.cpf}
          onChange={(valor) => atualizarFormData({ cpf: formatarCPF(valor) })}
          placeholder="000.000.000-00"
          maxLength={14}
          required
        />

        <InputTexto
          label="Email"
          type="email"
          value={formData.email}
          onChange={(valor) =>
            atualizarFormData({ email: valor.toLowerCase() })
          }
          placeholder="seu@email.com"
          required
        />

        <InputTexto
          label="Telefone"
          type="tel"
          value={formData.telefone}
          onChange={(valor) =>
            atualizarFormData({ telefone: formatarTelefone(valor) })
          }
          placeholder="(11) 99999-9999"
          maxLength={15}
          required
        />

        <InputTexto
          label="Cidade"
          value={formData.cidade}
          onChange={(valor) => atualizarFormData({ cidade: valor })}
          placeholder="Sua cidade"
          required
        />

        <InputTexto
          label="Estado"
          value={formData.estado}
          onChange={(valor) =>
            atualizarFormData({ estado: valor.toUpperCase() })
          }
          placeholder="SP"
          maxLength={2}
          required
        />
      </div>
    </div>
  );
};

export default StepDadosPessoais;
