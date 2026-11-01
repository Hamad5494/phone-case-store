import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { listCaseImages } from "@/lib/caseImages";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600">
        <ChevronLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="text-3xl font-extrabold">Add product</h1>
      <p className="text-sm text-slate-500">To use new artwork, put an SVG/PNG file in <code className="rounded bg-white px-1.5 py-0.5">public/cases</code> and it will appear in the list.</p>
      <ProductForm mode="create" images={listCaseImages()} />
    </div>
  );
}
