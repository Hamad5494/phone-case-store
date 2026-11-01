import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  stock: z.number().int().min(0).max(100000),
  /** cents (paisa) added to the product base price */
  priceAdjustment: z.number().int().min(-10000000).max(10000000),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  try {
    const variant = await prisma.variant.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json({ success: true, variant });
  } catch {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }
}
