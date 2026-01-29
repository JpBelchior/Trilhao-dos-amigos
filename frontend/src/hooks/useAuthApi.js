// frontend/src/hooks/useAuthApi.js
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { createAuthApiClient } from "../services/api";

/**
 * 🔐 Hook customizado para requisições autenticadas
 * 
 * Integra o AuthContext com o apiClient centralizado.
 * Retorna um cliente HTTP autenticado que usa o token do contexto.
 * 
 * IMPORTANTE: Só use este hook em componentes que precisam de autenticação!
 * Para requisições públicas, use `apiClient` direto.
 * 
 * Exemplo de uso:
 * ```js
 * import { useAuthApi } from "../hooks/useAuthApi";
 * 
 * const MeuComponente = () => {
 *   const authApi = useAuthApi();
 *   
 *   const carregarDados = async () => {
 *     const data = await authApi.get("/participantes");
 *   };
 * };
 * ```
 * 
 * @returns {Object} Cliente HTTP autenticado com métodos get, post, put, delete
 */
export const useAuthApi = () => {
  const { token } = useAuth();

  // Usar useMemo para não recriar o cliente a cada render
  // Só recria quando o token mudar
  const authApi = useMemo(() => {
    if (!token) {
      console.warn("⚠️ [useAuthApi] Token não disponível");
      return null;
    }

    return createAuthApiClient(token);
  }, [token]);

  return authApi;
};

export default useAuthApi;