import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  description: z.string().trim().min(5, "Please add a short description").max(500),
  basePriceRs: z.number().min(1, "Price must be at least Rs 1").max(1000000),
  image: z.string().trim().min(1, "Choose an image").max(200),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const { basePriceRs, ...rest } = parsed.data;
  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { ...rest, basePrice: Math.round(basePriceRs * 100) },
    });
    return NextResponse.json({ success: true, product });
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ordered = await prisma.orderItem.count({ where: { variant: { productId: params.id } } });
  if (ordered > 0) {
    return NextResponse.json(
      { error: "This product has past orders, so it can't be deleted. Set its stock to 0 in Inventory instead." },
      { status: 409 }
    );
  }
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not delete product" }, { status: 500 });
  }
}
