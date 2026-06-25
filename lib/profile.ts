// Perguntas de perfil respondidas antes do teste. Não pontuam.

export const FAIXAS_RENDA = [
  "R$ 0 a R$ 2.000",
  "R$ 2.001 a R$ 5.000",
  "R$ 5.000 a R$ 10.000",
  "Acima de R$ 10.000",
] as const;

export type FaixaRenda = (typeof FAIXAS_RENDA)[number];

export const ESTADOS_CIVIS = ["CASADO", "SOLTEIRO"] as const;
export type EstadoCivil = (typeof ESTADOS_CIVIS)[number];

export interface ProfileData {
  estadoCivil: EstadoCivil;
  temFilhos: boolean;
  qtdFilhos: number | null;
  idade: number;
  ehAdventista: boolean;
  possuiRenda: boolean;
  faixaRenda: FaixaRenda | null;
  casaPropria: boolean;
  veiculo: boolean;
  investimentos: boolean;
}

// Valida e normaliza um objeto de perfil vindo do cliente.
// Lança Error com mensagem amigável quando algo é inválido.
export function validateProfile(input: any): ProfileData {
  if (!input || typeof input !== "object") {
    throw new Error("Dados de perfil ausentes.");
  }

  if (!ESTADOS_CIVIS.includes(input.estadoCivil)) {
    throw new Error("Informe o estado civil.");
  }

  const temFilhos = Boolean(input.temFilhos);
  let qtdFilhos: number | null = null;
  if (temFilhos) {
    const n = Number(input.qtdFilhos);
    if (!Number.isInteger(n) || n < 1 || n > 50) {
      throw new Error("Informe um número válido de filhos.");
    }
    qtdFilhos = n;
  }

  const idade = Number(input.idade);
  if (!Number.isInteger(idade) || idade < 1 || idade > 120) {
    throw new Error("Informe uma idade válida.");
  }

  const possuiRenda = Boolean(input.possuiRenda);
  let faixaRenda: FaixaRenda | null = null;
  if (possuiRenda) {
    if (!FAIXAS_RENDA.includes(input.faixaRenda)) {
      throw new Error("Informe a faixa de renda.");
    }
    faixaRenda = input.faixaRenda;
  }

  return {
    estadoCivil: input.estadoCivil,
    temFilhos,
    qtdFilhos,
    idade,
    ehAdventista: Boolean(input.ehAdventista),
    possuiRenda,
    faixaRenda,
    casaPropria: Boolean(input.casaPropria),
    veiculo: Boolean(input.veiculo),
    investimentos: Boolean(input.investimentos),
  };
}
