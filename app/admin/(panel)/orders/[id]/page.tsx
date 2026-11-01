import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/adminHelpers";
import StatusBadge from "@/components/admin/StatusBadge";
import OrderStatusControl from "@/components/admin/OrderStatusControl";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600">
        <ChevronLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-extrabold">Customer</h2>
          <p className="font-semibold">{order.customerName}</p>
          <p className="text-sm text-slate-500">{order.email}</p>
          <p className="mt-3 text-xs text-slate-400">Placed {formatDate(order.createdAt)}</p>
          <p className="font-mono text-xs text-slate-400">ID: {order.id}</p>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-extrabold">Order status</h2>
          <OrderStatusControl orderId={order.id} status={order.status} />
        </section>
      </div>

      <section className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Item</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Case</th>
              <th className="px-5 py-3 text-right">Qty</th>
              <th className="px-5 py-3 text-right">Unit</th>
              <th className="px-5 py-3 text-right">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((i) => (
              <tr key={i.id}>
                <td className="px-5 py-3 font-semibold">{i.productName}</td>
                <td className="px-5 py-3">{i.phoneModelName}</td>
                <td className="px-5 py-3">{i.caseType}</td>
                <td className="px-5 py-3 text-right">{i.quantity}</td>
                <td className="px-5 py-3 text-right">{formatPrice(i.unitPriceCents)}</td>
                <td className="px-5 py-3 text-right font-bold">{formatPrice(i.unitPriceCents * i.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200">
              <td colSpan={5} className="px-5 py-3 text-right font-bold">Total</td>
              <td className="px-5 py-3 text-right text-lg font-extrabold">{formatPrice(order.totalCents)}</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
  );
}
