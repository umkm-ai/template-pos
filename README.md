# Point of Sale (POS) — UMKM Template

A production-ready **Point of Sale** starter for Indonesian UMKM, generated and
hosted by [Warung](https://github.com/umkm-ai).

- **Server:** Bun + [Hono](https://hono.dev) + [Prisma](https://www.prisma.io) + PostgreSQL
- **Client:** Vite + React + TypeScript
- **Language/locale:** Bahasa Indonesia, IDR

## Features

- Products & categories
- Sales (transactions) with line items and automatic stock decrement
- Daily sales summary
- Fully typed request/response DTOs (zod) — no `any`
- Consistent pagination on all list endpoints

## Structure

```text
template-pos/
├─ server/   # Hono + Prisma API (Bun)
└─ client/   # Vite + React SPA
```

## Quick start (server)

```bash
cd server
bun install
cp .env.example .env          # set DATABASE_URL
bunx prisma migrate deploy
bun run prisma/seed.ts
bun run src/index.ts          # http://localhost:3000
```

## Quick start (client)

```bash
cd client
bun install
bun run dev                   # http://localhost:5173
```

## API

Base URL `/api`. Health at `/healthz`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List products (paginated) |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get product |
| PATCH | `/api/products/:id` | Update product |
| GET | `/api/categories` | List categories (paginated) |
| POST | `/api/categories` | Create category |
| GET | `/api/sales` | List sales (paginated) |
| POST | `/api/sales` | Create sale (decrements stock) |
| GET | `/api/sales/summary` | Daily sales summary |

License: MIT.
