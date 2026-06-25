"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteEventButton({
  eventId,
  eventName,
  submissionCount,
}: {
  eventId: string;
  eventName: string;
  submissionCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Excluir o evento "${eventName}"?\n\n` +
        `Isso também apaga ${submissionCount} resposta(s) deste evento. ` +
        `Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) {
      window.alert("Erro ao excluir o evento. Tente novamente.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      aria-label={`Excluir evento ${eventName}`}
      title="Excluir evento"
      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-result-red disabled:opacity-50"
    >
      {/* ícone de lixeira */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    </button>
  );
}
