const API_BASE_URL = "/api";

// ============================================
// 🔧 UTILITÁRIOS INTERNOS
// ============================================

/**
 * Função auxiliar para fazer requisições HTTP
 * Centraliza tratamento de erro e parsing de JSON
 */
const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    // Se a resposta não for OK (status 200-299), lançar erro
    if (!response.ok) {
      throw new Error(data.erro || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    // Re-lançar erro para ser capturado pelo hook
    throw error;
  }
};

/**
 * Formatar endpoint (adiciona / se necessário)
 */
const formatEndpoint = (endpoint) => {
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
};

// ============================================
// 📡 CLIENTE PÚBLICO (sem autenticação)
// ============================================


const apiClient = {
  /**
   * GET request
   * @param {string} endpoint - Endpoint da API (ex: "/participantes")
   * @returns {Promise<Object>} Dados da resposta
   */
  async get(endpoint) {
    const formattedEndpoint = formatEndpoint(endpoint);
    console.log(`🌐 [API] GET ${formattedEndpoint}`);

    try {
      const data = await makeRequest(`${API_BASE_URL}${formattedEndpoint}`);
      console.log(`✅ [API] GET ${formattedEndpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API] GET ${formattedEndpoint} - Erro:`, error.message);
      throw error;
    }
  },

  /**
   * POST request
   * @param {string} endpoint - Endpoint da API
   * @param {Object} body - Dados a enviar
   * @returns {Promise<Object>} Dados da resposta
   */
  async post(endpoint, body) {
    const formattedEndpoint = formatEndpoint(endpoint);
    console.log(`🌐 [API] POST ${formattedEndpoint}`);

    try {
      const data = await makeRequest(`${API_BASE_URL}${formattedEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      console.log(`✅ [API] POST ${formattedEndpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API] POST ${formattedEndpoint} - Erro:`, error.message);
      throw error;
    }
  },

  /**
   * PUT request
   * @param {string} endpoint - Endpoint da API
   * @param {Object} body - Dados a enviar
   * @returns {Promise<Object>} Dados da resposta
   */
  async put(endpoint, body) {
    const formattedEndpoint = formatEndpoint(endpoint);
    console.log(`🌐 [API] PUT ${formattedEndpoint}`);

    try {
      const data = await makeRequest(`${API_BASE_URL}${formattedEndpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      console.log(`✅ [API] PUT ${formattedEndpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API] PUT ${formattedEndpoint} - Erro:`, error.message);
      throw error;
    }
  },

  /**
   * DELETE request
   * @param {string} endpoint - Endpoint da API
   * @returns {Promise<Object>} Dados da resposta
   */
  async delete(endpoint) {
    const formattedEndpoint = formatEndpoint(endpoint);
    console.log(`🌐 [API] DELETE ${formattedEndpoint}`);

    try {
      const data = await makeRequest(`${API_BASE_URL}${formattedEndpoint}`, {
        method: "DELETE",
      });
      console.log(`✅ [API] DELETE ${formattedEndpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API] DELETE ${formattedEndpoint} - Erro:`, error.message);
      throw error;
    }
  },
};

// ============================================
// 🔐 FACTORY DE CLIENTE AUTENTICADO
// ============================================

/**
 * 
 * @param {string} token - Token JWT do usuário logado
 * @returns {Object} Cliente HTTP autenticado
 */
 const createAuthApiClient = (token) => {
  if (!token) {
    console.warn("⚠️ [API-AUTH] Token não fornecido ao criar cliente autenticado");
  }

  return {
    /**
     * GET autenticado
     * @param {string} endpoint - Endpoint da API
     * @returns {Promise<Object>} Dados da resposta
     */
    async get(endpoint) {
      const formattedEndpoint = formatEndpoint(endpoint);
      console.log(`🔐 [API-AUTH] GET ${formattedEndpoint}`);

      try {
        const data = await makeRequest(`${API_BASE_URL}${formattedEndpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log(`✅ [API-AUTH] GET ${formattedEndpoint} - Sucesso`);
        return data;
      } catch (error) {
        console.error(`❌ [API-AUTH] GET ${formattedEndpoint} - Erro:`, error.message);
        throw error;
      }
    },

    /**
     * POST autenticado
     * @param {string} endpoint - Endpoint da API
     * @param {Object|FormData} body - Dados a enviar (JSON ou FormData)
     * @returns {Promise<Object>} Dados da resposta
     */
    async post(endpoint, body) {
      const formattedEndpoint = formatEndpoint(endpoint);
      console.log(`🔐 [API-AUTH] POST ${formattedEndpoint}`);

      // Detectar se é FormData (para uploads)
      const isFormData = body instanceof FormData;

      try {
        const data = await makeRequest(`${API_BASE_URL}${formattedEndpoint}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Não adicionar Content-Type para FormData (browser define automaticamente)
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
          },
          body: isFormData ? body : JSON.stringify(body),
        });
        console.log(`✅ [API-AUTH] POST ${formattedEndpoint} - Sucesso`);
        return data;
      } catch (error) {
        console.error(`❌ [API-AUTH] POST ${formattedEndpoint} - Erro:`, error.message);
        throw error;
      }
    },

    /**
     * PUT autenticado
     * @param {string} endpoint - Endpoint da API
     * @param {Object|FormData} body - Dados a enviar (JSON ou FormData)
     * @returns {Promise<Object>} Dados da resposta
     */
    async put(endpoint, body) {
      const formattedEndpoint = formatEndpoint(endpoint);
      console.log(`🔐 [API-AUTH] PUT ${formattedEndpoint}`);

      const isFormData = body instanceof FormData;

      try {
        const data = await makeRequest(`${API_BASE_URL}${formattedEndpoint}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
          },
          body: isFormData ? body : JSON.stringify(body),
        });
        console.log(`✅ [API-AUTH] PUT ${formattedEndpoint} - Sucesso`);
        return data;
      } catch (error) {
        console.error(`❌ [API-AUTH] PUT ${formattedEndpoint} - Erro:`, error.message);
        throw error;
      }
    },

    /**
     * DELETE autenticado
     * @param {string} endpoint - Endpoint da API
     * @returns {Promise<Object>} Dados da resposta
     */
    async delete(endpoint) {
      const formattedEndpoint = formatEndpoint(endpoint);
      console.log(`🔐 [API-AUTH] DELETE ${formattedEndpoint}`);

      try {
        const data = await makeRequest(`${API_BASE_URL}${formattedEndpoint}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log(`✅ [API-AUTH] DELETE ${formattedEndpoint} - Sucesso`);
        return data;
      } catch (error) {
        console.error(`❌ [API-AUTH] DELETE ${formattedEndpoint} - Erro:`, error.message);
        throw error;
      }
    },
  };
};

// ============================================
// 📤 EXPORTS
// ============================================

export default apiClient;

export { apiClient, createAuthApiClient };