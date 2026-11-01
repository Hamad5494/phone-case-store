import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ProductDetail from "@/components/ProductDetail";
import { getProductById } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600">
        <ChevronLeft className="h-4 w-4" /> Back to collection
      </Link>
      <ProductDetail product={product} />
    </div>
  );
}
