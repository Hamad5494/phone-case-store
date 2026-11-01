import { prisma } from "@/lib/prisma";
import type { ProductDTO } from "@/types";

const include = {
  variants: {
    include: { phoneModel: true },
    orderBy: [{ phoneModel: { sortOrder: "asc" as const } }, { caseType: "asc" as const }],
  },
};

export async function getAllProducts(): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({ include, orderBy: { createdAt: "asc" } });
  return rows as unknown as ProductDTO[];
}

export async function getProductById(id: string): Promise<ProductDTO | null> {
  const row = await prisma.product.findUnique({ where: { id }, include });
  return row as unknown as ProductDTO | null;
}
