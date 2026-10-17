import {
  AppError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
  ValidationError,
} from "./errors";
import { ApiResponse, ApiErrorResponse } from "../types/api";

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  if (!params) return path;
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  }
  const query = searchParams.toString();
  return query ? `${path}${path.includes("?") ? "&" : "?"}${query}` : path;
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const errorBody = (data as ApiErrorResponse | null)?.error;
    const message = errorBody?.message || res.statusText || "Request failed";
    const details = errorBody?.details;

    switch (res.status) {
      case 400:
        throw new ValidationError(message, details);
      case 401:
        throw new UnauthorizedError(message, details);
      case 403:
        throw new ForbiddenError(message, details);
      case 404:
        throw new NotFoundError(message, details);
      case 409:
        throw new ConflictError(message, details);
      default:
        throw new AppError(message, res.status, errorBody?.code, details);
    }
  }

  return data as ApiResponse<T>;
}

export const apiClient = {
  async get<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, headers, ...rest } = options;
    const url = buildUrl(path, params);
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...headers },
      ...rest,
    });
    return handleResponse<T>(res);
  },

  async post<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, headers, ...rest } = options;
    const url = buildUrl(path, params);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
    return handleResponse<T>(res);
  },

  async put<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, headers, ...rest } = options;
    const url = buildUrl(path, params);
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
    return handleResponse<T>(res);
  },

  async patch<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, headers, ...rest } = options;
    const url = buildUrl(path, params);
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
    return handleResponse<T>(res);
  },

  async delete<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, headers, ...rest } = options;
    const url = buildUrl(path, params);
    const res = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...headers },
      ...rest,
    });
    return handleResponse<T>(res);
  },
};
