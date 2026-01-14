const API_BASE_URL = "http://localhost:8000/api";

/**
 * Cliente base para requisições HTTP
 */
export const apiClient = {
  /**
   * GET request
   */
  async get(endpoint) {
    try {
      console.log(`🌐 [API] GET ${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || `HTTP ${response.status}`);
      }

      console.log(`✅ [API] GET ${endpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API] GET ${endpoint} - Erro:`, error);
      throw error;
    }
  },

  /**
   * POST request
   */
  async post(endpoint, body) {
    try {
      console.log(`🌐 [API] POST ${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || `HTTP ${response.status}`);
      }

      console.log(`✅ [API] POST ${endpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API] POST ${endpoint} - Erro:`, error);
      throw error;
    }
  },

  /**
   * PUT request
   */
  async put(endpoint, body) {
    try {
      console.log(`🌐 [API] PUT ${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || `HTTP ${response.status}`);
      }

      console.log(`✅ [API] PUT ${endpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API] PUT ${endpoint} - Erro:`, error);
      throw error;
    }
  },

  /**
   * DELETE request
   */
  async delete(endpoint) {
    try {
      console.log(`🌐 [API] DELETE ${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || `HTTP ${response.status}`);
      }

      console.log(`✅ [API] DELETE ${endpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API] DELETE ${endpoint} - Erro:`, error);
      throw error;
    }
  },
};

/**
 * Cliente para requisições autenticadas
 * Usa o token do AuthContext
 */
export const createAuthApiClient = (token) => ({
  /**
   * GET autenticado
   */
  async get(endpoint) {
    try {
      console.log(`🔐 [API-AUTH] GET ${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || `HTTP ${response.status}`);
      }

      console.log(`✅ [API-AUTH] GET ${endpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API-AUTH] GET ${endpoint} - Erro:`, error);
      throw error;
    }
  },

  /**
   * POST autenticado
   */
  async post(endpoint, body) {
    try {
      console.log(`🔐 [API-AUTH] POST ${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || `HTTP ${response.status}`);
      }

      console.log(`✅ [API-AUTH] POST ${endpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API-AUTH] POST ${endpoint} - Erro:`, error);
      throw error;
    }
  },

  /**
   * PUT autenticado
   */
  async put(endpoint, body) {
    try {
      console.log(`🔐 [API-AUTH] PUT ${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || `HTTP ${response.status}`);
      }

      console.log(`✅ [API-AUTH] PUT ${endpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API-AUTH] PUT ${endpoint} - Erro:`, error);
      throw error;
    }
  },

  /**
   * DELETE autenticado
   */
  async delete(endpoint) {
    try {
      console.log(`🔐 [API-AUTH] DELETE ${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || `HTTP ${response.status}`);
      }

      console.log(`✅ [API-AUTH] DELETE ${endpoint} - Sucesso`);
      return data;
    } catch (error) {
      console.error(`❌ [API-AUTH] DELETE ${endpoint} - Erro:`, error);
      throw error;
    }
  },
});

export default apiClient;
