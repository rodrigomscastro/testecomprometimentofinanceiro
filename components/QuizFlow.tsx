"use client";

import { useState } from "react";
import {
  QUIZ_QUESTIONS,
  type OptionKey,
} from "@/lib/quiz";
import {
  ESTADOS_CIVIS,
  FAIXAS_RENDA,
  type EstadoCivil,
  type FaixaRenda,
} from "@/lib/profile";

type Step = "intro" | "profile" | "quiz" | "result";

interface ProfileState {
  estadoCivil: EstadoCivil | "";
  temFilhos: boolean | null;
  qtdFilhos: string;
  idade: string;
  ehAdventista: boolean | null;
  possuiRenda: boolean | null;
  faixaRenda: FaixaRenda | "";
  casaPropria: boolean | null;
  veiculo: boolean | null;
  investimentos: boolean | null;
}

interface ResultData {
  score: number;
  title: string;
  color: string;
  message: string;
}

const emptyProfile: ProfileState = {
  estadoCivil: "",
  temFilhos: null,
  qtdFilhos: "",
  idade: "",
  ehAdventista: null,
  possuiRenda: null,
  faixaRenda: "",
  casaPropria: null,
  veiculo: null,
  investimentos: null,
};

export default function QuizFlow({
  publicId,
  eventName,
}: {
  publicId: string;
  eventName: string;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [profile, setProfile] = useState<ProfileState>(emptyProfile);
  const [profileError, setProfileError] = useState("");
  const [answers, setAnswers] = useState<Record<number, OptionKey>>({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);

  function validateProfile(): string {
    if (!profile.estadoCivil) return "Selecione o estado civil.";
    if (profile.temFilhos === null) return "Informe se possui filhos.";
    if (profile.temFilhos) {
      const n = Number(profile.qtdFilhos);
      if (!Number.isInteger(n) || n < 1)
        return "Informe quantos filhos você tem.";
    }
    const idade = Number(profile.idade);
    if (!Number.isInteger(idade) || idade < 1 || idade > 120)
      return "Informe uma idade válida.";
    if (profile.ehAdventista === null) return "Informe se é adventista.";
    if (profile.possuiRenda === null) return "Informe se possui renda própria.";
    if (profile.possuiRenda && !profile.faixaRenda)
      return "Selecione a faixa de renda.";
    if (profile.casaPropria === null) return "Informe se possui casa própria.";
    if (profile.veiculo === null) return "Informe se possui veículo.";
    if (profile.investimentos === null)
      return "Informe se possui investimentos.";
    return "";
  }

  function startQuiz() {
    const err = validateProfile();
    if (err) {
      setProfileError(err);
      return;
    }
    setProfileError("");
    setStep("quiz");
  }

  function answer(option: OptionKey) {
    const q = QUIZ_QUESTIONS[current].q;
    setAnswers((prev) => ({ ...prev, [q]: option }));
    if (current < QUIZ_QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      submit({ ...answers, [q]: option });
    }
  }

  async function submit(finalAnswers: Record<number, OptionKey>) {
    setSubmitting(true);
    setSubmitError("");

    const res = await fetch(`/api/submit/${publicId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: {
          estadoCivil: profile.estadoCivil,
          temFilhos: profile.temFilhos,
          qtdFilhos: profile.temFilhos ? Number(profile.qtdFilhos) : null,
          idade: Number(profile.idade),
          ehAdventista: profile.ehAdventista,
          possuiRenda: profile.possuiRenda,
          faixaRenda: profile.possuiRenda ? profile.faixaRenda : null,
          casaPropria: profile.casaPropria,
          veiculo: profile.veiculo,
          investimentos: profile.investimentos,
        },
        answers: finalAnswers,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSubmitError(data.error || "Erro ao enviar suas respostas.");
      return;
    }
    const data = (await res.json()) as ResultData;
    setResult(data);
    setStep("result");
  }

  // ---- Telas ----

  if (step === "intro") {
    return (
      <Shell>
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-brand">
            {eventName}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-brand-dark">
            Teste de Comprometimento Financeiro
          </h1>
          <p className="mt-4 text-slate-600">
            Responda algumas perguntas rápidas e descubra, na hora, como está a
            sua saúde financeira. Marque a alternativa que mais se assemelha à
            sua situação.
          </p>
          <button
            onClick={() => setStep("profile")}
            className="mt-8 w-full rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Começar
          </button>
        </div>
      </Shell>
    );
  }

  if (step === "profile") {
    return (
      <Shell>
        <h2 className="text-xl font-bold text-brand-dark">Sobre você</h2>
        <p className="mt-1 text-sm text-slate-500">
          Essas informações são anônimas e usadas apenas para estatísticas.
        </p>

        <div className="mt-6 space-y-6">
          <Choice
            label="Estado civil"
            value={profile.estadoCivil}
            options={ESTADOS_CIVIS.map((v) => ({
              value: v,
              label: v === "CASADO" ? "Casado(a)" : "Solteiro(a)",
            }))}
            onChange={(v) =>
              setProfile((p) => ({ ...p, estadoCivil: v as EstadoCivil }))
            }
          />

          <YesNo
            label="Possui filhos?"
            value={profile.temFilhos}
            onChange={(v) => setProfile((p) => ({ ...p, temFilhos: v }))}
          />
          {profile.temFilhos && (
            <NumberField
              label="Quantos filhos?"
              value={profile.qtdFilhos}
              onChange={(v) => setProfile((p) => ({ ...p, qtdFilhos: v }))}
            />
          )}

          <NumberField
            label="Idade"
            value={profile.idade}
            onChange={(v) => setProfile((p) => ({ ...p, idade: v }))}
          />

          <YesNo
            label="É adventista?"
            value={profile.ehAdventista}
            onChange={(v) => setProfile((p) => ({ ...p, ehAdventista: v }))}
          />

          <YesNo
            label="Possui renda própria?"
            value={profile.possuiRenda}
            onChange={(v) => setProfile((p) => ({ ...p, possuiRenda: v }))}
          />
          {profile.possuiRenda && (
            <Choice
              label="Faixa de renda"
              value={profile.faixaRenda}
              options={FAIXAS_RENDA.map((v) => ({ value: v, label: v }))}
              onChange={(v) =>
                setProfile((p) => ({ ...p, faixaRenda: v as FaixaRenda }))
              }
            />
          )}

          <YesNo
            label="Possui casa própria?"
            value={profile.casaPropria}
            onChange={(v) => setProfile((p) => ({ ...p, casaPropria: v }))}
          />
          <YesNo
            label="Possui veículo?"
            value={profile.veiculo}
            onChange={(v) => setProfile((p) => ({ ...p, veiculo: v }))}
          />
          <YesNo
            label="Possui investimentos?"
            value={profile.investimentos}
            onChange={(v) => setProfile((p) => ({ ...p, investimentos: v }))}
          />
        </div>

        {profileError && (
          <p className="mt-4 text-sm text-result-red">{profileError}</p>
        )}

        <button
          onClick={startQuiz}
          className="mt-8 w-full rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          Continuar para o teste
        </button>
      </Shell>
    );
  }

  if (step === "quiz") {
    const question = QUIZ_QUESTIONS[current];
    const selected = answers[question.q];
    return (
      <Shell>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Pergunta {current + 1} de {QUIZ_QUESTIONS.length}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-brand transition-all"
            style={{
              width: `${((current + 1) / QUIZ_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>

        <h2 className="mt-6 text-xl font-bold text-slate-800">
          {question.text}
        </h2>

        <div className="mt-6 space-y-3">
          {question.options.map((opt) => (
            <button
              // Inclui o número da pergunta para remontar os botões a cada
              // pergunta — evita o "sticky hover" do toque carregar o destaque
              // para a opção de mesma posição na pergunta seguinte (mobile).
              key={`q${question.q}-${opt.key}`}
              onClick={(e) => {
                e.currentTarget.blur();
                answer(opt.key);
              }}
              disabled={submitting}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors disabled:opacity-60 ${
                selected === opt.key
                  ? "border-brand bg-brand/5"
                  : "border-slate-200 [@media(hover:hover)]:hover:border-brand [@media(hover:hover)]:hover:bg-slate-50"
              }`}
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {opt.key}
              </span>
              <span className="text-slate-700">{opt.label}</span>
            </button>
          ))}
        </div>

        {current > 0 && (
          <button
            onClick={() => setCurrent((c) => c - 1)}
            disabled={submitting}
            className="mt-6 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            ← Voltar
          </button>
        )}

        {submitting && (
          <p className="mt-4 text-center text-sm text-slate-500">
            Calculando seu resultado...
          </p>
        )}
        {submitError && (
          <p className="mt-4 text-center text-sm text-result-red">
            {submitError}
          </p>
        )}
      </Shell>
    );
  }

  // result
  if (step === "result" && result) {
    return (
      <Shell>
        <div className="text-center">
          <div
            className="mx-auto flex h-28 w-28 flex-col items-center justify-center rounded-full text-white"
            style={{ backgroundColor: result.color }}
          >
            <span className="text-3xl font-extrabold">{result.score}</span>
            <span className="text-xs">pontos</span>
          </div>
          <h2
            className="mt-5 text-2xl font-bold"
            style={{ color: result.color }}
          >
            {result.title}
          </h2>
          <p className="mt-4 text-slate-600">{result.message}</p>
          <p className="mt-8 text-sm text-slate-400">
            Obrigado por participar de <strong>{eventName}</strong>.
          </p>
        </div>
      </Shell>
    );
  }

  return null;
}

// ---- Componentes auxiliares ----

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-md sm:p-8">
        {children}
      </div>
    </main>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <p className="font-medium text-slate-700">{label}</p>
      <div className="mt-2 flex gap-3">
        {[
          { v: true, l: "Sim" },
          { v: false, l: "Não" },
        ].map((o) => (
          <button
            key={o.l}
            type="button"
            onClick={() => onChange(o.v)}
            className={`flex-1 rounded-lg border px-4 py-2 font-medium ${
              value === o.v
                ? "border-brand bg-brand text-white"
                : "border-slate-300 text-slate-600 hover:border-brand"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="font-medium text-slate-700">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              value === o.value
                ? "border-brand bg-brand text-white"
                : "border-slate-300 text-slate-600 hover:border-brand"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="font-medium text-slate-700">{label}</p>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none"
      />
    </div>
  );
}
