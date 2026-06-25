import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CreateEventForm from "@/components/CreateEventForm";
import SignOutButton from "@/components/SignOutButton";
import DeleteEventButton from "@/components/DeleteEventButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Eventos</h1>
        <SignOutButton />
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Criar novo evento</h2>
        <CreateEventForm />
      </div>

      <div className="mt-8 space-y-3">
        {events.length === 0 && (
          <p className="text-slate-500">
            Nenhum evento ainda. Crie o primeiro acima.
          </p>
        )}
        {events.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <Link
              href={`/admin/events/${e.id}`}
              className="flex flex-1 items-center justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-slate-800">{e.name}</p>
                <p className="text-sm text-slate-500">
                  {new Date(e.createdAt).toLocaleDateString("pt-BR")} ·{" "}
                  {e._count.submissions} resposta(s)
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  e.active
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {e.active ? "Ativo" : "Inativo"}
              </span>
            </Link>
            <DeleteEventButton
              eventId={e.id}
              eventName={e.name}
              submissionCount={e._count.submissions}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
