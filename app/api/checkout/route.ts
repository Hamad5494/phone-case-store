import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

class StockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StockError";
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { customerName, email, items } = parsed.data;

  // Merge duplicate variant lines so stock is checked against the combined quantity.
  const merged = new Map<string, number>();
  for (const i of items) merged.set(i.variantId, (merged.get(i.variantId) ?? 0) + i.quantity);

  try {
    const order = await prisma.$transaction(async (tx) => {
      let totalCents = 0;
      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const [variantId, quantity] of merged) {
        const variant = await tx.variant.findUnique({
          where: { id: variantId },
          include: { product: true, phoneModel: true },
        });
        if (!variant) throw new StockError("An item in your cart is no longer available.");

        const label = `${variant.product.name} (${variant.phoneModel.name}, ${variant.caseType})`;
        if (variant.stock < quantity) {
          throw new StockError(
            variant.stock === 0
              ? `${label} is out of stock.`
              : `Only ${variant.stock} of ${label} left, but you requested ${quantity}.`
          );
        }

        // Atomic guard: only decrement if enough stock still exists at write time.
        const updated = await tx.variant.updateMany({
          where: { id: variantId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (updated.count !== 1) {
          throw new StockError(`${label} just sold out. Please update your cart.`);
        }

        const unitPriceCents = variant.product.basePrice + variant.priceAdjustment; // server-side pricing
        totalCents += unitPriceCents * quantity;
        orderItems.push({
          variant: { connect: { id: variantId } },
          quantity,
          unitPriceCents,
          productName: variant.product.name,
          phoneModelName: variant.phoneModel.name,
          phoneBrand: variant.phoneModel.brand,
          caseType: variant.caseType,
        });
      }

      return tx.order.create({
        data: { customerName, email, totalCents, status: "PAID", items: { create: orderItems } },
        include: { items: true },
      });
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err) {
    if (err instanceof StockError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 409 });
    }
    console.error("POST /api/checkout failed", err);
    return NextResponse.json({ success: false, error: "Checkout failed. Please try again." }, { status: 500 });
  }
}
