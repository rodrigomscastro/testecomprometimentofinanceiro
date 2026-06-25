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
      <div className={`${tall ? "h-96" : "h-64"} w-full`}>{children}</div>
    </div>
  );
}

function SimplePie({ data }: { data: CountItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          outerRadius={80}
          label={(e) => `${e.label}: ${e.value}`}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? DEFAULT_BAR} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
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
function questionsToGrouped(questions: QuestionStat[]) {
  return questions.map((q) => {
    const row: Record<string, string | number> = { name: `P${q.q}` };
    for (const c of q.counts) row[c.label] = c.value;
    return row;
  });
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

export default function EventCharts({ stats }: { stats: EventStats }) {
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
      {/* Seletor de formato */}
      <div className="mb-4 flex justify-end">
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
      </div>

      {view === "pizza" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard title="Distribuição por resultado">
            <SimplePie data={stats.categories} />
          </ChartCard>
          <ChartCard title="Histograma de pontuações">
            <SimplePie data={stats.scoreHistogram} />
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
