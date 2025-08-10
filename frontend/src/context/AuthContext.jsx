import React, { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();
// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
export const AuthProvider = ({ children }) => {
  // Estados do contexto
  const [gerente, setGerente] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  // Verificar se já está logado ao inicializar
  useEffect(() => {
    console.log("🔍 [AuthContext] Iniciando verificação de login...");
    verificarLoginExistente();
  }, []);
  const verificarLoginExistente = async () => {
    try {
      const tokenSalvo = localStorage.getItem("token");
      const gerenteSalvo = localStorage.getItem("gerente");
      console.log("🔍 [AuthContext] Verificando dados salvos:", {
        temToken: !!tokenSalvo,
        temGerente: !!gerenteSalvo,
      });

      if (tokenSalvo && gerenteSalvo) {
        console.log("🔍 [AuthContext] Validando token no backend...");

        // Verificar se o token ainda é válido no backend
        const response = await fetch(
          "http://localhost:8000/api/gerente/verificar-token",
          {
            headers: {
              Authorization: `Bearer ${tokenSalvo}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.sucesso) {
            setToken(tokenSalvo);
            setGerente(JSON.parse(gerenteSalvo));
            console.log(
              "✅ [AuthContext] Gerente já logado:",
              JSON.parse(gerenteSalvo).nome
            );
          } else {
            console.log("❌ [AuthContext] Token inválido no backend");
            limparDadosLogin();
          }
        } else {
          console.log("❌ [AuthContext] Token expirado ou inválido");
          limparDadosLogin();
        }
      } else {
        console.log("ℹ️ [AuthContext] Nenhum login salvo encontrado");
      }
    } catch (error) {
      console.error("❌ [AuthContext] Erro ao verificar login:", error);
      limparDadosLogin();
    } finally {
      setLoading(false);
      console.log("✅ [AuthContext] Verificação de login concluída");
    }
  };
  const limparDadosLogin = () => {
    console.log("🗑️ [AuthContext] Limpando dados de login...");
    localStorage.removeItem("token");
    localStorage.removeItem("gerente");
    setToken(null);
    setGerente(null);
  };
  const login = async (email, senha) => {
    try {
      console.log("🔐 [AuthContext] Iniciando login para:", email);
      const response = await fetch("http://localhost:8000/api/gerente/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || "Erro ao fazer login");
      }

      // Salvar dados no estado e localStorage
      setToken(data.dados.token);
      setGerente(data.dados.gerente);

      localStorage.setItem("token", data.dados.token);
      localStorage.setItem("gerente", JSON.stringify(data.dados.gerente));

      console.log(
        "✅ [AuthContext] Login realizado com sucesso para:",
        data.dados.gerente.nome
      );
      return { sucesso: true, dados: data.dados };
    } catch (error) {
      console.error("❌ [AuthContext] Erro no login:", error);
      return { sucesso: false, erro: error.message };
    }
  };

  const atualizarPerfil = async (dadosAtualizacao) => {
    try {
      console.log("🔄 [AuthContext] Atualizando perfil...", dadosAtualizacao);

      const response = await fetchAuth(
        "http://localhost:8000/api/gerente/perfil",
        {
          method: "PUT",
          body: JSON.stringify(dadosAtualizacao),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || "Erro ao atualizar perfil");
      }

      // ✅ Atualizar dados do gerente no estado e localStorage
      const gerenteAtualizado = data.dados.gerente;
      setGerente(gerenteAtualizado);
      localStorage.setItem("gerente", JSON.stringify(gerenteAtualizado));

      // ✅ NOVO: Verificar se há novo token (quando email é alterado)
      if (data.dados.novoToken) {
        console.log(
          "🔑 [AuthContext] Atualizando token devido alteração de email"
        );
        setToken(data.dados.novoToken);
        localStorage.setItem("token", data.dados.novoToken);
      }

      console.log(
        "✅ [AuthContext] Perfil atualizado com sucesso:",
        gerenteAtualizado.nome
      );

      return {
        sucesso: true,
        dados: data.dados,
        alteracoes: data.dados.alteracoes,
        novoToken: !!data.dados.novoToken, // Informar se token foi atualizado
      };
    } catch (error) {
      console.error("❌ [AuthContext] Erro ao atualizar perfil:", error);
      return { sucesso: false, erro: error.message };
    }
  };
  const logout = () => {
    console.log("👋 [AuthContext] Fazendo logout...");
    setToken(null);
    setGerente(null);

    localStorage.removeItem("token");
    localStorage.removeItem("gerente");

    console.log("✅ [AuthContext] Logout realizado");
  };
  const isLoggedIn = () => {
    const logado = !!(token && gerente);
    console.log("🔍 [AuthContext] Verificando se está logado:", logado);
    return logado;
  };
  const getAuthHeaders = () => {
    if (!token) {
      console.log("⚠️ [AuthContext] Tentativa de obter headers sem token");
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };
  // Função para fazer requisições autenticadas automaticamente
  const fetchAuth = async (url, options = {}) => {
    const authOptions = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    };
    try {
      console.log("🌐 [AuthContext] Fazendo requisição autenticada para:", url);
      const response = await fetch(url, authOptions);

      // Se retornar 401 (não autorizado), fazer logout automático
      if (response.status === 401) {
        console.warn(
          "🔒 [AuthContext] Token expirado, fazendo logout automático..."
        );
        logout();
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      return response;
    } catch (error) {
      console.error("❌ [AuthContext] Erro na requisição autenticada:", error);
      throw error;
    }
  };
  // Objeto com todos os valores e funções que serão disponibilizados
  const value = {
    // Estados
    gerente,
    token,
    loading,
    // Funções
    login,
    logout,
    isLoggedIn,
    getAuthHeaders,
    fetchAuth,
    atualizarPerfil,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
