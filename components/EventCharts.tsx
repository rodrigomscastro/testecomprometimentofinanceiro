"use client";

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
import type { CountItem, EventStats } from "@/lib/aggregate";

const DEFAULT_BAR = "#1d4ed8";

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-700">{title}</h3>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

function SimpleBar({ data }: { data: CountItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? DEFAULT_BAR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function EventCharts({ stats }: { stats: EventStats }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ChartCard title="Distribuição por resultado">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats.categories}
              dataKey="value"
              nameKey="label"
              outerRadius={90}
              label={(e) => `${e.label}: ${e.value}`}
            >
              {stats.categories.map((d, i) => (
                <Cell key={i} fill={d.color ?? DEFAULT_BAR} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Histograma de pontuações">
        <SimpleBar data={stats.scoreHistogram} />
      </ChartCard>

      <ChartCard title="Estado civil">
        <SimpleBar data={stats.estadoCivil} />
      </ChartCard>

      <ChartCard title="Tem filhos">
        <SimpleBar data={stats.filhos} />
      </ChartCard>

      {stats.faixaRenda.length > 0 && (
        <ChartCard title="Faixa de renda">
          <SimpleBar data={stats.faixaRenda} />
        </ChartCard>
      )}

      <ChartCard title="É adventista">
        <SimpleBar data={stats.adventista} />
      </ChartCard>

      <ChartCard title="Possui casa própria">
        <SimpleBar data={stats.casaPropria} />
      </ChartCard>

      <ChartCard title="Possui veículo">
        <SimpleBar data={stats.veiculo} />
      </ChartCard>

      <ChartCard title="Possui investimentos">
        <SimpleBar data={stats.investimentos} />
      </ChartCard>
    </div>
  );
}
