"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditableEventName({
  eventId,
  name,
}: {
  eventId: string;
  name: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function start() {
    setValue(name);
    setError("");
    setEditing(true);
  }

  async function save() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Informe o nome do evento.");
      return;
    }
    if (trimmed === name) {
      setEditing(false);
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao salvar o nome.");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-brand-dark">{name}</h1>
        <button
          onClick={start}
          aria-label="Editar nome do evento"
          className="text-sm font-medium text-brand hover:underline"
        >
          Editar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={value}
          autoFocus
          disabled={loading}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xl font-bold text-brand-dark focus:border-brand focus:outline-none"
        />
        <button
          onClick={save}
          disabled={loading}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
        <button
          onClick={() => setEditing(false)}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancelar
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-result-red">{error}</p>}
    </div>
  );
}
