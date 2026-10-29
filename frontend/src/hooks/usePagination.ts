"use client";

import { useState, useCallback, useMemo } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  total?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, total = 0 } = options;

  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const totalPages = useMemo(() => {
    return total > 0 ? Math.ceil(total / pageSize) : 1;
  }, [total, pageSize]);

  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  const nextPage = useCallback(() => {
    setPage((curr) => (curr < totalPages ? curr + 1 : curr));
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setPage((curr) => (curr > 1 ? curr - 1 : curr));
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    resetPage,
  };
}
