import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/adminHelpers";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  description: z.string().trim().min(5, "Please add a short description").max(500),
  /** price in rupees as typed by the admin */
  basePriceRs: z.number().min(1, "Price must be at least Rs 1").max(1000000),
  image: z.string().trim().min(1, "Choose an image").max(200),
  createVariants: z.boolean().optional(),
  initialStock: z.number().int().min(0).max(10000).optional(),
});

const CASE_TYPES = [
  { name: "Slim", priceAdjustment: 0, code: "SLM" },
  { name: "Tough", priceAdjustment: 50000, code: "TGH" },
];

export async function POST(req: Request) {
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const { name, description, basePriceRs, image, createVariants, initialStock = 10 } = parsed.data;

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: { name, description, basePrice: Math.round(basePriceRs * 100), image },
      });

      if (createVariants) {
        const models = await tx.phoneModel.findMany({ orderBy: { sortOrder: "asc" } });
        const slug = slugify(name).toUpperCase();
        const clash = await tx.variant.count({ where: { sku: { startsWith: `${slug}-` } } });
        const suffix = clash > 0 ? `-${created.id.slice(-4).toUpperCase()}` : "";
        await tx.variant.createMany({
          data: models.flatMap((m) =>
            CASE_TYPES.map((c) => ({
              productId: created.id,
              phoneModelId: m.id,
              caseType: c.name,
              sku: `${slug}-${slugify(m.name).toUpperCase()}-${c.code}${suffix}`,
              stock: initialStock,
              priceAdjustment: c.priceAdjustment + (/Pro Max|Ultra/.test(m.name) ? 20000 : 0),
            }))
          ),
        });
      }
      return created;
    });
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/products failed", err);
    return NextResponse.json({ error: "Could not create product" }, { status: 500 });
  }
}
