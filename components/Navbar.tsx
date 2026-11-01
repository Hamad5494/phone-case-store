"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Smartphone } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { itemCount, hydrated } = useCart();
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <Smartphone className="h-5 w-5" />
          </span>
          CaseCraft
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-slate-600 transition hover:text-indigo-600">
            Shop
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart with ${hydrated ? itemCount : 0} items`}
            className="relative flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-indigo-600"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart
            {hydrated && itemCount > 0 && (
              <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
