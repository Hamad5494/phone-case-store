import Link from "next/link";
import { DollarSign, ShoppingCart, PackageCheck, AlertTriangle, Database } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { formatDate, LOW_STOCK_LIMIT } from "@/lib/adminHelpers";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

function Stat({ icon: Icon, label, value, hint, tone }: { icon: any; label: string; value: string; hint?: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 13);

  const notCancelled = { status: { not: "CANCELLED" } };

  const [
    orderCount,
    revenueAgg,
    itemsAgg,
    statusGroups,
    recentOrders,
    chartOrders,
    productCount,
    modelCount,
    variantCount,
    outCount,
    lowCount,
    lowList,
    topRows,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalCents: true }, where: notCancelled }),
    prisma.orderItem.aggregate({ _sum: { quantity: true }, where: { order: notCancelled } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { _count: { select: { items: true } } } }),
    prisma.order.findMany({ where: { createdAt: { gte: since }, ...notCancelled }, select: { createdAt: true, totalCents: true } }),
    prisma.product.count(),
    prisma.phoneModel.count(),
    prisma.variant.count(),
    prisma.variant.count({ where: { stock: 0 } }),
    prisma.variant.count({ where: { stock: { gt: 0, lte: LOW_STOCK_LIMIT } } }),
    prisma.variant.findMany({
      where: { stock: { lte: LOW_STOCK_LIMIT } },
      orderBy: { stock: "asc" },
      take: 8,
      include: { product: { select: { name: true } }, phoneModel: { select: { name: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      where: { order: notCancelled },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  // Revenue per day for the last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return { key: d.toDateString(), label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), total: 0 };
  });
  for (const o of chartOrders) {
    const day = days.find((d) => d.key === new Date(o.createdAt).toDateString());
    if (day) day.total += o.totalCents;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.total));
  const statusCount = (s: string) => statusGroups.find((g) => g.status === s)?._count._all ?? 0;
  const topMax = Math.max(1, ...topRows.map((r) => r._sum.quantity ?? 0));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Dashboard</h1>
        <p className="text-slate-500">How the store is doing right now.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={DollarSign} tone="bg-emerald-100 text-emerald-700" label="Total revenue" value={formatPrice(revenueAgg._sum.totalCents ?? 0)} hint="Excludes cancelled orders" />
        <Stat icon={ShoppingCart} tone="bg-indigo-100 text-indigo-700" label="Orders" value={String(orderCount)} hint={`${statusCount("PENDING")} pending · ${statusCount("PAID")} to ship`} />
        <Stat icon={PackageCheck} tone="bg-sky-100 text-sky-700" label="Cases sold" value={String(itemsAgg._sum.quantity ?? 0)} />
        <Stat icon={AlertTriangle} tone="bg-rose-100 text-rose-700" label="Stock alerts" value={String(outCount + lowCount)} hint={`${outCount} sold out · ${lowCount} low`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-1 text-lg font-extrabold">Revenue, last 14 days</h2>
          <p className="mb-4 text-xs text-slate-400">Highest day: {formatPrice(maxDay === 1 ? 0 : maxDay)}</p>
          <div className="flex h-48 items-end gap-1.5">
            {days.map((d) => (
              <div key={d.key} className="group flex h-full flex-1 flex-col items-center justify-end" title={`${d.label}: ${formatPrice(d.total)}`}>
                <div
                  className="w-full rounded-t-md bg-indigo-500 transition group-hover:bg-indigo-700"
                  style={{ height: `${Math.max(d.total > 0 ? 4 : 1, (d.total / maxDay) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5 text-[10px] text-slate-400">
            {days.map((d, i) => (
              <span key={d.key} className="flex-1 text-center">
                {i % 2 === 0 ? d.label : ""}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold">Best sellers</h2>
          {topRows.length === 0 ? (
            <p className="text-sm text-slate-500">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {topRows.map((r) => (
                <li key={r.productName}>
                  <div className="mb-1 flex justify-between text-sm font-semibold">
                    <span>{r.productName}</span>
                    <span className="text-slate-500">{r._sum.quantity} sold</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-fuchsia-500" style={{ width: `${((r._sum.quantity ?? 0) / topMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-indigo-600 hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{o.customerName}</p>
                      <p className="text-xs text-slate-400">{formatDate(o.createdAt)} · {o._count.items} line(s)</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={o.status} />
                      <span className="w-24 text-right font-bold">{formatPrice(o.totalCents)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Needs restocking</h2>
            <Link href="/admin/inventory?filter=low" className="text-sm font-semibold text-indigo-600 hover:underline">Manage</Link>
          </div>
          {lowList.length === 0 ? (
            <p className="text-sm text-slate-500">Everything is well stocked.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lowList.map((v) => (
                <li key={v.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{v.product.name}</p>
                    <p className="text-xs text-slate-400">{v.phoneModel.name} · {v.caseType}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${v.stock === 0 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
                    {v.stock === 0 ? "Sold out" : `${v.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
          <Database className="h-5 w-5 text-slate-500" /> Database overview
        </h2>
        <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-5">
          {[
            ["Products", productCount],
            ["Phone models", modelCount],
            ["Variants", variantCount],
            ["Orders", orderCount],
            ["Order lines", (await prisma.orderItem.count())],
          ].map(([label, n]) => (
            <div key={label as string} className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-extrabold">{n}</p>
              <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
