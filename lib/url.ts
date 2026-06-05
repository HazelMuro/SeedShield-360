import { signPackCode } from "./security";

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005";
}

export function getVerificationUrl(packCode: string, signature = signPackCode(packCode)) {
  const params = new URLSearchParams({ pack_code: packCode, sig: signature });
  return `${getBaseUrl()}/verify?${params.toString()}`;
}
