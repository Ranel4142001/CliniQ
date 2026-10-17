import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
import { ApiResponse, ApiErrorResponse } from "../types/api";

type ApiHandler<T> = (
  req: NextRequest,
  context?: { params?: Record<string, string | string[]> }
) => Promise<ApiResponse<T> | NextResponse>;

export function withApiHandler<T>(handler: ApiHandler<T>) {
  return async (
    req: NextRequest,
    context?: { params?: Record<string, string | string[]> }
  ): Promise<NextResponse<ApiResponse<T> | ApiErrorResponse>> => {
    try {
      const result = await handler(req, context);
      if (result instanceof NextResponse) {
        return result as NextResponse<ApiResponse<T> | ApiErrorResponse>;
      }
      return NextResponse.json(result, { status: 200 });
    } catch (err: unknown) {
      if (err instanceof AppError) {
        return NextResponse.json(
          {
            error: {
              code: err.code,
              message: err.message,
              ...(err.details ? { details: err.details } : {}),
            },
          },
          { status: err.statusCode }
        );
      }

      if (err instanceof ZodError) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Validation failed",
              details: err.flatten(),
            },
          },
          { status: 400 }
        );
      }

      console.error("[Unhandled API Error]:", err);
      return NextResponse.json(
        {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
          },
        },
        { status: 500 }
      );
    }
  };
}
