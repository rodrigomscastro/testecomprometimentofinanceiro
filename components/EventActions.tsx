"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EventActions({
  eventId,
  active,
}: {
  eventId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
        active
          ? "border border-slate-300 text-slate-600 hover:bg-slate-100"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
    >
      {loading
        ? "Salvando..."
        : active
        ? "Desativar evento"
        : "Reativar evento"}
    </button>
  );
}
