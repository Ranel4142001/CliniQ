import { describe, it, expect } from "vitest";
import {
  paginationSchema,
  getPaginationSkipTake,
  buildPaginatedResponse,
} from "@/shared/lib/pagination";

describe("Pagination Utilities", () => {
  it("calculates skip and take accurately", () => {
    expect(getPaginationSkipTake(1, 10)).toEqual({ skip: 0, take: 10 });
    expect(getPaginationSkipTake(2, 10)).toEqual({ skip: 10, take: 10 });
    expect(getPaginationSkipTake(3, 25)).toEqual({ skip: 50, take: 25 });
  });

  it("builds paginated response object with totalPages calculation", () => {
    const items = [{ id: 1 }, { id: 2 }];
    const res = buildPaginatedResponse(items, 45, 1, 10);
    expect(res).toEqual({
      items,
      total: 45,
      page: 1,
      pageSize: 10,
      totalPages: 5,
    });
  });

  it("validates and applies defaults in paginationSchema", () => {
    const parsed = paginationSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(10);
    expect(parsed.sortOrder).toBe("desc");
  });
});
