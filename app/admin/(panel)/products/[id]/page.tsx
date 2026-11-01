import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { listCaseImages } from "@/lib/caseImages";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600">
        <ChevronLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="text-3xl font-extrabold">Edit {product.name}</h1>
      <ProductForm
        mode="edit"
        images={listCaseImages()}
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          basePriceRs: product.basePrice / 100,
          image: product.image,
        }}
      />
    </div>
  );
}
