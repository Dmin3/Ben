import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/http";

export function requireBenAdmin(request: Request) {
  const expected = getEnv().BEN_ADMIN_API_KEY;
  if (!expected) {
    throw new AppError(503, "BEN_ADMIN_NOT_CONFIGURED", "BEN 관리자 인증이 설정되지 않았습니다.");
  }
  if (request.headers.get("x-ben-admin-key") !== expected) {
    throw new AppError(403, "BEN_ADMIN_REQUIRED", "BEN 관리자 권한이 필요합니다.");
  }
}
