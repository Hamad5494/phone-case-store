# CaseCraft: Phone Case Store

Next.js 14 (App Router) · Tailwind CSS · Prisma (SQLite) · Zod · React Context cart

## Run it (first time)

```bash
npm install
npm run setup     # generates Prisma client, creates the SQLite DB, seeds products
npm run dev       # http://localhost:3000
```

Reset the data any time with `npm run db:reset`.

## What's inside
- Variant matrix: Product (design) x PhoneModel x Case Type -> Variant (stock, price adjustment)
- Product page: Brand -> Model dropdowns + Case Type swatches resolve the exact variant, live stock alerts
- Cart: add / remove / update quantity, persisted in localStorage
- `POST /api/checkout`: Zod-validated, atomic Prisma transaction, re-prices from DB, checks and decrements stock, saves the order
- `GET /api/products`: all products with nested variants

## Switch to PostgreSQL
Change `provider` in `prisma/schema.prisma` to `"postgresql"`, set `DATABASE_URL`, run `npx prisma migrate dev`.

## Admin panel
- Open **http://localhost:3000/admin** (link: "Admin" is not shown in the shop on purpose).
- Default password: `admin123` (change `ADMIN_PASSWORD` in `.env`).
- **Dashboard:** revenue, orders, cases sold, stock alerts, 14-day revenue chart, best sellers, recent orders.
- **Orders:** search and filter, view details, change status (cancelling returns stock).
- **Products:** add, edit, delete designs (new designs can auto-create all phone/case variants).
- **Inventory:** edit stock and price adjustment per variant, with search, filters and paging.
- After pulling these changes run `npm run db:reset` once to load the sample orders.

See `DATABASE.md` for the schema, ER diagram and design notes.
