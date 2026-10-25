import { describe, expect, it } from "vitest";

import { normalizeAccountCode } from "@/lib/auth/service";

describe("normalizeAccountCode", () => {
  it("trims and lowercases a customer account code", () => {
    expect(normalizeAccountCode("  Ben-Logistics  ")).toBe("ben-logistics");
  });
});
