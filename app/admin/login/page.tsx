"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Wrong password. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-900 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-white">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-extrabold">Admin login</h1>
        <p className="mb-6 text-sm text-slate-500">CaseCraft store management</p>
        <label className="mb-1 block text-sm font-semibold" htmlFor="pw">
          Password
        </label>
        <input
          id="pw"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
        <button
          disabled={busy || !password}
          className="mt-5 w-full rounded-lg bg-indigo-600 py-2.5 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
