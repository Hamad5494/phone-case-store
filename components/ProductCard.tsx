import Link from "next/link";
import CaseImage from "@/components/CaseImage";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { ProductDTO } from "@/types";

export default function ProductCard({ product }: { product: ProductDTO }) {
  const models = new Set(product.variants.map((v) => v.phoneModel.id)).size;
  const brands = Array.from(new Set(product.variants.map((v) => v.phoneModel.brand)));
  const totalStock = product.variants.reduce((n, v) => n + v.stock, 0);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <CaseImage
          art={product.image}
          alt={product.name}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        {totalStock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        <p className="text-xs font-medium text-indigo-600">
          Fits {models} models · {brands.join(" & ")}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-extrabold">From {formatPrice(product.basePrice)}</span>
          <span className="flex items-center gap-1 text-sm font-semibold text-indigo-600">
            Customize <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
