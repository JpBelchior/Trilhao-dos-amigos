import React, { useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  Bike,
  CreditCard,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import ExpandToggleButton from "../ExpandToggleButton";

const FiltrosAdminParticipantes = ({
  filtros,
  atualizarFiltro,
  limparFiltros,
  totalEncontrados,
  estatisticas,
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Verificar se há filtros ativos
  const temFiltrosAtivos = Object.values(filtros).some(
    (valor) => valor !== "" && valor !== "todos"
  );

  return (
    <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30 mb-8">
      {/* CABEÇALHO - IGUAL AO /INSCRITOS */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h3 className="text-xl font-bold text-white">Filtros de Busca</h3>
          {temFiltrosAtivos && (
            <span className="ml-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
              ATIVO
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* ESTATÍSTICAS ADMIN (MELHORADAS) */}
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <span className="text-gray-400">
              <span className="text-white font-bold">{totalEncontrados}</span>{" "}
              encontrados
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-green-400 font-bold">
              {estatisticas.confirmados} confirmados
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-yellow-400 font-bold">
              {estatisticas.pendentes} pendentes
            </span>
            {estatisticas.cancelados > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-red-400 font-bold">
                  {estatisticas.cancelados} cancelados
                </span>
              </>
            )}
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex items-center space-x-2">
            {temFiltrosAtivos && (
              <button
                onClick={limparFiltros}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-xl transition-all flex items-center text-sm"
              >
                <RotateCcw className="mr-1" size={14} />
                Limpar
              </button>
            )}

            <ExpandToggleButton
              isExpanded={mostrarFiltros}
              onToggle={() => setMostrarFiltros(!mostrarFiltros)}
              label="Filtros"
              icon={Filter}
              variant="yellow"
              size="medium"
            />
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS MÓVEIS */}
      <div className="md:hidden mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-900/30 rounded-xl p-2">
          <div className="text-green-400 font-bold">
            {estatisticas.confirmados}
          </div>
          <div className="text-gray-400 text-xs">Confirmados</div>
        </div>
        <div className="bg-yellow-900/30 rounded-xl p-2">
          <div className="text-yellow-400 font-bold">
            {estatisticas.pendentes}
          </div>
          <div className="text-gray-400 text-xs">Pendentes</div>
        </div>
        <div className="bg-red-900/30 rounded-xl p-2">
          <div className="text-red-400 font-bold">
            {estatisticas.cancelados}
          </div>
          <div className="text-gray-400 text-xs">Cancelados</div>
        </div>
      </div>

      {/* FILTROS - EXATAMENTE COMO EM /INSCRITOS + STATUS PAGAMENTO */}
      {mostrarFiltros && (
        <div className="grid md:grid-cols-4 gap-4">
          {/* Buscar por Nome - IGUAL AO /INSCRITOS */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Buscar por Nome
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={filtros.nome}
                onChange={(e) => atualizarFiltro("nome", e.target.value)}
                className="w-full bg-black/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:border-green-400 focus:outline-none"
                placeholder="Digite o nome do piloto..."
              />
            </div>
          </div>

          {/* Buscar por Cidade - IGUAL AO /INSCRITOS */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Buscar por Cidade
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={filtros.cidade}
                onChange={(e) => atualizarFiltro("cidade", e.target.value)}
                className="w-full bg-black/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:border-green-400 focus:outline-none"
                placeholder="Digite o nome da cidade..."
              />
            </div>
          </div>

          {/* Categoria da Moto - IGUAL AO /INSCRITOS */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Categoria da Moto
            </label>
            <div className="relative">
              <Bike className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={filtros.categoriaMoto}
                onChange={(e) =>
                  atualizarFiltro("categoriaMoto", e.target.value)
                }
                className="w-full bg-black/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:border-green-400 focus:outline-none appearance-none"
              >
                <option value="todos">Todas as categorias</option>
                <option value="nacional">🇧🇷 Motos Nacionais</option>
                <option value="importada">🌍 Motos Importadas</option>
              </select>
            </div>
          </div>

          {/* Status de Pagamento - ÚNICO FILTRO NOVO */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Status do Pagamento
            </label>
            <div className="relative">
              <CreditCard
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <select
                value={filtros.statusPagamento}
                onChange={(e) =>
                  atualizarFiltro("statusPagamento", e.target.value)
                }
                className="w-full bg-black/50 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:border-green-400 focus:outline-none appearance-none"
              >
                <option value="todos">Todos os status</option>
                <option value="confirmado">✅ Confirmados</option>
                <option value="pendente">⏳ Pendentes</option>
                <option value="cancelado">❌ Cancelados</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* RESUMO DOS FILTROS ATIVOS - IGUAL AO /INSCRITOS */}
      {mostrarFiltros && temFiltrosAtivos && (
        <div className="mt-4 text-center">
          <button
            onClick={limparFiltros}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-xl transition-all"
          >
            🗑️ Limpar Todos os Filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltrosAdminParticipantes;
