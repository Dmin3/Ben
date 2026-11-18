import { createHmac, randomBytes, randomInt } from "node:crypto";

import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/http";
import { ensureRedisConnected } from "@/lib/redis";

const CODE_TTL_SECONDS = 180;
const VERIFIED_TTL_SECONDS = 600;

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const domestic = digits.startsWith("82") ? `0${digits.slice(2)}` : digits;
  if (!/^01[016789]\d{7,8}$/.test(domestic)) {
    throw new AppError(400, "INVALID_PHONE", "올바른 국내 휴대폰번호를 입력해 주세요.");
  }
  return domestic;
}

function codeHash(phone: string, code: string) {
  return createHmac("sha256", getEnv().JWT_REFRESH_SECRET).update(`${phone}:${code}`).digest("hex");
}

async function sendSolapiSms(to: string, text: string) {
  const { SOLAPI_API_KEY: apiKey, SOLAPI_API_SECRET: secret, SOLAPI_SENDER_NUMBER: from } = getEnv();
  if (!apiKey || !secret || !from) {
    throw new AppError(503, "SMS_NOT_CONFIGURED", "SMS 발송 설정이 완료되지 않았습니다.");
  }
  const date = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", secret).update(date + salt).digest("hex");
  const response = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify({ message: { to, from: from.replace(/\D/g, ""), text } }),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("SOLAPI send failed", response.status, detail.slice(0, 300));
    throw new AppError(502, "SMS_SEND_FAILED", "인증문자 발송에 실패했습니다.");
  }
}

export async function requestPhoneCode(rawPhone: string, purpose: string) {
  const phone = normalizePhone(rawPhone);
  const redis = await ensureRedisConnected();
  const cooldownKey = `auth:sms:cooldown:${phone}`;
  if (!(await redis.set(cooldownKey, "1", "EX", 60, "NX"))) {
    throw new AppError(429, "SMS_TOO_FREQUENT", "인증번호는 60초 후 다시 요청할 수 있습니다.");
  }
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await redis.set(`auth:sms:code:${phone}`, JSON.stringify({ hash: codeHash(phone, code), purpose, attempts: 0 }), "EX", CODE_TTL_SECONDS);
  try {
    await sendSolapiSms(phone, `[BEN] 인증번호는 ${code}입니다. 3분 내 입력해 주세요.`);
  } catch (error) {
    await redis.del(cooldownKey, `auth:sms:code:${phone}`);
    throw error;
  }
  return { expiresIn: CODE_TTL_SECONDS, resendAfter: 60 };
}

export async function verifyPhoneCode(rawPhone: string, code: string, purpose: string) {
  const phone = normalizePhone(rawPhone);
  const redis = await ensureRedisConnected();
  const key = `auth:sms:code:${phone}`;
  const raw = await redis.get(key);
  if (!raw) throw new AppError(400, "SMS_CODE_EXPIRED", "인증번호가 만료되었습니다.");
  const record = JSON.parse(raw) as { hash: string; purpose: string; attempts: number };
  if (record.purpose !== purpose) throw new AppError(400, "SMS_PURPOSE_MISMATCH", "인증 요청 목적이 일치하지 않습니다.");
  if (record.hash !== codeHash(phone, code)) {
    record.attempts += 1;
    if (record.attempts >= 5) await redis.del(key);
    else await redis.set(key, JSON.stringify(record), "KEEPTTL");
    throw new AppError(400, "SMS_CODE_INVALID", "인증번호가 올바르지 않습니다.");
  }
  await redis.del(key);
  const token = randomBytes(32).toString("base64url");
  await redis.set(`auth:sms:verified:${token}`, JSON.stringify({ phone, purpose }), "EX", VERIFIED_TTL_SECONDS);
  return { verificationToken: token, phone, expiresIn: VERIFIED_TTL_SECONDS };
}

export async function consumePhoneVerification(token: string, rawPhone: string, purpose: string) {
  const phone = normalizePhone(rawPhone);
  const redis = await ensureRedisConnected();
  const raw = await redis.call("GETDEL", `auth:sms:verified:${token}`);
  if (typeof raw !== "string") throw new AppError(400, "PHONE_VERIFICATION_REQUIRED", "휴대폰 인증이 필요하거나 만료되었습니다.");
  const record = JSON.parse(raw) as { phone: string; purpose: string };
  if (record.phone !== phone || record.purpose !== purpose) {
    throw new AppError(400, "PHONE_VERIFICATION_MISMATCH", "휴대폰 인증 정보가 일치하지 않습니다.");
  }
  return phone;
}
