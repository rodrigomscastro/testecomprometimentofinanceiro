export type OptionKey = "A" | "B" | "C";

export interface QuizOption {
  key: OptionKey;
  label: string;
}

export interface QuizQuestion {
  q: number;
  text: string;
  options: QuizOption[];
}

// Pontuação fixa por alternativa: A = 10, B = 5, C = 0 (máx. 100).
export const OPTION_POINTS: Record<OptionKey, number> = {
  A: 10,
  B: 5,
  C: 0,
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    q: 1,
    text: "Quando seu salário termina?",
    options: [
      { key: "A", label: "Antes do fim do mês" },
      { key: "B", label: "No fim do mês" },
      {
        key: "C",
        label: "Depois do fim do mês e ainda poupo/invisto o que sobra",
      },
    ],
  },
  {
    q: 2,
    text: "Você tem dívidas em atraso?",
    options: [
      { key: "A", label: "Sim" },
      { key: "B", label: "Sim, mas já estou resolvendo" },
      { key: "C", label: "Não" },
    ],
  },
  {
    q: 3,
    text: "Suas dívidas equivalem a quanto da sua renda?",
    options: [
      { key: "A", label: "Mais que 50%" },
      { key: "B", label: "Menos que 50%" },
      { key: "C", label: "Não tenho dívidas" },
    ],
  },
  {
    q: 4,
    text: "Você está negativado? ('Nome sujo' no SPC, Serasa, etc)",
    options: [
      { key: "A", label: "Sim" },
      { key: "B", label: "Sim, mas já estou resolvendo" },
      { key: "C", label: "Não" },
    ],
  },
  {
    q: 5,
    text: "Você tem problemas familiares causados por questões financeiras?",
    options: [
      { key: "A", label: "Sim" },
      { key: "B", label: "Eventualmente" },
      { key: "C", label: "Não" },
    ],
  },
  {
    q: 6,
    text: "Com que frequência você pede dinheiro emprestado para amigos e familiares para fechar o mês?",
    options: [
      { key: "A", label: "Sempre" },
      { key: "B", label: "Eventualmente" },
      { key: "C", label: "Nunca" },
    ],
  },
  {
    q: 7,
    text: "Você tem contas de luz, água ou moradia em atraso?",
    options: [
      { key: "A", label: "Sim" },
      { key: "B", label: "Sim, algumas, mas já estou resolvendo" },
      { key: "C", label: "Não" },
    ],
  },
  {
    q: 8,
    text: "Quantas vezes você entra no cheque especial?",
    options: [
      { key: "A", label: "Frequentemente" },
      { key: "B", label: "Eventualmente" },
      { key: "C", label: "Nunca / muito raro utilizar o cheque especial" },
    ],
  },
  {
    q: 9,
    text: "Sobre liberdade pra comprar?",
    options: [
      {
        key: "A",
        label:
          "Não tenho no momento (sem limite no cartão ou margem no orçamento)",
      },
      {
        key: "B",
        label: "Somente no Cartão de Crédito ou Crediário (parcelado)",
      },
      {
        key: "C",
        label: "Consigo avaliar e decidir (mediante melhor custo x benefício)",
      },
    ],
  },
  {
    q: 10,
    text: "Sobre reserva financeira e/ou de emergência?",
    options: [
      { key: "A", label: "Não tenho" },
      { key: "B", label: "Já tive" },
      { key: "C", label: "Tenho" },
    ],
  },
];

export type Category = "VERDE" | "AMARELO" | "VERMELHO";

export interface ResultBand {
  category: Category;
  title: string;
  color: string; // hex usado também nos gráficos
  message: string;
}

export const RESULT_BANDS: Record<Category, ResultBand> = {
  VERDE: {
    category: "VERDE",
    title: "Mandou Bem!",
    color: "#16a34a",
    message:
      "Suas finanças estão bem-organizadas e, por mais que pontualmente você enfrente algum problema, consegue fechar o mês no azul e sem se complicar. Se você ainda não está poupando ou investindo, considere essas possibilidades para ter um futuro financeiro ainda mais tranquilo ou até mesmo estar preparado para emergências.",
  },
  AMARELO: {
    category: "AMARELO",
    title: "Endividado",
    color: "#eab308",
    message:
      "Alerta vermelho: você ainda não é superendividado, mas precisa ter atenção e começar a cuidar melhor de suas finanças para não acabar com o nome negativado e com juros altos para pagar.",
  },
  VERMELHO: {
    category: "VERMELHO",
    title: "Superendividado",
    color: "#dc2626",
    message:
      "É hora de parar, refletir e agir: descubra quanto você deve e consolide suas dívidas para não se afundar ainda mais. Trate essa questão com a seriedade que merece. O melhor dia para começar é hoje!",
  },
};

export interface AnswerRecord {
  q: number;
  option: OptionKey;
  points: number;
}

// Calcula a categoria a partir da pontuação.
// Faixas do documento: > 50 Vermelho, 25–50 Amarelo, 0–20 Verde.
// A lacuna 21–24 é incorporada ao Verde (score < 25 → Verde).
export function categoryForScore(score: number): Category {
  if (score > 50) return "VERMELHO";
  if (score >= 25) return "AMARELO";
  return "VERDE";
}

// Recebe um mapa { questionNumber: option } e devolve score + categoria.
export function computeResult(answers: Record<number, OptionKey>): {
  score: number;
  category: Category;
  records: AnswerRecord[];
} {
  const records: AnswerRecord[] = [];
  let score = 0;

  for (const question of QUIZ_QUESTIONS) {
    const option = answers[question.q];
    if (!option || !(option in OPTION_POINTS)) {
      throw new Error(`Resposta ausente ou inválida para a pergunta ${question.q}.`);
    }
    const points = OPTION_POINTS[option];
    score += points;
    records.push({ q: question.q, option, points });
  }

  return { score, category: categoryForScore(score), records };
}
