import { createHash, randomInt } from "node:crypto";

export function generateOtpCode() {
  return randomInt(100000, 1000000).toString();
}

export function hashOtpCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}
