"use client";

import { useEffect, useRef, useState } from "react";

export default function QrCodePanel({
  qrDataUrl,
  publicUrl,
  publicId,
}: {
  qrDataUrl: string;
  publicUrl: string;
  publicId: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  function open() {
    setFullscreen(true);
    // Tenta usar a Fullscreen API de verdade (ideal para projetor/monitor).
    // Se falhar, o overlay CSS já cobre a tela como fallback.
    requestAnimationFrame(() => {
      overlayRef.current?.requestFullscreen?.().catch(() => {});
    });
  }

  function close() {
    setFullscreen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  useEffect(() => {
    if (!fullscreen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onFsChange() {
      // Usuário saiu do fullscreen nativo (Esc/F11) — sincroniza o estado.
      if (!document.fullscreenElement) setFullscreen(false);
    }

    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [fullscreen]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrDataUrl} alt="QR Code do evento" className="w-56 h-56" />

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={open}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Ver em tela cheia
        </button>
        <a
          href={qrDataUrl}
          download={`qrcode-${publicId}.png`}
          className="text-sm font-medium text-brand hover:underline"
        >
          Baixar QR Code
        </a>
      </div>

      {fullscreen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-6"
        >
          <button
            onClick={close}
            className="absolute right-6 top-6 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Fechar (Esc)
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR Code do evento em tela cheia"
            className="h-auto w-auto"
            style={{ width: "min(80vh, 80vw)", height: "min(80vh, 80vw)" }}
          />
          <p className="mt-6 break-all text-center text-lg font-medium text-slate-700">
            {publicUrl}
          </p>
        </div>
      )}
    </div>
  );
}
