"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { CountItem, EventStats, QuestionStat } from "@/lib/aggregate";

const DEFAULT_BAR = "#1d4ed8";

type View = "pizza" | "bars";

function ChartCard({
  title,
  children,
  tall,
}: {
  title: string;
  children: React.ReactNode;
  tall?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-700">{title}</h3>
      <div className={`${tall ? "h-96" : "h-72"} w-full`}>{children}</div>
    </div>
  );
}

function SimplePie({ data }: { data: CountItem[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" outerRadius="80%">
              {data.map((d, i) => (
                <Cell key={i} fill={d.color ?? DEFAULT_BAR} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legenda própria: quebra linha e mostra o valor, sem cortar/sobrepor */}
      <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-600">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-sm"
              style={{ backgroundColor: d.color ?? DEFAULT_BAR }}
            />
            <span>
              {d.label}: <strong className="font-semibold">{d.value}</strong>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SimpleHBar({ data }: { data: CountItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
      >
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="label"
          width={110}
          tick={{ fontSize: 11 }}
        />
        <Tooltip />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? DEFAULT_BAR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Gráfico de barras horizontais agrupadas: cada linha tem uma barra por série.
function GroupedHBar({
  data,
  series,
}: {
  data: Record<string, string | number>[];
  series: { key: string; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
      >
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="name"
          width={48}
          tick={{ fontSize: 11 }}
        />
        <Tooltip />
        <Legend />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[0, 3, 3, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// Monta os dados das perguntas no formato { name: "P1", A, B, C } para o GroupedHBar.
// Usa a posição (A, B, C) — independe do rótulo, que agora traz o texto da resposta.
function questionsToGrouped(questions: QuestionStat[]) {
  return questions.map((q) => ({
    name: `P${q.q}`,
    A: q.counts[0]?.value ?? 0,
    B: q.counts[1]?.value ?? 0,
    C: q.counts[2]?.value ?? 0,
  }));
}

// Junta várias séries Sim/Não num só dataset { name, Sim, Não }.
function yesNoToGrouped(
  items: { name: string; data: CountItem[] }[]
): Record<string, string | number>[] {
  return items.map(({ name, data }) => {
    const sim = data.find((d) => d.label === "Sim")?.value ?? 0;
    const nao = data.find((d) => d.label === "Não")?.value ?? 0;
    return { name, Sim: sim, "Não": nao };
  });
}

export default function EventCharts({
  stats,
  exportHref,
}: {
  stats: EventStats;
  exportHref?: string;
}) {
  const [view, setView] = useState<View>("pizza");

  const profileGrouped = yesNoToGrouped([
    { name: "Filhos", data: stats.filhos },
    { name: "Adventista", data: stats.adventista },
    { name: "Casa própria", data: stats.casaPropria },
    { name: "Veículo", data: stats.veiculo },
    { name: "Investimentos", data: stats.investimentos },
  ]);

  return (
    <div>
      {/* Seletor de formato + exportar CSV, na mesma linha */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
          {(
            [
              { key: "pizza", label: "Pizza" },
              { key: "bars", label: "Barras horizontais" },
            ] as { key: View; label: string }[]
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setView(opt.key)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                view === opt.key
                  ? "bg-brand text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {exportHref && (
          <a
            href={exportHref}
            className="ml-auto rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand hover:text-white"
          >
            Exportar CSV
          </a>
        )}
      </div>

      {view === "pizza" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard title="Distribuição por resultado">
            <SimplePie data={stats.categories} />
          </ChartCard>
          <ChartCard title="Histograma de pontuações">
            <SimpleHBar data={stats.scoreHistogram} />
          </ChartCard>
          <ChartCard title="Estado civil">
            <SimplePie data={stats.estadoCivil} />
          </ChartCard>
          <ChartCard title="Tem filhos">
            <SimplePie data={stats.filhos} />
          </ChartCard>
          {stats.faixaRenda.length > 0 && (
            <ChartCard title="Faixa de renda">
              <SimplePie data={stats.faixaRenda} />
            </ChartCard>
          )}
          <ChartCard title="É adventista">
            <SimplePie data={stats.adventista} />
          </ChartCard>
          <ChartCard title="Possui casa própria">
            <SimplePie data={stats.casaPropria} />
          </ChartCard>
          <ChartCard title="Possui veículo">
            <SimplePie data={stats.veiculo} />
          </ChartCard>
          <ChartCard title="Possui investimentos">
            <SimplePie data={stats.investimentos} />
          </ChartCard>

          {/* Perguntas do teste, uma pizza por pergunta */}
          {stats.questions.map((q) => (
            <ChartCard key={q.q} title={`P${q.q}. ${q.text}`}>
              <SimplePie data={q.counts} />
            </ChartCard>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          <ChartCard title="Respostas por pergunta (A / B / C)" tall>
            <GroupedHBar
              data={questionsToGrouped(stats.questions)}
              series={[
                { key: "A", color: "#dc2626" },
                { key: "B", color: "#eab308" },
                { key: "C", color: "#16a34a" },
              ]}
            />
          </ChartCard>

          <ChartCard title="Perfil da plateia (Sim / Não)">
            <GroupedHBar
              data={profileGrouped}
              series={[
                { key: "Sim", color: "#1d4ed8" },
                { key: "Não", color: "#94a3b8" },
              ]}
            />
          </ChartCard>

          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Distribuição por resultado">
              <SimpleHBar data={stats.categories} />
            </ChartCard>
            <ChartCard title="Histograma de pontuações">
              <SimpleHBar data={stats.scoreHistogram} />
            </ChartCard>
            <ChartCard title="Estado civil">
              <SimpleHBar data={stats.estadoCivil} />
            </ChartCard>
            {stats.faixaRenda.length > 0 && (
              <ChartCard title="Faixa de renda">
                <SimpleHBar data={stats.faixaRenda} />
              </ChartCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
