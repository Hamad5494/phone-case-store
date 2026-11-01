import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ products });
  } catch (err) {
    console.error("GET /api/products failed", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
