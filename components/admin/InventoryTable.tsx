"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type InventoryRowData = {
  id: string;
  sku: string;
  product: string;
  phone: string;
  caseType: string;
  stock: number;
  priceAdjustmentRs: number;
};

function Row({ row }: { row: InventoryRowData }) {
  const router = useRouter();
  const [stock, setStock] = useState(String(row.stock));
  const [adj, setAdj] = useState(String(row.priceAdjustmentRs));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const dirty = stock !== String(row.stock) || adj !== String(row.priceAdjustmentRs);

  async function save() {
    const s = Number(stock);
    const a = Number(adj);
    if (!Number.isInteger(s) || s < 0 || Number.isNaN(a)) {
      setState("error");
      return;
    }
    setState("saving");
    const res = await fetch(`/api/admin/variants/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: s, priceAdjustment: Math.round(a * 100) }),
    });
    if (res.ok) {
      setState("saved");
      router.refresh();
      setTimeout(() => setState("idle"), 1500);
    } else {
      setState("error");
    }
  }

  const n = Number(stock);
  const badge = n === 0 ? "bg-rose-100 text-rose-800" : n <= 5 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800";

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-2.5">
        <p className="font-semibold">{row.product}</p>
        <p className="font-mono text-[10px] text-slate-400">{row.sku}</p>
      </td>
      <td className="px-4 py-2.5">{row.phone}</td>
      <td className="px-4 py-2.5">{row.caseType}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge}`}>{n === 0 ? "OUT" : n <= 5 ? "LOW" : "OK"}</span>
        </div>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-slate-400">Rs</span>
          <input
            type="number"
            value={adj}
            onChange={(e) => setAdj(e.target.value)}
            className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
        </div>
      </td>
      <td className="px-4 py-2.5 text-right">
        <button
          onClick={save}
          disabled={!dirty || state === "saving"}
          className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-30"
        >
          {state === "saving" ? "..." : "Save"}
        </button>
        {state === "saved" && <span className="ml-2 text-xs font-semibold text-emerald-600">Saved</span>}
        {state === "error" && <span className="ml-2 text-xs font-semibold text-rose-600">Error</span>}
      </td>
    </tr>
  );
}

export default function InventoryTable({ rows }: { rows: InventoryRowData[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Product / SKU</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Case</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Price adjustment</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Nothing matches these filters.</td>
            </tr>
          )}
          {rows.map((r) => (
            <Row key={`${r.id}-${r.stock}-${r.priceAdjustmentRs}`} row={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
