import React, { useEffect, useState } from "react";
import axios from "axios";
import { User } from "lucide-react";

const StepDadosPessoais = ({ formData, atualizarFormData }) => {
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

  const API_BASE = "http://localhost:8000/api/localizacao";

  // Carregar estados ao iniciar
  useEffect(() => {
    axios
      .get(`${API_BASE}/estados`)
      .then((res) => setEstados(res.data.dados.estados))
      .catch((err) => console.error("Erro ao carregar estados:", err));
  }, []);

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    if (formData.estado) {
      axios
        .get(`${API_BASE}/cidades/${formData.estado}`)
        .then((res) => setCidades(res.data.dados.cidades))
        .catch((err) => console.error("Erro ao carregar cidades:", err));
    } else {
      setCidades([]);
    }
  }, [formData.estado]);

  const formatarCPF = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return apenasNumeros
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2");
  };

  const formatarTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length <= 10) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return apenasNumeros
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
        {/* Nome */}
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

        {/* CPF */}
        <div>
          <label className="block text-gray-300 mb-2">CPF *</label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) =>
              atualizarFormData({ cpf: formatarCPF(e.target.value) })
            }
            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-300 mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              atualizarFormData({ email: e.target.value.toLowerCase() })
            }
            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
            placeholder="seu@email.com"
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-gray-300 mb-2">Telefone *</label>
          <input
            type="tel"
            value={formData.telefone}
            onChange={(e) =>
              atualizarFormData({ telefone: formatarTelefone(e.target.value) })
            }
            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
            placeholder="(35) 99999-9999"
            maxLength={15}
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-gray-300 mb-2">Estado *</label>
          <select
            value={formData.estado}
            onChange={(e) =>
              atualizarFormData({ estado: e.target.value, cidade: "" })
            }
            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
          >
            <option value="">Selecione seu estado</option>
            {estados.map((estado) => (
              <option key={estado.sigla} value={estado.sigla}>
                {estado.nome} ({estado.sigla})
              </option>
            ))}
          </select>
        </div>

        {/* Cidade */}
        <div>
          <label className="block text-gray-300 mb-2">Cidade *</label>
          <select
            value={formData.cidade}
            onChange={(e) => atualizarFormData({ cidade: e.target.value })}
            disabled={!formData.estado}
            className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none"
          >
            <option value="">Selecione sua cidade</option>
            {cidades.map((cidade) => (
              <option key={cidade} value={cidade}>
                {cidade}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default StepDadosPessoais;
