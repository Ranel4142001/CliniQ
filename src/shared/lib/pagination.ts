import { z } from "zod";
import { Paginated } from "../types/api";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export function getPaginationSkipTake(page = 1, pageSize = 10): { skip: number; take: number } {
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, Math.min(100, pageSize));
  return {
    skip: (validPage - 1) * validPageSize,
    take: validPageSize,
  };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): Paginated<T> {
  const validPageSize = Math.max(1, pageSize);
  const totalPages = Math.ceil(total / validPageSize);
  return {
    items,
    total,
    page,
    pageSize: validPageSize,
    totalPages,
  };
}
