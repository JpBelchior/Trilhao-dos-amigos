// frontend/src/componentes/Cadastro/DadosIniciais.jsx
import React from "react";
import { User, Bike } from "lucide-react";
import { InputTexto } from "../form";

// Lista de marcas de motos
const MARCAS_MOTO = [
  "Honda",
  "Yamaha",
  "Kawasaki",
  "Suzuki",
  "KTM",
  "Husqvarna",
  "GasGas",
  "Beta",
  "Triumph",
  "BMW",
  "Royal Enfield",
  "Shineray",
  "Outra"
];

const StepDadosIniciais = ({ formData, atualizarFormData, CategoriaMoto }) => {
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
    <div className="space-y-8">
      {/* SEÇÃO: DADOS PESSOAIS */}
      <div>
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          <User className="inline mr-3" size={32} />
          Dados Pessoais
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

      {/* DIVISOR */}
      <div className="border-t border-green-400/30 my-8"></div>

      {/* SEÇÃO: DADOS DA MOTO */}
      <div>
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          <Bike className="inline mr-3" size={32} />
          Dados da Moto
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* SELECT DE MARCA */}
          <div className="md:col-span-2">
            <label className="block text-white font-semibold mb-2">
              Marca da Moto <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.modeloMoto}
              onChange={(e) => atualizarFormData({ modeloMoto: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-green-400/30 focus:border-green-400 focus:outline-none transition-all"
              required
            >
              <option value="">Selecione a marca</option>
              {MARCAS_MOTO.map((marca) => (
                <option key={marca} value={marca}>
                  {marca}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORIA DA MOTO */}
          <div className="md:col-span-2">
            <label className="block text-white font-semibold mb-3">
              Categoria <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="categoria"
                  value={CategoriaMoto.NACIONAL}
                  checked={formData.categoriaMoto === CategoriaMoto.NACIONAL}
                  onChange={(e) =>
                    atualizarFormData({ categoriaMoto: e.target.value })
                  }
                  className="w-5 h-5 text-green-500 focus:ring-green-400"
                />
                <span className="ml-3 text-white font-medium">Nacional</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="categoria"
                  value={CategoriaMoto.IMPORTADA}
                  checked={formData.categoriaMoto === CategoriaMoto.IMPORTADA}
                  onChange={(e) =>
                    atualizarFormData({ categoriaMoto: e.target.value })
                  }
                  className="w-5 h-5 text-green-500 focus:ring-green-400"
                />
                <span className="ml-3 text-white font-medium">Importada</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepDadosIniciais;