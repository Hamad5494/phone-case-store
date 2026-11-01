// prisma/seed.ts
// Run with: npm run setup   (or: npx prisma db seed)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedModel = { brand: "Apple" | "Samsung"; series: string; name: string };

/** Series -> model names, in release order (this order is what shoppers see in the dropdown). */
const apple: [string, string[]][] = [
  ["iPhone 11 series", ["iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max"]],
  ["iPhone 12 series", ["iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max"]],
  ["iPhone 13 series", ["iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max"]],
  ["iPhone 14 series", ["iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max"]],
  ["iPhone 15 series", ["iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max"]],
  ["iPhone 16 series", ["iPhone 16e", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max"]],
  ["iPhone 17 series", ["iPhone 17e", "iPhone 17", "iPhone Air", "iPhone 17 Pro", "iPhone 17 Pro Max"]],
  ["iPhone 18 series", ["iPhone 18 Pro", "iPhone 18 Pro Max"]],
];

const samsung: [string, string[]][] = [
  ["Galaxy S20 series", ["Galaxy S20", "Galaxy S20+", "Galaxy S20 Ultra", "Galaxy S20 FE"]],
  ["Galaxy S21 series", ["Galaxy S21", "Galaxy S21+", "Galaxy S21 Ultra", "Galaxy S21 FE"]],
  ["Galaxy S22 series", ["Galaxy S22", "Galaxy S22+", "Galaxy S22 Ultra"]],
  ["Galaxy S23 series", ["Galaxy S23", "Galaxy S23+", "Galaxy S23 Ultra", "Galaxy S23 FE"]],
  ["Galaxy S24 series", ["Galaxy S24", "Galaxy S24+", "Galaxy S24 Ultra", "Galaxy S24 FE"]],
  ["Galaxy S25 series", ["Galaxy S25", "Galaxy S25+", "Galaxy S25 Ultra", "Galaxy S25 Edge", "Galaxy S25 FE"]],
  ["Galaxy S26 series", ["Galaxy S26", "Galaxy S26+", "Galaxy S26 Ultra", "Galaxy S26 FE"]],
];

const phoneModels: SeedModel[] = [
  ...apple.flatMap(([series, names]) => names.map((name) => ({ brand: "Apple" as const, series, name }))),
  ...samsung.flatMap(([series, names]) => names.map((name) => ({ brand: "Samsung" as const, series, name }))),
];

const caseTypes = [
  { name: "Slim", priceAdjustment: 0, code: "SLM" },
  { name: "Tough", priceAdjustment: 50000, code: "TGH" },
];

const products = [
  {
    slug: "midnight-aurora",
    name: "Midnight Aurora",
    description:
      "Northern lights rippling over a dark mountain ridge. Matte, fingerprint-resistant back with raised edges that protect the screen and camera.",
    basePrice: 149900,
    image: "/cases/midnight-aurora.svg",
  },
  {
    slug: "terra-marble",
    name: "Terra Marble",
    description:
      "Warm terracotta marble with hand-drawn gold veining. Precision cutouts, tactile buttons and wireless-charging compatibility.",
    basePrice: 169900,
    image: "/cases/terra-marble.svg",
  },
  {
    slug: "neon-tokyo",
    name: "Neon Tokyo",
    description:
      "A magenta city skyline glowing under a pink moon. Scratch-resistant print, shock-absorbing corners and a slim pocket-friendly profile.",
    basePrice: 179900,
    image: "/cases/neon-tokyo.svg",
  },
  {
    slug: "ocean-wave",
    name: "Ocean Wave",
    description:
      "Layered waves from sea-foam to deep blue. A calm, clean design on a soft-touch finish that stays grippy in hand.",
    basePrice: 139900,
    image: "/cases/ocean-wave.svg",
  },
  {
    slug: "sunset-dunes",
    name: "Sunset Dunes",
    description:
      "Rolling desert dunes under a glowing sun. Warm gradients, vivid colours and a protective lip around the camera.",
    basePrice: 149900,
    image: "/cases/sunset-dunes.svg",
  },
  {
    slug: "botanical-sage",
    name: "Botanical Sage",
    description:
      "Hand-illustrated leaves on a sage-green background. Understated, natural and built with drop-tested corners.",
    basePrice: 159900,
    image: "/cases/botanical-sage.svg",
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Larger flagship phones need more material: +Rs 200 for Pro Max / Ultra / Plus-size models. */
function sizeSurcharge(modelName: string): number {
  return /Pro Max|Ultra/.test(modelName) ? 20000 : 0;
}

/** Deterministic pseudo-random stock: mostly healthy, a few low, a few sold out (for demos). */
function stockFor(seed: string): number {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const r = h % 100;
  if (r < 4) return 0; // ~4% sold out
  if (r < 14) return 1 + (h % 5); // ~10% low stock (1-5)
  return 8 + (h % 43); // 8-50
}

/** Small deterministic random generator so every reset gives the same demo data. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const sampleCustomers: [string, string][] = [
  ["Ayesha Khan", "ayesha.khan@example.com"],
  ["Hamza Ali", "hamza.ali@example.com"],
  ["Fatima Noor", "fatima.noor@example.com"],
  ["Bilal Ahmed", "bilal.ahmed@example.com"],
  ["Sana Malik", "sana.malik@example.com"],
  ["Usman Tariq", "usman.tariq@example.com"],
  ["Zainab Iqbal", "zainab.iqbal@example.com"],
  ["Ali Raza", "ali.raza@example.com"],
  ["Mariam Siddiqui", "mariam.siddiqui@example.com"],
  ["Hassan Sheikh", "hassan.sheikh@example.com"],
];

/** Creates ~30 demo orders spread over the last 14 days and reduces stock for the non-cancelled ones. */
async function seedSampleOrders(): Promise<number> {
  const rand = makeRng(2026);
  const statuses = ["FULFILLED", "FULFILLED", "FULFILLED", "PAID", "PAID", "PENDING", "CANCELLED"];
  const pool = await prisma.variant.findMany({
    where: { stock: { gte: 4 } },
    include: { product: true, phoneModel: true },
  });
  const live = new Map<string, number>(pool.map((v) => [v.id, v.stock] as [string, number]));
  let created = 0;

  for (let i = 0; i < 30; i++) {
    const [customerName, email] = sampleCustomers[Math.floor(rand() * sampleCustomers.length)];
    const status = statuses[Math.floor(rand() * statuses.length)];
    const createdAt = new Date(Date.now() - Math.floor(rand() * 14) * 86400000 - Math.floor(rand() * 20) * 3600000);

    const lines: { variantId: string; quantity: number; unitPriceCents: number; productName: string; phoneModelName: string; phoneBrand: string; caseType: string }[] = [];
    const wanted = 1 + Math.floor(rand() * 3);
    for (let k = 0; k < wanted; k++) {
      const v = pool[Math.floor(rand() * pool.length)];
      const quantity = 1 + Math.floor(rand() * 2);
      if (lines.some((l) => l.variantId === v.id) || (live.get(v.id) ?? 0) < quantity) continue;
      lines.push({
        variantId: v.id,
        quantity,
        unitPriceCents: v.product.basePrice + v.priceAdjustment,
        productName: v.product.name,
        phoneModelName: v.phoneModel.name,
        phoneBrand: v.phoneModel.brand,
        caseType: v.caseType,
      });
    }
    if (lines.length === 0) continue;

    await prisma.order.create({
      data: {
        customerName,
        email,
        status,
        createdAt,
        totalCents: lines.reduce((n, l) => n + l.unitPriceCents * l.quantity, 0),
        items: { create: lines },
      },
    });
    if (status !== "CANCELLED") {
      for (const l of lines) {
        live.set(l.variantId, (live.get(l.variantId) ?? 0) - l.quantity);
        await prisma.variant.update({ where: { id: l.variantId }, data: { stock: { decrement: l.quantity } } });
      }
    }
    created++;
  }
  return created;
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.phoneModel.deleteMany();

  console.log("Seeding phone models...");
  const models: { id: string; name: string }[] = [];
  for (const [index, m] of phoneModels.entries()) {
    const created = await prisma.phoneModel.create({
      data: { brand: m.brand, series: m.series, name: m.name, sortOrder: index },
    });
    models.push({ id: created.id, name: m.name });
  }

  console.log("Seeding products and variants...");
  let variantCount = 0;
  for (const p of products) {
    const product = await prisma.product.create({
      data: { name: p.name, description: p.description, basePrice: p.basePrice, image: p.image },
    });

    const rows = models.flatMap((m) =>
      caseTypes.map((c) => ({
        productId: product.id,
        phoneModelId: m.id,
        caseType: c.name,
        sku: `${p.slug}-${slugify(m.name)}-${c.code}`.toUpperCase(),
        stock: stockFor(`${p.slug}|${m.name}|${c.name}`),
        priceAdjustment: c.priceAdjustment + sizeSurcharge(m.name),
      }))
    );
    await prisma.variant.createMany({ data: rows });
    variantCount += rows.length;
  }

  console.log("Seeding sample orders (so the admin dashboard has data)...");
  const orderCount = await seedSampleOrders();

  console.log(`Done: ${products.length} products, ${models.length} phone models, ${variantCount} variants, ${orderCount} sample orders.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
