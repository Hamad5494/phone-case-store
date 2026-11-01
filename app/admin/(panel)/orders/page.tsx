import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { formatDate, ORDER_STATUSES } from "@/lib/adminHelpers";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const status = ORDER_STATUSES.find((s) => s === searchParams.status);
  const q = (searchParams.q ?? "").trim();

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? { OR: [{ customerName: { contains: q } }, { email: { contains: q } }, { id: { contains: q } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { items: { select: { quantity: true } } },
  });

  const tab = (label: string, value?: string) => {
    const active = (status ?? "") === (value ?? "");
    const href = `/admin/orders${value || q ? "?" : ""}${[value ? `status=${value}` : "", q ? `q=${encodeURIComponent(q)}` : ""].filter(Boolean).join("&")}`;
    return (
      <Link key={label} href={href} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${active ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-200"}`}>
        {label}
      </Link>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold">Orders</h1>
        <p className="text-slate-500">{orders.length} order(s) shown</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tab("All")}
        {ORDER_STATUSES.map((s) => tab(s[0] + s.slice(1).toLowerCase(), s))}
        <form className="ml-auto flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, email or order ID"
            className="w-64 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
          />
          <button className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-indigo-700">Search</button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">No orders found.</td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-xs">
                  <Link href={`/admin/orders/${o.id}`} className="font-bold text-indigo-600 hover:underline">#{o.id.slice(-8).toUpperCase()}</Link>
                </td>
                <td className="px-5 py-3">
                  <p className="font-semibold">{o.customerName}</p>
                  <p className="text-xs text-slate-400">{o.email}</p>
                </td>
                <td className="px-5 py-3 text-slate-500">{formatDate(o.createdAt)}</td>
                <td className="px-5 py-3">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-5 py-3 text-right font-bold">{formatPrice(o.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
