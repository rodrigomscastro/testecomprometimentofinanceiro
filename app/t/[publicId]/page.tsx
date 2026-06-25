import { prisma } from "@/lib/prisma";
import QuizFlow from "@/components/QuizFlow";

export const dynamic = "force-dynamic";

export default async function PublicTestPage({
  params,
}: {
  params: { publicId: string };
}) {
  const event = await prisma.event.findUnique({
    where: { publicId: params.publicId },
    select: { name: true, active: true },
  });

  if (!event || !event.active) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-sm rounded-xl bg-white p-8 shadow-md">
          <h1 className="text-xl font-bold text-slate-800">
            Teste indisponível
          </h1>
          <p className="mt-3 text-slate-600">
            Este link não está ativo no momento. Confirme com o organizador do
            evento.
          </p>
        </div>
      </main>
    );
  }

  return <QuizFlow publicId={params.publicId} eventName={event.name} />;
}
