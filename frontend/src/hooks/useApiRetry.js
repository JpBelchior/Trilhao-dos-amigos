// frontend/src/hooks/useApiRetry.js
import { useState, useCallback } from "react";

export const useApiRetry = (maxRetries = 3) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const fetchWithRetry = useCallback(
    async (url, options = {}) => {
      const attemptFetch = async (attempt) => {
        try {
          if (attempt === 1) {
            setLoading(true);
            setError("");
          }

          setRetryCount(attempt - 1);

          const response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10000),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();

          setLoading(false);
          setRetryCount(0);
          return data;
        } catch (err) {
          console.error(`Tentativa ${attempt} falhou:`, err);

          if (attempt < maxRetries) {
            // Retry após delay
            setTimeout(() => {
              attemptFetch(attempt + 1);
            }, 1000 * attempt);
          } else {
            setLoading(false);
            setError("Erro de conexão");
            throw err;
          }
        }
      };

      return attemptFetch(1);
    },
    [maxRetries]
  );

  return {
    fetchWithRetry,
    loading,
    error,
    retryCount,
  };
};
