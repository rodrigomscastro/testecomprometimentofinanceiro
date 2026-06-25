import type { Submission } from "@prisma/client";
import {
  categoryForScore,
  QUIZ_QUESTIONS,
  RESULT_BANDS,
  type AnswerRecord,
  type Category,
  type OptionKey,
} from "./quiz";

export interface CountItem {
  label: string;
  value: number;
  color?: string;
}

export interface QuestionStat {
  q: number;
  text: string;
  counts: CountItem[]; // contagem de A / B / C
}

export interface EventStats {
  total: number;
  averageScore: number;
  categories: CountItem[]; // Verde / Amarelo / Vermelho
  scoreHistogram: CountItem[]; // faixas de 0-10, 11-20, ...
  estadoCivil: CountItem[];
  filhos: CountItem[];
  faixaRenda: CountItem[];
  adventista: CountItem[];
  casaPropria: CountItem[];
  veiculo: CountItem[];
  investimentos: CountItem[];
  questions: QuestionStat[]; // distribuição A/B/C por pergunta do teste
}

// Cores das alternativas: A=pior, C=melhor (coerente com a pontuação 10/5/0).
const OPTION_COLORS: Record<OptionKey, string> = {
  A: "#dc2626",
  B: "#eab308",
  C: "#16a34a",
};

function tally(values: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}

function simYesNo(items: Submission[], pick: (s: Submission) => boolean): CountItem[] {
  let sim = 0;
  let nao = 0;
  for (const s of items) (pick(s) ? sim++ : nao++);
  return [
    { label: "Sim", value: sim, color: "#1d4ed8" },
    { label: "Não", value: nao, color: "#94a3b8" },
  ];
}

export function buildStats(submissions: Submission[]): EventStats {
  const total = submissions.length;

  const averageScore =
    total === 0
      ? 0
      : Math.round(
          (submissions.reduce((acc, s) => acc + s.score, 0) / total) * 10
        ) / 10;

  // Categorias na ordem Verde -> Amarelo -> Vermelho
  const catOrder: Category[] = ["VERDE", "AMARELO", "VERMELHO"];
  const catTally = tally(submissions.map((s) => s.category));
  const categories: CountItem[] = catOrder.map((c) => ({
    label: RESULT_BANDS[c].title,
    value: catTally.get(c) ?? 0,
    color: RESULT_BANDS[c].color,
  }));

  // Histograma de pontuação em faixas de 10 (0-10, 11-20, ..., 91-100)
  const buckets = [
    "0-10",
    "11-20",
    "21-30",
    "31-40",
    "41-50",
    "51-60",
    "61-70",
    "71-80",
    "81-90",
    "91-100",
  ];
  const histo = new Array(buckets.length).fill(0);
  for (const s of submissions) {
    let idx = Math.ceil(s.score / 10) - 1;
    if (s.score <= 10) idx = 0;
    if (idx < 0) idx = 0;
    if (idx > buckets.length - 1) idx = buckets.length - 1;
    histo[idx]++;
  }
  // Cor de cada faixa = cor da categoria correspondente ao topo da faixa
  // (ex.: 0-10/11-20 -> verde, 21-50 -> amarelo, 51-100 -> vermelho).
  const scoreHistogram: CountItem[] = buckets.map((label, i) => ({
    label,
    value: histo[i],
    color: RESULT_BANDS[categoryForScore((i + 1) * 10)].color,
  }));

  const ecTally = tally(submissions.map((s) => s.estadoCivil));
  const estadoCivil: CountItem[] = [
    { label: "Casado", value: ecTally.get("CASADO") ?? 0, color: "#1d4ed8" },
    { label: "Solteiro", value: ecTally.get("SOLTEIRO") ?? 0, color: "#0ea5e9" },
  ];

  const frTally = tally(
    submissions.filter((s) => s.faixaRenda).map((s) => s.faixaRenda as string)
  );
  const faixaRenda: CountItem[] = Array.from(frTally.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label, value, color: "#1d4ed8" }));

  // Distribuição A/B/C por pergunta, lendo o campo answers de cada submissão.
  const optionKeys: OptionKey[] = ["A", "B", "C"];
  const perQuestion = new Map<number, Map<OptionKey, number>>();
  for (const s of submissions) {
    const records = (s.answers as unknown as AnswerRecord[]) ?? [];
    if (!Array.isArray(records)) continue;
    for (const r of records) {
      if (!optionKeys.includes(r.option)) continue;
      const m = perQuestion.get(r.q) ?? new Map<OptionKey, number>();
      m.set(r.option, (m.get(r.option) ?? 0) + 1);
      perQuestion.set(r.q, m);
    }
  }
  const questions: QuestionStat[] = QUIZ_QUESTIONS.map((question) => {
    const m = perQuestion.get(question.q);
    return {
      q: question.q,
      text: question.text,
      counts: optionKeys.map((key) => {
        const optionLabel = question.options.find((o) => o.key === key)?.label;
        return {
          // Rótulo legível com a resposta (ex.: "A) Antes do fim do mês").
          label: optionLabel ? `${key}) ${optionLabel}` : key,
          value: m?.get(key) ?? 0,
          color: OPTION_COLORS[key],
        };
      }),
    };
  });

  return {
    total,
    averageScore,
    categories,
    scoreHistogram,
    estadoCivil,
    filhos: simYesNo(submissions, (s) => s.temFilhos),
    faixaRenda,
    adventista: simYesNo(submissions, (s) => s.ehAdventista),
    casaPropria: simYesNo(submissions, (s) => s.casaPropria),
    veiculo: simYesNo(submissions, (s) => s.veiculo),
    investimentos: simYesNo(submissions, (s) => s.investimentos),
    questions,
  };
}
