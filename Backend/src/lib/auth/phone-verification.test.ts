import { describe, expect, it } from "vitest";
import { normalizePhone } from "@/lib/auth/phone-verification";

describe("normalizePhone", () => {
  it("normalizes domestic and +82 mobile numbers", () => {
    expect(normalizePhone("010-1234-5678")).toBe("01012345678");
    expect(normalizePhone("+82 10-1234-5678")).toBe("01012345678");
  });

  it("rejects non-mobile values", () => {
    expect(() => normalizePhone("02-1234-5678")).toThrow();
  });
});
