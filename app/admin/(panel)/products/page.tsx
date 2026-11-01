import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: { variants: { select: { stock: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Products</h1>
          <p className="text-slate-500">{products.length} case design(s)</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Design</th>
              <th className="px-5 py-3">Base price</th>
              <th className="px-5 py-3">Variants</th>
              <th className="px-5 py-3">Total stock</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">No products yet.</td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" className="h-16 w-8 rounded-md bg-slate-100 object-cover" />
                    <div>
                      <p className="font-bold">{p.name}</p>
                      <p className="line-clamp-1 max-w-sm text-xs text-slate-400">{p.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 font-semibold">{formatPrice(p.basePrice)}</td>
                <td className="px-5 py-3">{p.variants.length}</td>
                <td className="px-5 py-3">{p.variants.reduce((n, v) => n + v.stock, 0)}</td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/inventory?product=${p.id}`} className="mr-4 text-xs font-bold text-slate-500 hover:underline">Stock</Link>
                  <Link href={`/admin/products/${p.id}`} className="text-xs font-bold text-indigo-600 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
