"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Boxes, Store, LogOut } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
];

export default function AdminNav() {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="shrink-0 border-b border-slate-800 bg-slate-900 text-slate-200 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-5 py-4 md:block">
        <p className="text-lg font-extrabold text-white">CaseCraft</p>
        <p className="text-xs uppercase tracking-widest text-slate-400">Admin panel</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 md:mt-4"
        >
          <Store className="h-4 w-4" /> View store
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-300 hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </nav>
    </aside>
  );
}
