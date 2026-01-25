export const ANO_PRIMEIRA_EDICAO = 2018;

/**
 * Calcula a edição baseada no ano
 * @param ano - Ano da inscrição/evento
 * @returns {edicao: string, numeroEdicao: number}
 */
export function calcularEdicao(ano: number): {
  edicao: string;
  numeroEdicao: number;
} {
  if (ano < ANO_PRIMEIRA_EDICAO) {
    throw new Error(
      `Ano ${ano} é anterior à primeira edição (${ANO_PRIMEIRA_EDICAO})`
    );
  }

  const numeroEdicao = ano - ANO_PRIMEIRA_EDICAO + 1;
  const edicao = `${numeroEdicao}ª Edição`;

  return { edicao, numeroEdicao };
}

export function calcularAnoPorEdicao(numeroEdicao: number): number {
  if (numeroEdicao < 1) {
    throw new Error("Número da edição deve ser maior que 0");
  }

  return ANO_PRIMEIRA_EDICAO + numeroEdicao - 1;
}

export function obterEdicaoAtual(): {
  edicao: string;
  numeroEdicao: number;
  ano: number;
} {
  const anoAtual = new Date().getFullYear();
  const { edicao, numeroEdicao } = calcularEdicao(anoAtual);

  return { edicao, numeroEdicao, ano: anoAtual };
}

export function listarTodasEdicoes(
  ateAno?: number
): Array<{ edicao: string; numeroEdicao: number; ano: number }> {
  const anoLimite = ateAno || new Date().getFullYear();
  const edicoes = [];

  for (let ano = ANO_PRIMEIRA_EDICAO; ano <= anoLimite; ano++) {
    const { edicao, numeroEdicao } = calcularEdicao(ano);
    edicoes.push({ edicao, numeroEdicao, ano });
  }

  return edicoes;
}

export function anoEhValido(ano: number): boolean {
  return ano >= ANO_PRIMEIRA_EDICAO && ano <= new Date().getFullYear() + 1;
}

export function formatarEdicao(numeroEdicao: number): string {
  return `${numeroEdicao}ª Edição`;
}
