// src/componentes/ApiStatus.jsx - Componente para verificar status da API
import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

const ApiStatus = () => {
  const [status, setStatus] = useState({
    api: "loading",
    database: "loading",
    mercadoPago: "loading",
    estoque: "loading",
  });

  const [detalhes, setDetalhes] = useState({});

  useEffect(() => {
    verificarStatus();
  }, []);

  const verificarStatus = async () => {
    try {
      // 1. Verificar API principal
      console.log("🔍 Verificando status da API...");

      const apiResponse = await fetch("http://localhost:8000/api");
      const apiData = await apiResponse.json();

      setStatus((prev) => ({
        ...prev,
        api: apiResponse.ok ? "success" : "error",
      }));

      // 2. Verificar banco de dados
      console.log("🔍 Verificando banco de dados...");

      const dbResponse = await fetch("http://localhost:8000/test-db");
      const dbData = await dbResponse.json();

      setStatus((prev) => ({
        ...prev,
        database: dbData.database === "Conectado" ? "success" : "error",
      }));

      // 3. Verificar estoque
      console.log("🔍 Verificando estoque...");

      const estoqueResponse = await fetch(
        "http://localhost:8000/api/estoque/resumo"
      );
      const estoqueData = await estoqueResponse.json();

      setStatus((prev) => ({
        ...prev,
        estoque: estoqueData.sucesso ? "success" : "error",
      }));

      setDetalhes((prev) => ({
        ...prev,
        estoque: estoqueData.dados,
      }));

      // 4. Verificar se o Mercado Pago está configurado (não fazemos requisição real)
      // Apenas verificamos se as variáveis estão definidas
      setStatus((prev) => ({
        ...prev,
        mercadoPago: "warning", // Assumimos que precisa ser configurado
      }));

      console.log("✅ Verificação de status concluída");
    } catch (error) {
      console.error("❌ Erro ao verificar status:", error);

      setStatus({
        api: "error",
        database: "error",
        mercadoPago: "error",
        estoque: "error",
      });
    }
  };

  const getStatusIcon = (statusType) => {
    switch (statusType) {
      case "success":
        return <CheckCircle className="text-green-500" size={20} />;
      case "warning":
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case "error":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Loader2 className="text-blue-500 animate-spin" size={20} />;
    }
  };

  const getStatusText = (statusType) => {
    switch (statusType) {
      case "success":
        return "Conectado";
      case "warning":
        return "Atenção";
      case "error":
        return "Erro";
      default:
        return "Verificando...";
    }
  };

  const getStatusColor = (statusType) => {
    switch (statusType) {
      case "success":
        return "border-green-400/30 bg-green-900/20";
      case "warning":
        return "border-yellow-400/30 bg-yellow-900/20";
      case "error":
        return "border-red-400/30 bg-red-900/20";
      default:
        return "border-blue-400/30 bg-blue-900/20";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-lg rounded-2xl border border-gray-600/30 p-6 max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Status do Sistema</h3>
          <button
            onClick={verificarStatus}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Loader2 size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {/* API Principal */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${getStatusColor(
              status.api
            )}`}
          >
            <div className="flex items-center">
              {getStatusIcon(status.api)}
              <span className="text-white ml-2 text-sm">API Principal</span>
            </div>
            <span className="text-xs text-gray-300">
              {getStatusText(status.api)}
            </span>
          </div>

          {/* Banco de Dados */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${getStatusColor(
              status.database
            )}`}
          >
            <div className="flex items-center">
              {getStatusIcon(status.database)}
              <span className="text-white ml-2 text-sm">Banco de Dados</span>
            </div>
            <span className="text-xs text-gray-300">
              {getStatusText(status.database)}
            </span>
          </div>

          {/* Estoque */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${getStatusColor(
              status.estoque
            )}`}
          >
            <div className="flex items-center">
              {getStatusIcon(status.estoque)}
              <span className="text-white ml-2 text-sm">Estoque</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-300">
                {getStatusText(status.estoque)}
              </div>
              {detalhes.estoque && (
                <div className="text-xs text-yellow-400">
                  {detalhes.estoque.totalDisponiveis} disponíveis
                </div>
              )}
            </div>
          </div>

          {/* Mercado Pago */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${getStatusColor(
              status.mercadoPago
            )}`}
          >
            <div className="flex items-center">
              {getStatusIcon(status.mercadoPago)}
              <span className="text-white ml-2 text-sm">Mercado Pago</span>
            </div>
            <span className="text-xs text-gray-300">Configurar</span>
          </div>
        </div>

        {/* Instruções rápidas */}
        {(status.api === "error" || status.database === "error") && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-400/30 rounded-xl">
            <p className="text-red-300 text-xs">
              ⚠️ Verifique se o backend está rodando na porta 8000
            </p>
          </div>
        )}

        {status.mercadoPago === "warning" && (
          <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-400/30 rounded-xl">
            <p className="text-yellow-300 text-xs">
              💡 Configure as credenciais do Mercado Pago no arquivo .env
            </p>
          </div>
        )}

        {Object.values(status).every((s) => s === "success") && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-400/30 rounded-xl">
            <p className="text-green-300 text-xs">✅ Sistema operacional</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiStatus;
