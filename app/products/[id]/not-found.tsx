import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold">Case not found</h1>
      <p className="mt-2 text-slate-600">That product doesn&apos;t exist or has been removed.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white">
        Back to shop
      </Link>
    </div>
  );
}
