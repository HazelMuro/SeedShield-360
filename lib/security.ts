import crypto from "crypto";

const FALLBACK_SECRET = "seedshield-360-pilot-fallback-change-me";

function getSigningSecret() {
  if (!process.env.SEEDSHIELD_SIGNING_SECRET) {
    console.warn(
      "SEEDSHIELD_SIGNING_SECRET is missing. Using a pilot fallback secret for local development only."
    );
  }

  return process.env.SEEDSHIELD_SIGNING_SECRET || FALLBACK_SECRET;
}

export function signPackCode(packCode: string) {
  return crypto.createHmac("sha256", getSigningSecret()).update(packCode).digest("hex");
}

export function verifyPackSignature(packCode: string, signature?: string | null) {
  if (!packCode || !signature) return false;
  const expected = signPackCode(packCode);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}
