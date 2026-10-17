import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
  ValidationError,
} from "@/shared/lib/errors";

describe("AppError Hierarchy", () => {
  it("creates NotFoundError with 404 status and NOT_FOUND code", () => {
    const err = new NotFoundError("Patient not found");
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Patient not found");
  });

  it("creates ForbiddenError with 403 status", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });

  it("creates UnauthorizedError with 401 status", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("creates ConflictError with 409 status", () => {
    const err = new ConflictError("Slot conflict");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  it("creates ValidationError with 400 status and optional details", () => {
    const err = new ValidationError("Invalid email", { field: "email" });
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual({ field: "email" });
  });
});
