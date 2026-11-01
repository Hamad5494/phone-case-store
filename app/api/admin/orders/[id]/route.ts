import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/adminHelpers";

export const dynamic = "force-dynamic";

const schema = z.object({ status: z.enum(ORDER_STATUSES) });

/** Change an order's status. Cancelling an order puts its items back into stock. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const next = parsed.data.status;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: params.id }, include: { items: true } });
      if (!order) return { code: 404 as const, error: "Order not found" };
      if (order.status === next) return { code: 200 as const, order };
      if (order.status === "CANCELLED") {
        return { code: 409 as const, error: "A cancelled order can't be reopened (its stock was already returned)." };
      }
      if (next === "CANCELLED") {
        for (const item of order.items) {
          await tx.variant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
        }
      }
      const updated = await tx.order.update({ where: { id: order.id }, data: { status: next } });
      return { code: 200 as const, order: updated };
    });

    if (result.code !== 200) return NextResponse.json({ error: result.error }, { status: result.code });
    return NextResponse.json({ success: true, order: result.order });
  } catch (err) {
    console.error("PATCH /api/admin/orders failed", err);
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }
}
