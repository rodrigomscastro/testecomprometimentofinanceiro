import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold text-brand-dark">
          Teste de Comprometimento Financeiro
        </h1>
        <p className="mt-4 text-slate-600">
          Esta é a plataforma de aplicação do teste. Para responder, use o link
          específico do evento divulgado pelo organizador.
        </p>
        <Link
          href="/admin"
          className="mt-8 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          Painel do administrador
        </Link>
      </div>
    </main>
  );
}
