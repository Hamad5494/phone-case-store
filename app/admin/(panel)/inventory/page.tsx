import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK_LIMIT } from "@/lib/adminHelpers";
import InventoryTable from "@/components/admin/InventoryTable";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 25;

type SP = { q?: string; product?: string; filter?: string; page?: string };

export default async function InventoryPage({ searchParams }: { searchParams: SP }) {
  const q = (searchParams.q ?? "").trim();
  const productId = searchParams.product ?? "";
  const filter = searchParams.filter === "low" || searchParams.filter === "out" ? searchParams.filter : "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where = {
    ...(productId ? { productId } : {}),
    ...(filter === "out" ? { stock: 0 } : filter === "low" ? { stock: { lte: LOW_STOCK_LIMIT } } : {}),
    ...(q ? { OR: [{ sku: { contains: q } }, { phoneModel: { name: { contains: q } } }] } : {}),
  };

  const [total, variants, products] = await Promise.all([
    prisma.variant.count({ where }),
    prisma.variant.findMany({
      where,
      orderBy: filter ? [{ stock: "asc" }, { sku: "asc" }] : [{ product: { name: "asc" } }, { phoneModel: { sortOrder: "asc" } }, { caseType: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { product: { select: { name: true } }, phoneModel: { select: { name: true } } },
    }),
    prisma.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (productId) params.set("product", productId);
    if (filter) params.set("filter", filter);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/admin/inventory${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold">Inventory</h1>
        <p className="text-slate-500">Edit stock and price adjustments per variant (design x phone x case type).</p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <label className="text-xs font-semibold text-slate-500">
          Search
          <input name="q" defaultValue={q} placeholder="SKU or phone model" className="mt-1 block w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
        </label>
        <label className="text-xs font-semibold text-slate-500">
          Product
          <select name="product" defaultValue={productId} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900">
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-500">
          Stock level
          <select name="filter" defaultValue={filter} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900">
            <option value="">All</option>
            <option value="low">Low or sold out (5 or fewer)</option>
            <option value="out">Sold out only</option>
          </select>
        </label>
        <button className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-600">Apply</button>
        <Link href="/admin/inventory" className="py-2 text-sm font-semibold text-slate-500 hover:underline">Reset</Link>
      </form>

      <p className="text-sm text-slate-500">{total} variant(s) · page {Math.min(page, pages)} of {pages}</p>

      <InventoryTable
        rows={variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          product: v.product.name,
          phone: v.phoneModel.name,
          caseType: v.caseType,
          stock: v.stock,
          priceAdjustmentRs: v.priceAdjustment / 100,
        }))}
      />

      <div className="flex items-center justify-between">
        {page > 1 ? <Link href={link(page - 1)} className="rounded-lg bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-slate-50">Previous</Link> : <span />}
        {page < pages ? <Link href={link(page + 1)} className="rounded-lg bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-slate-50">Next</Link> : <span />}
      </div>
    </div>
  );
}
