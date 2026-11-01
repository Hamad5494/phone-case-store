"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES } from "@/lib/adminHelpers";

export default function OrderStatusControl({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const locked = status === "CANCELLED";

  async function save() {
    if (value === "CANCELLED" && !confirm("Cancel this order? The items will be returned to stock.")) return;
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Status updated." });
      router.refresh();
    } else {
      setMsg({ ok: false, text: data.error ?? "Something went wrong." });
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={value}
          disabled={locked}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:bg-slate-100"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={save}
          disabled={busy || locked || value === status}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          {busy ? "Saving..." : "Update status"}
        </button>
      </div>
      {locked && <p className="mt-2 text-xs text-slate-500">Cancelled orders can't be reopened (stock was already returned).</p>}
      {msg && <p className={`mt-2 text-sm font-medium ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}>{msg.text}</p>}
    </div>
  );
}
