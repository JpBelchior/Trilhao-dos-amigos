export const carregarComLoading = async (setLoading, setErro, fn) => {
  try {
    setLoading(true);
    setErro(null);
    await fn();
  } catch (error) {
    setErro(error.message);
  } finally {
    setLoading(false);
  }
};
