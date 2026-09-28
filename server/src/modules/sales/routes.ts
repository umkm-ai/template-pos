import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../../db.js";
import {
  CreateSaleRequest,
  type SaleDTO,
  type SalesSummaryDTO,
} from "../../http/dto.js";
import {
  buildMeta,
  PaginationQuery,
  skipTake,
  type Paginated,
  type Single,
} from "../../http/pagination.js";
import { badRequest, notFound } from "../../http/errors.js";

type SaleItemRow = {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};
type SaleRow = {
  id: string;
  totalCents: number;
  paidCents: number;
  changeCents: number;
  createdAt: Date;
  items: SaleItemRow[];
};

function toDTO(row: SaleRow): SaleDTO {
  return {
    id: row.id,
    totalCents: row.totalCents,
    paidCents: row.paidCents,
    changeCents: row.changeCents,
    createdAt: row.createdAt.toISOString(),
    items: row.items.map((it) => ({
      id: it.id,
      productId: it.productId,
      quantity: it.quantity,
      unitPriceCents: it.unitPriceCents,
      lineTotalCents: it.lineTotalCents,
    })),
  };
}

export const sales = new Hono();

sales.get("/", zValidator("query", PaginationQuery), async (c) => {
  const q = c.req.valid("query");
  const { skip, take } = skipTake(q);
  const [rows, total] = await Promise.all([
    prisma.sale.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.sale.count(),
  ]);
  const body: Paginated<SaleDTO> = {
    data: rows.map(toDTO),
    pagination: buildMeta(q.page, q.pageSize, total),
  };
  return c.json(body);
});

sales.get("/summary", async (c) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const rows = await prisma.sale.findMany({
    where: { createdAt: { gte: start } },
    select: { totalCents: true },
  });
  const revenueCents = rows.reduce((sum, r) => sum + r.totalCents, 0);
  const body: Single<SalesSummaryDTO> = {
    data: {
      date: start.toISOString().slice(0, 10),
      saleCount: rows.length,
      revenueCents,
    },
  };
  return c.json(body);
});

sales.post("/", zValidator("json", CreateSaleRequest), async (c) => {
  const input = c.req.valid("json");

  const created = await prisma.$transaction(async (tx) => {
    const ids = input.items.map((i) => i.productId);
    const found = await tx.product.findMany({ where: { id: { in: ids } } });
    const byId = new Map(found.map((p) => [p.id, p]));

    let totalCents = 0;
    const itemsData = input.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) throw notFound(`product ${item.productId}`);
      if (product.stock < item.quantity) {
        throw badRequest(`insufficient stock for ${product.name}`, {
          productId: product.id,
          available: product.stock,
          requested: item.quantity,
        });
      }
      const lineTotalCents = product.priceCents * item.quantity;
      totalCents += lineTotalCents;
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
        lineTotalCents,
      };
    });

    if (input.paidCents < totalCents) {
      throw badRequest("paid amount is less than total", {
        totalCents,
        paidCents: input.paidCents,
      });
    }

    for (const item of itemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return tx.sale.create({
      data: {
        totalCents,
        paidCents: input.paidCents,
        changeCents: input.paidCents - totalCents,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  });

  const body: Single<SaleDTO> = { data: toDTO(created) };
  return c.json(body, 201);
});
