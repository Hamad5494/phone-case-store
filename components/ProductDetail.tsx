"use client";

import { useMemo, useState } from "react";
import CaseImage from "@/components/CaseImage";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Minus, Plus, ShoppingBag, XCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import type { ProductDTO } from "@/types";

const LOW_STOCK = 5;

export default function ProductDetail({ product }: { product: ProductDTO }) {
  const { addToCart, getQuantity } = useCart();

  const brands = useMemo(() => Array.from(new Set(product.variants.map((v) => v.phoneModel.brand))).sort(), [product]);
  const caseTypes = useMemo(() => Array.from(new Set(product.variants.map((v) => v.caseType))), [product]);

  const [brand, setBrand] = useState(brands[0] ?? "");
  const [modelId, setModelId] = useState(() => product.variants.find((v) => v.phoneModel.brand === (brands[0] ?? ""))?.phoneModel.id ?? "");
  const [caseType, setCaseType] = useState(caseTypes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Models available for the chosen brand (unique).
  const models = useMemo(() => {
    const map = new Map<string, { id: string; name: string; series: string; sortOrder: number }>();
    for (const v of product.variants) {
      if (v.phoneModel.brand === brand) {
        map.set(v.phoneModel.id, {
          id: v.phoneModel.id,
          name: v.phoneModel.name,
          series: v.phoneModel.series,
          sortOrder: v.phoneModel.sortOrder,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [product, brand]);

  // Group models by series (iPhone 15 series, Galaxy S24 series, ...) for the dropdown.
  const modelGroups = useMemo(() => {
    const groups: { series: string; items: { id: string; name: string }[] }[] = [];
    for (const m of models) {
      const last = groups[groups.length - 1];
      if (last && last.series === m.series) last.items.push(m);
      else groups.push({ series: m.series, items: [m] });
    }
    return groups;
  }, [models]);

  // Exact variant lookup from the three selections.
  const variant = useMemo(
    () => product.variants.find((v) => v.phoneModel.id === modelId && v.caseType === caseType) ?? null,
    [product, modelId, caseType]
  );

  const inCart = variant ? getQuantity(variant.id) : 0;
  const remaining = variant ? Math.max(variant.stock - inCart, 0) : 0;
  const outOfStock = !variant || variant.stock === 0;
  const maxedOut = !!variant && variant.stock > 0 && remaining === 0;
  const canAdd = !!variant && remaining > 0;
  const safeQty = Math.min(quantity, Math.max(remaining, 1));

  const unitPrice = variant ? product.basePrice + variant.priceAdjustment : product.basePrice;
  const image = product.image; // design artwork; the camera cutout is drawn from the selected model
  const selectedModel = variant?.phoneModel ?? product.variants.find((v) => v.phoneModel.id === modelId)?.phoneModel;

  function onBrandChange(next: string) {
    setBrand(next);
    const first = product.variants.find((v) => v.phoneModel.brand === next);
    setModelId(first?.phoneModel.id ?? "");
    setQuantity(1);
    setJustAdded(false);
  }

  function handleAdd() {
    if (!variant || !canAdd) return;
    addToCart(
      {
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        brand: variant.phoneModel.brand,
        modelName: variant.phoneModel.name,
        caseType: variant.caseType,
        unitPrice,
        image,
        maxStock: variant.stock,
      },
      safeQty
    );
    setQuantity(1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 3000);
  }

  const selectClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
        <CaseImage art={image} modelName={selectedModel?.name} brand={selectedModel?.brand} alt={`${product.name} case for ${selectedModel?.name ?? "your phone"}`} className="h-full w-full" />
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-3xl font-extrabold text-indigo-600">{formatPrice(unitPrice)}</p>
          <p className="mt-4 leading-relaxed text-slate-600">{product.description}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Select Brand</span>
            <select value={brand} onChange={(e) => onBrandChange(e.target.value)} className={selectClass}>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Select Model</span>
            <select
              value={modelId}
              onChange={(e) => {
                setModelId(e.target.value);
                setQuantity(1);
                setJustAdded(false);
              }}
              className={selectClass}
            >
              {modelGroups.map((g) => (
                <optgroup key={g.series} label={g.series}>
                  {g.items.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-semibold">Case Type</span>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Case type">
            {caseTypes.map((t) => {
              const v = product.variants.find((x) => x.phoneModel.id === modelId && x.caseType === t);
              const selected = t === caseType;
              const soldOut = !v || v.stock === 0;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setCaseType(t);
                    setQuantity(1);
                    setJustAdded(false);
                  }}
                  className={`rounded-xl border-2 px-5 py-3 text-left text-sm transition ${
                    selected ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
                >
                  <span className="block font-bold">{t}</span>
                  <span className="block text-xs text-slate-500">
                    {v ? (v.priceAdjustment > 0 ? `+${formatPrice(v.priceAdjustment)}` : "Included") : "Unavailable"}
                    {soldOut && v ? " · Sold out" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live stock alert */}
        <div aria-live="polite">
          {!variant ? (
            <Alert tone="red" icon={<XCircle className="h-5 w-5" />}>
              This combination isn&apos;t available.
            </Alert>
          ) : variant.stock === 0 ? (
            <Alert tone="red" icon={<XCircle className="h-5 w-5" />}>
              Out of stock for {variant.phoneModel.name} ({variant.caseType}).
            </Alert>
          ) : variant.stock <= LOW_STOCK ? (
            <Alert tone="amber" icon={<AlertTriangle className="h-5 w-5" />}>
              Hurry! Only {variant.stock} left in stock.
            </Alert>
          ) : (
            <Alert tone="green" icon={<CheckCircle2 className="h-5 w-5" />}>
              In stock ({variant.stock} available). Ships within 24 hours.
            </Alert>
          )}
          {maxedOut && (
            <p className="mt-2 text-sm text-amber-700">You already have the maximum available quantity in your cart.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-xl border border-slate-300 bg-white">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={!canAdd || safeQty <= 1}
              onClick={() => setQuantity(safeQty - 1)}
              className="p-3 disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-bold" aria-live="polite">
              {safeQty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={!canAdd || safeQty >= remaining}
              onClick={() => setQuantity(safeQty + 1)}
              className="p-3 disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            <ShoppingBag className="h-5 w-5" />
            {outOfStock ? "Out of Stock" : maxedOut ? "Max in Cart" : `Add to Cart · ${formatPrice(unitPrice * safeQty)}`}
          </button>
        </div>

        {justAdded && (
          <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800" role="status">
            <span>Added to your cart.</span>
            <Link href="/cart" className="font-bold underline">
              View cart
            </Link>
          </div>
        )}

        {variant && <p className="text-xs text-slate-400">SKU: {variant.sku}</p>}
      </div>
    </div>
  );
}

function Alert({ tone, icon, children }: { tone: "red" | "amber" | "green"; icon: React.ReactNode; children: React.ReactNode }) {
  const styles = {
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-800",
    green: "bg-green-50 text-green-800",
  }[tone];
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${styles}`}>
      {icon}
      {children}
    </div>
  );
}
