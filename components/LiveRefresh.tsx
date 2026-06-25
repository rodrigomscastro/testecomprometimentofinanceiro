"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const INTERVAL_MS = 5000;

export default function LiveRefresh() {
  const router = useRouter();
  const [auto, setAuto] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  function refreshNow() {
    router.refresh();
    setLastUpdated(new Date());
  }

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      router.refresh();
      setLastUpdated(new Date());
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [auto, router]);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={auto}
          onChange={(e) => setAuto(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
        />
        Atualização automática
      </label>

      <button
        onClick={refreshNow}
        className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand hover:text-white"
      >
        Atualizar agora
      </button>

      {lastUpdated && (
        <span className="text-xs text-slate-400">
          atualizado às {lastUpdated.toLocaleTimeString("pt-BR")}
        </span>
      )}
    </div>
  );
}
