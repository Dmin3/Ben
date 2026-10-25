import { AppError } from "@/lib/http";

export async function readRequestBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();

  try {
    if (contentType === "application/json") {
      return await request.json();
    }

    if (contentType === "application/x-www-form-urlencoded") {
      const form = await request.formData();
      return Object.fromEntries(
        [...form.entries()].map(([key, value]) => [key, typeof value === "string" ? value : value.name]),
      );
    }
  } catch {
    throw new AppError(400, "INVALID_REQUEST_BODY", "요청 본문을 읽을 수 없습니다.");
  }

  throw new AppError(
    415,
    "UNSUPPORTED_MEDIA_TYPE",
    "Content-Type은 application/json 또는 application/x-www-form-urlencoded여야 합니다.",
  );
}
