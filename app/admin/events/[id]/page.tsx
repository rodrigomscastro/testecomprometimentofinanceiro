import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { buildStats } from "@/lib/aggregate";
import EventCharts from "@/components/EventCharts";
import ShareLink from "@/components/ShareLink";
import EventActions from "@/components/EventActions";

export const dynamic = "force-dynamic";

function baseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { submissions: { orderBy: { createdAt: "desc" } } },
  });

  if (!event) notFound();

  const publicUrl = `${baseUrl()}/t/${event.publicId}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    width: 320,
    margin: 2,
  });

  const stats = buildStats(event.submissions);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/admin" className="text-sm text-brand hover:underline">
        ← Voltar aos eventos
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{event.name}</h1>
          <p className="text-sm text-slate-500">
            Criado em {new Date(event.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <EventActions eventId={event.id} active={event.active} />
      </div>

      {/* Link + QR Code */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Link para a plateia</h2>
          <p className="mt-1 text-sm text-slate-500">
            Compartilhe este link ou QR code. Cada evento possui um link
            exclusivo.
          </p>
          <ShareLink url={publicUrl} />
          {!event.active && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Este evento está <strong>inativo</strong>: o link não aceita novas
              respostas.
            </p>
          )}
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR Code do evento" className="w-56 h-56" />
          <a
            href={qrDataUrl}
            download={`qrcode-${event.publicId}.png`}
            className="mt-3 text-sm font-medium text-brand hover:underline"
          >
            Baixar QR Code
          </a>
        </div>
      </section>

      {/* Métricas */}
      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Respostas" value={stats.total} />
        <StatCard label="Pontuação média" value={stats.averageScore} />
        <StatCard
          label="Mandou Bem (Verde)"
          value={stats.categories[0].value}
          color="#16a34a"
        />
        <StatCard
          label="Superend. (Vermelho)"
          value={stats.categories[2].value}
          color="#dc2626"
        />
      </section>

      {/* Gráficos */}
      <section className="mt-6">
        {stats.total === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm">
            Ainda não há respostas para este evento. Os gráficos aparecerão aqui
            assim que a plateia começar a responder.
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <a
                href={`/api/events/${event.id}/export`}
                className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand hover:text-white"
              >
                Exportar CSV
              </a>
            </div>
            <EventCharts stats={stats} />
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className="mt-1 text-2xl font-bold"
        style={{ color: color ?? "#0f172a" }}
      >
        {value}
      </p>
    </div>
  );
}
