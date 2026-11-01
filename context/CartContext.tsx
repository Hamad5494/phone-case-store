"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { CartItem } from "@/types";

const STORAGE_KEY = "phone-case-store:cart:v2";

type Action =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; variantId: string }
  | { type: "UPDATE"; variantId: string; quantity: number }
  | { type: "CLEAR" };

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "HYDRATE":
      return action.items;
    case "ADD": {
      const existing = state.find((i) => i.variantId === action.item.variantId);
      if (existing) {
        const quantity = Math.min(existing.quantity + action.item.quantity, action.item.maxStock);
        return state.map((i) =>
          i.variantId === existing.variantId ? { ...i, quantity, maxStock: action.item.maxStock, unitPrice: action.item.unitPrice } : i
        );
      }
      return [...state, { ...action.item, quantity: Math.min(action.item.quantity, action.item.maxStock) }];
    }
    case "REMOVE":
      return state.filter((i) => i.variantId !== action.variantId);
    case "UPDATE":
      if (action.quantity <= 0) return state.filter((i) => i.variantId !== action.variantId);
      return state.map((i) =>
        i.variantId === action.variantId ? { ...i, quantity: Math.min(action.quantity, i.maxStock) } : i
      );
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number; // cents
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getQuantity: (variantId: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(x: unknown): x is CartItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.variantId === "string" &&
    typeof o.quantity === "number" &&
    typeof o.unitPrice === "number" &&
    typeof o.productName === "string" &&
    typeof o.maxStock === "number"
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [hydrated, setHydrated] = useState(false);

  // Load once on the client (avoids SSR hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) dispatch({ type: "HYDRATE", items: parsed.filter(isCartItem) });
      }
    } catch {
      /* corrupted storage: start with an empty cart */
    }
    setHydrated(true);
  }, []);

  // Persist on every change (after the initial load so we never overwrite saved data with []).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked */
    }
  }, [items, hydrated]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        const parsed: unknown = e.newValue ? JSON.parse(e.newValue) : [];
        if (Array.isArray(parsed)) dispatch({ type: "HYDRATE", items: parsed.filter(isCartItem) });
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    if (item.maxStock <= 0 || quantity <= 0) return;
    dispatch({ type: "ADD", item: { ...item, quantity } });
  }, []);
  const removeFromCart = useCallback((variantId: string) => dispatch({ type: "REMOVE", variantId }), []);
  const updateQuantity = useCallback(
    (variantId: string, quantity: number) => dispatch({ type: "UPDATE", variantId, quantity }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      itemCount: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getQuantity: (variantId: string) => items.find((i) => i.variantId === variantId)?.quantity ?? 0,
    }),
    [items, hydrated, addToCart, removeFromCart, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
