import { describe, expect, it } from "vitest";

import { readRequestBody } from "@/lib/request-body";

describe("readRequestBody", () => {
  it("reads JSON", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });
    await expect(readRequestBody(request)).resolves.toEqual({ email: "test@example.com" });
  });

  it("reads urlencoded forms", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "email=test%40example.com&name=TestLee",
    });
    await expect(readRequestBody(request)).resolves.toEqual({
      email: "test@example.com",
      name: "TestLee",
    });
  });

  it("rejects unsupported content types with 415", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "hello",
    });
    await expect(readRequestBody(request)).rejects.toMatchObject({
      status: 415,
      code: "UNSUPPORTED_MEDIA_TYPE",
    });
  });
});
