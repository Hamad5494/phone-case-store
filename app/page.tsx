import { ShieldCheck, Truck, Palette } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <>
      <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="mb-3 inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
            New collection
          </p>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-6xl">
            Cases that fit your phone and your style.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-indigo-100">
            Precision-fit cases for every iPhone from 11 to 18 and every Galaxy S from S20 to S26, in Slim or Tough.
          </p>
          <a
            href="#collection"
            className="mt-8 inline-block rounded-full bg-white px-7 py-3 font-bold text-indigo-700 shadow-lg transition hover:scale-105"
          >
            Shop the collection
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-3 sm:px-6">
        {[
          { icon: Palette, title: "One design, every phone", text: "Each artwork is available for multiple iPhone and Galaxy models." },
          { icon: ShieldCheck, title: "Drop protection", text: "Raised edges and shock-absorbing corners on every case." },
          { icon: Truck, title: "Fast dispatch", text: "In-stock cases ship within 24 hours." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <Icon className="h-6 w-6 shrink-0 text-indigo-600" />
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="text-sm text-slate-600">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-extrabold">Find your phone</h2>
          <p className="mb-4 text-sm text-slate-600">Every design is available for all of these models.</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16", "iPhone 17", "iPhone 18 Pro"].map((s) => (
              <span key={s} className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">{s} series</span>
            ))}
            {["S20", "S21", "S22", "S23", "S24", "S25", "S26"].map((s) => (
              <span key={s} className="rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-700">Galaxy {s} series</span>
            ))}
          </div>
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="mb-8 text-3xl font-extrabold">The collection</h2>
        {products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No products yet. Run <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run setup</code> to seed the database.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
