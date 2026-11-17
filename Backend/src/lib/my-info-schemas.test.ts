import { describe, expect, it } from "vitest";

import {
  addressSchema,
  addressUpdateSchema,
  companyUpdateSchema,
  contactSchema,
  passwordChangeSchema,
} from "@/lib/my-info-schemas";

describe("my info request schemas", () => {
  it("accepts partial company updates but rejects an empty update", () => {
    expect(companyUpdateSchema.parse({ nameEn: "BEN LOGISTICS" })).toEqual({ nameEn: "BEN LOGISTICS" });
    expect(() => companyUpdateSchema.parse({})).toThrow();
  });

  it("normalizes the contact email and validates phone numbers", () => {
    expect(
      contactSchema.parse({ name: "담당자", title: "대표", phone: "010-1234-5678", email: "OWNER@EXAMPLE.COM" }),
    ).toMatchObject({ email: "owner@example.com" });
    expect(() =>
      contactSchema.parse({ name: "담당자", title: "대표", phone: "01012345678", email: "owner@example.com" }),
    ).toThrow();
  });

  it("requires all fields for create and at least one field for update", () => {
    expect(
      addressSchema.parse({ name: "본사", address: "서울시", recipient: "홍길동", phone: "02-123-4567" }),
    ).toBeTruthy();
    expect(addressUpdateSchema.parse({ recipient: "새 담당자" })).toEqual({ recipient: "새 담당자" });
    expect(() => addressUpdateSchema.parse({})).toThrow();
  });

  it("rejects weak or unchanged passwords", () => {
    expect(passwordChangeSchema.parse({ currentPassword: "OldPassword1", newPassword: "NewPassword2" })).toBeTruthy();
    expect(() => passwordChangeSchema.parse({ currentPassword: "SamePassword1", newPassword: "SamePassword1" })).toThrow();
    expect(() => passwordChangeSchema.parse({ currentPassword: "OldPassword1", newPassword: "onlyletters" })).toThrow();
  });
});
