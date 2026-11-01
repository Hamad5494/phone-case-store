"use client";

import { useState } from "react";
import CaseImage from "@/components/CaseImage";
import Link from "next/link";
import { CheckCircle2, Loader2, Minus, Plus, ShoppingBag, Trash2, XCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";

type PlacedOrder = {
  id: string;
  customerName: string;
  email: string;
  totalCents: number;
  items: { id: string; productName: string; phoneModelName: string; caseType: string; quantity: number; unitPriceCents: number }[];
};

export default function CartPage() {
  const { items, hydrated, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  async function placeOrder() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          email,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setOrder(data.order as PlacedOrder);
      clearCart();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-green-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-3xl font-extrabold">Order placed!</h1>
          <p className="mt-2 text-slate-600">
            Thanks, {order.customerName}. A confirmation would be sent to {order.email}.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Order ID: <span className="font-mono font-semibold">{order.id}</span>
          </p>
          <ul className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-100 text-left text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 p-3">
                <span>
                  {i.quantity} × {i.productName} <span className="text-slate-500">({i.phoneModelName}, {i.caseType})</span>
                </span>
                <span className="font-semibold">{formatPrice(i.unitPriceCents * i.quantity)}</span>
              </li>
            ))}
            <li className="flex justify-between bg-slate-50 p-3 font-extrabold">
              <span>Total paid</span>
              <span>{formatPrice(order.totalCents)}</span>
            </li>
          </ul>
          <Link href="/" className="mt-8 inline-block rounded-full bg-indigo-600 px-7 py-3 font-bold text-white hover:bg-indigo-700">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="grid place-items-center py-32 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-14 w-14 text-slate-300" />
        <h1 className="mt-4 text-2xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-slate-600">Find the perfect case for your phone.</p>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <Link href="/" className="mt-6 inline-block rounded-full bg-indigo-600 px-7 py-3 font-bold text-white hover:bg-indigo-700">
          Browse cases
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
  const formValid = customerName.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(email.trim());

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Your cart</h1>
        <button onClick={clearCart} className="text-sm font-medium text-slate-500 hover:text-red-600">
          Clear cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={i.variantId} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <CaseImage art={i.image} modelName={i.modelName} brand={i.brand} alt={`${i.productName} for ${i.modelName}`} className="h-full w-full" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link href={`/products/${i.productId}`} className="font-bold hover:text-indigo-600">
                      {i.productName}
                    </Link>
                    <p className="text-sm text-slate-500">
                      {i.brand} {i.modelName} · {i.caseType}
                    </p>
                    <p className="text-sm text-slate-500">{formatPrice(i.unitPrice)} each</p>
                  </div>
                  <button onClick={() => removeFromCart(i.variantId)} aria-label={`Remove ${i.productName}`} className="self-start p-1 text-slate-400 hover:text-red-600">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-slate-300">
                    <button aria-label="Decrease quantity" onClick={() => updateQuantity(i.variantId, i.quantity - 1)} className="p-2">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{i.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      disabled={i.quantity >= i.maxStock}
                      onClick={() => updateQuantity(i.variantId, i.quantity + 1)}
                      className="p-2 disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-extrabold">{formatPrice(i.unitPrice * i.quantity)}</span>
                </div>
                {i.quantity >= i.maxStock && <p className="mt-1 text-xs text-amber-700">Maximum available quantity reached.</p>}
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-extrabold">Order summary</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Shipping</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-extrabold">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <input className={inputClass} placeholder="Full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} autoComplete="name" />
            <input className={inputClass} placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={placeOrder}
            disabled={loading || !formValid}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {loading ? "Placing order…" : "Place Test Order"}
          </button>
          <p className="text-center text-xs text-slate-400">Test mode: no payment is taken.</p>
        </aside>
      </div>
    </div>
  );
}
