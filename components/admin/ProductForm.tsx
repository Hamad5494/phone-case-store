"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type Props = {
  mode: "create" | "edit";
  images: string[];
  product?: { id: string; name: string; description: string; basePriceRs: number; image: string };
};

export default function ProductForm({ mode, images, product }: Props) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(String(product?.basePriceRs ?? 1499));
  const [image, setImage] = useState(product?.image ?? images[0] ?? "");
  const [createVariants, setCreateVariants] = useState(true);
  const [initialStock, setInitialStock] = useState("10");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body: Record<string, unknown> = { name, description, basePriceRs: Number(price), image };
    if (mode === "create") {
      body.createVariants = createVariants;
      body.initialStock = Number(initialStock) || 0;
    }
    const res = await fetch(mode === "create" ? "/api/admin/products" : `/api/admin/products/${product!.id}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError(data.error ?? "Something went wrong.");
    }
  }

  async function remove() {
    if (!product || !confirm(`Delete "${product.name}" and all its variants? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError(data.error ?? "Could not delete.");
    }
  }

  const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <form onSubmit={submit} className="grid gap-6 md:grid-cols-[1fr_220px]">
      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold">
          Design name
          <input value={name} onChange={(e) => setName(e.target.value)} className={input} required />
        </label>
        <label className="block text-sm font-semibold">
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={input} required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Base price (Rs)
            <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} className={input} required />
          </label>
          <label className="block text-sm font-semibold">
            Artwork image
            <select value={image} onChange={(e) => setImage(e.target.value)} className={input}>
              {images.map((i) => (
                <option key={i} value={i}>{i.replace("/cases/", "")}</option>
              ))}
              {product && !images.includes(product.image) && <option value={product.image}>{product.image}</option>}
            </select>
          </label>
        </div>

        {mode === "create" && (
          <div className="rounded-xl bg-indigo-50 p-4 text-sm">
            <label className="flex items-center gap-2 font-semibold">
              <input type="checkbox" checked={createVariants} onChange={(e) => setCreateVariants(e.target.checked)} />
              Create variants for every phone model (Slim + Tough)
            </label>
            {createVariants && (
              <label className="mt-3 block font-semibold">
                Starting stock per variant
                <input type="number" min={0} value={initialStock} onChange={(e) => setInitialStock(e.target.value)} className={`${input} max-w-[160px]`} />
              </label>
            )}
            <p className="mt-2 text-xs text-slate-500">Without variants the product shows on the store but can't be bought.</p>
          </div>
        )}

        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button disabled={busy} className="rounded-lg bg-indigo-600 px-6 py-2.5 font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? "Saving..." : mode === "create" ? "Create product" : "Save changes"}
          </button>
          {mode === "edit" && (
            <button type="button" onClick={remove} disabled={busy} className="ml-auto flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="h-fit rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="Artwork preview" className="aspect-[300/640] w-full rounded-xl bg-slate-100 object-cover" />
      </div>
    </form>
  );
}
