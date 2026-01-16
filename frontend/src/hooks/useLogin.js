// src/hooks/useLogin.js
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para lógica do Login
 * Responsabilidade: gerenciar estado e funções do login
 */
const useLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Estados
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Atualizar campo do formulário
  const atualizarFormData = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor,
    }));
    // Limpar erro quando começar a digitar
    if (erro) setErro(null);
  };

  // Validar formulário
  const validarFormulario = () => {
    if (!formData.email.trim()) {
      setErro('Email é obrigatório');
      return false;
    }

    if (!formData.email.includes('@')) {
      setErro('Email inválido');
      return false;
    }

    if (!formData.senha.trim()) {
      setErro('Senha é obrigatória');
      return false;
    }

    if (formData.senha.length < 6) {
      setErro('Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  // Submeter login
  const submeterLogin = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      console.log('🔑 Tentando fazer login:', formData.email);

      const resultado = await login(
        formData.email.trim().toLowerCase(),
        formData.senha
      );

      if (!resultado.sucesso) {
        throw new Error(resultado.erro || 'Erro ao fazer login');
      }

      console.log('✅ Login realizado com sucesso');

      // Redirecionar
      const destination = location.state?.from || '/admin';
      navigate(destination, { replace: true });

    } catch (error) {
      console.error('❌ Erro no login:', error);
      setErro(error.message || 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  // Alternar visibilidade da senha
  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  // Tentar novamente
  const tentarNovamente = () => {
    setErro(null);
    setFormData({ email: '', senha: '' });
  };

  // Voltar para home
  const voltarParaHome = () => {
    navigate('/');
  };

  return {
    // Estados
    formData,
    mostrarSenha,
    loading,
    erro,

    // Funções
    atualizarFormData,
    submeterLogin,
    toggleMostrarSenha,
    tentarNovamente,
    voltarParaHome,
  };
};

export default useLogin;