import { describe, expect, it } from "vitest";

import { normalizeProfile } from "@/lib/auth/oauth";

describe("OAuth profile normalization", () => {
  it("normalizes Google", () => {
    expect(
      normalizeProfile("google", {
        sub: "g-1",
        email: "USER@EXAMPLE.COM",
        email_verified: true,
        name: "사용자",
        picture: "https://example.com/p.png",
      }),
    ).toMatchObject({ subject: "g-1", email: "user@example.com", emailVerified: true });
  });

  it("normalizes Kakao", () => {
    expect(
      normalizeProfile("kakao", {
        id: 42,
        kakao_account: {
          email: "kakao@example.com",
          is_email_verified: true,
          profile: { nickname: "카카오" },
        },
      }),
    ).toMatchObject({ subject: "42", email: "kakao@example.com", name: "카카오" });
  });

  it("normalizes Naver", () => {
    expect(
      normalizeProfile("naver", {
        response: { id: "n-1", email: "naver@example.com", name: "네이버" },
      }),
    ).toMatchObject({ subject: "n-1", email: "naver@example.com", name: "네이버" });
  });
});
