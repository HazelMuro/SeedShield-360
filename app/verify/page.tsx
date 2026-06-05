import { VerificationClient } from "./VerificationClient";

export const dynamic = "force-dynamic";

export default function VerifyPage({
  searchParams
}: {
  searchParams: { pack_code?: string; sig?: string };
}) {
  const packCode = searchParams.pack_code || "";
  const sig = searchParams.sig || "";
  return <VerificationClient packCode={packCode} sig={sig} />;
}
