import { describe, it, expect } from "vitest";
import { createAttemptLimiter } from "@backend/shared/adapters/http/rate-limit";

describe("createAttemptLimiter", () => {
  it("allows attempts up to the limit, then asks the caller to wait", () => {
    let time = 0;
    const limiter = createAttemptLimiter(3, 60_000, () => time);

    expect([limiter.hit("a"), limiter.hit("a"), limiter.hit("a")]).toEqual([null, null, null]);
    expect(limiter.hit("a")).toBe(60);

    time = 30_000;
    expect(limiter.hit("a")).toBe(30);
  });

  it("counts each key separately", () => {
    const limiter = createAttemptLimiter(1, 60_000, () => 0);
    expect(limiter.hit("a")).toBeNull();
    expect(limiter.hit("b")).toBeNull();
    expect(limiter.hit("a")).not.toBeNull();
  });

  it("starts a fresh window once the old one expires", () => {
    let time = 0;
    const limiter = createAttemptLimiter(1, 60_000, () => time);
    limiter.hit("a");
    expect(limiter.hit("a")).not.toBeNull();

    time = 60_000;
    expect(limiter.hit("a")).toBeNull();
  });
});
