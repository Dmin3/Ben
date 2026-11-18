import { describe, expect, it } from "vitest";

import { factoryListQuerySchema, factoryMemoSchema } from "@/lib/factories/schemas";

describe("factory schemas", () => {
  it("applies safe list defaults", () => {
    expect(factoryListQuerySchema.parse({})).toEqual({
      page: 1,
      size: 20,
      sort: "name",
      direction: "asc",
    });
  });

  it("coerces pagination and rejects oversized pages", () => {
    expect(factoryListQuerySchema.parse({ page: "2", size: "50" })).toMatchObject({ page: 2, size: 50 });
    expect(() => factoryListQuerySchema.parse({ size: "51" })).toThrow();
  });

  it("accepts clearing memo and rejects long memo", () => {
    expect(factoryMemoSchema.parse({ memo: null })).toEqual({ memo: null });
    expect(() => factoryMemoSchema.parse({ memo: "x".repeat(2001) })).toThrow();
  });
});
