import { describe, it, expect } from "vitest";
import { getInitials } from "@/lib/format";

describe("getInitials", () => {
  it("uses the first and last names", () => {
    expect(getInitials("Maria Elena Reyes")).toBe("MR");
  });

  it("skips titles and suffixes", () => {
    expect(getInitials("Dr. Alberto Cruz, MD")).toBe("AC");
  });

  it("falls back for missing names", () => {
    expect(getInitials(null)).toBe("CQ");
    expect(getInitials("  ")).toBe("CQ");
  });
});
