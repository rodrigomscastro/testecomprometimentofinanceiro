"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-sm font-medium text-slate-500 hover:text-slate-800"
    >
      Sair
    </button>
  );
}
