import { z } from "zod";
import { PaginationMeta } from "./pagination.js";

/**
 * Request and response DTOs for the POS API. Every field is typed via zod —
 * no `any`, no untyped bags. Response DTOs are schemas so the client can share
 * them. See docs/TEMPLATES.md §4.
 */

/* ---------- Category ---------- */

export const CategoryDTO = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CategoryDTO = z.infer<typeof CategoryDTO>;

export const CreateCategoryRequest = z.object({
  name: z.string().min(1).max(80),
});
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequest>;

/* ---------- Product ---------- */

export const ProductDTO = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  priceCents: z.number().int(),
  stock: z.number().int(),
  categoryId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ProductDTO = z.infer<typeof ProductDTO>;

export const CreateProductRequest = z.object({
  sku: z.string().min(1).max(64),
  name: z.string().min(1).max(160),
  priceCents: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  categoryId: z.string().nullable().optional(),
});
export type CreateProductRequest = z.infer<typeof CreateProductRequest>;

export const UpdateProductRequest = z.object({
  name: z.string().min(1).max(160).optional(),
  priceCents: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  categoryId: z.string().nullable().optional(),
});
export type UpdateProductRequest = z.infer<typeof UpdateProductRequest>;

/* ---------- Sale ---------- */

export const SaleItemDTO = z.object({
  id: z.string(),
  productId: z.string(),
  quantity: z.number().int(),
  unitPriceCents: z.number().int(),
  lineTotalCents: z.number().int(),
});
export type SaleItemDTO = z.infer<typeof SaleItemDTO>;

export const SaleDTO = z.object({
  id: z.string(),
  totalCents: z.number().int(),
  paidCents: z.number().int(),
  changeCents: z.number().int(),
  createdAt: z.string(),
  items: z.array(SaleItemDTO),
});
export type SaleDTO = z.infer<typeof SaleDTO>;

export const CreateSaleItemRequest = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});
export const CreateSaleRequest = z.object({
  paidCents: z.number().int().nonnegative(),
  items: z.array(CreateSaleItemRequest).min(1),
});
export type CreateSaleRequest = z.infer<typeof CreateSaleRequest>;

export const SalesSummaryDTO = z.object({
  date: z.string(),
  saleCount: z.number().int(),
  revenueCents: z.number().int(),
});
export type SalesSummaryDTO = z.infer<typeof SalesSummaryDTO>;

/* ---------- Response envelopes ---------- */

export const PaginatedProducts = z.object({
  data: z.array(ProductDTO),
  pagination: PaginationMeta,
});
export const PaginatedCategories = z.object({
  data: z.array(CategoryDTO),
  pagination: PaginationMeta,
});
export const PaginatedSales = z.object({
  data: z.array(SaleDTO),
  pagination: PaginationMeta,
});
