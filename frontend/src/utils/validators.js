
export const validarCpf = (cpf) => {
  if (!cpf) {
    return { valido: false, mensagem: 'CPF é obrigatório' };
  }

  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11) {
    return { valido: false, mensagem: 'CPF deve ter 11 dígitos' };
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return { valido: false, mensagem: 'CPF inválido' };
  }

  return { valido: true };
};

export const validarEmail = (email) => {
  if (!email) {
    return { valido: false, mensagem: 'Email é obrigatório' };
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!regex.test(email)) {
    return { valido: false, mensagem: 'Email inválido' };
  }

  return { valido: true };
};

export const validarTelefone = (telefone) => {
  if (!telefone) {
    return { valido: false, mensagem: 'Telefone é obrigatório' };
  }

  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
    return { 
      valido: false, 
      mensagem: 'Telefone deve ter 10 ou 11 dígitos' 
    };
  }

  return { valido: true };
};

export const validarCampoObrigatorio = (valor, nomeCampo) => {
  if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
    return { 
      valido: false, 
      mensagem: `${nomeCampo} é obrigatório` 
    };
  }

  return { valido: true };
};

/**
 * Validar formulário completo de cadastro
 */
export const validarFormularioCadastro = (dados) => {
  const erros = {};

  // Nome
  const validacaoNome = validarCampoObrigatorio(dados.nome, 'Nome');
  if (!validacaoNome.valido) erros.nome = validacaoNome.mensagem;

  // CPF
  const validacaoCpf = validarCpf(dados.cpf);
  if (!validacaoCpf.valido) erros.cpf = validacaoCpf.mensagem;

  // Email
  const validacaoEmail = validarEmail(dados.email);
  if (!validacaoEmail.valido) erros.email = validacaoEmail.mensagem;

  // Telefone
  const validacaoTelefone = validarTelefone(dados.telefone);
  if (!validacaoTelefone.valido) erros.telefone = validacaoTelefone.mensagem;

  // Outros campos obrigatórios
  const camposObrigatorios = [
    { campo: 'cidade', nome: 'Cidade' },
    { campo: 'estado', nome: 'Estado' },
    { campo: 'modeloMoto', nome: 'Modelo da Moto' },
  ];

  camposObrigatorios.forEach(({ campo, nome }) => {
    const validacao = validarCampoObrigatorio(dados[campo], nome);
    if (!validacao.valido) erros[campo] = validacao.mensagem;
  });

  return {
    valido: Object.keys(erros).length === 0,
    erros,
  };
};