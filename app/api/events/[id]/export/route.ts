import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QUIZ_QUESTIONS, RESULT_BANDS, type Category } from "@/lib/quiz";

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[";\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Não autorizado", { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { submissions: { orderBy: { createdAt: "asc" } } },
  });

  if (!event) {
    return new Response("Evento não encontrado", { status: 404 });
  }

  const header = [
    "Data",
    "Pontuacao",
    "Resultado",
    "Estado civil",
    "Tem filhos",
    "Qtd filhos",
    "Idade",
    "Adventista",
    "Possui renda",
    "Faixa de renda",
    "Casa propria",
    "Veiculo",
    "Investimentos",
    ...QUIZ_QUESTIONS.map((q) => `Q${q.q}`),
  ];

  const rows = event.submissions.map((s) => {
    const answers = (s.answers as { q: number; option: string }[]) ?? [];
    const byQ = new Map(answers.map((a) => [a.q, a.option]));
    return [
      s.createdAt.toISOString(),
      s.score,
      RESULT_BANDS[s.category as Category]?.title ?? s.category,
      s.estadoCivil,
      s.temFilhos ? "Sim" : "Não",
      s.qtdFilhos ?? "",
      s.idade,
      s.ehAdventista ? "Sim" : "Não",
      s.possuiRenda ? "Sim" : "Não",
      s.faixaRenda ?? "",
      s.casaPropria ? "Sim" : "Não",
      s.veiculo ? "Sim" : "Não",
      s.investimentos ? "Sim" : "Não",
      ...QUIZ_QUESTIONS.map((q) => byQ.get(q.q) ?? ""),
    ];
  });

  const csv = [header, ...rows]
    .map((r) => r.map(csvCell).join(";"))
    .join("\n");

  // BOM para acentuação correta no Excel.
  const body = "﻿" + csv;
  const filename = `resultados-${event.publicId}.csv`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
