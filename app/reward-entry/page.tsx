import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { verifyPackSignature } from "../../lib/security";
import { createAuditLog } from "../../lib/audit";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { Badge } from "../../components/Badge";

export const dynamic = "force-dynamic";

async function rewardEntryAction(formData: FormData) {
  "use server";
  const packCode = String(formData.get("packCode") || "");
  const sig = String(formData.get("sig") || "");
  const phoneNumber = String(formData.get("phoneNumber") || "");
  const consent = formData.get("consent") === "on";

  if (!consent) redirect(`/reward-entry?pack_code=${encodeURIComponent(packCode)}&sig=${encodeURIComponent(sig)}&error=consent`);

  const pack = await prisma.pack.findUnique({ where: { packCode } });
  if (!pack || !verifyPackSignature(packCode, sig) || pack.scanCount > 1) {
    redirect(`/reward-entry?pack_code=${encodeURIComponent(packCode)}&sig=${encodeURIComponent(sig)}&error=invalid`);
  }

  const existing = await prisma.rewardEntry.findFirst({ where: { packCode, entryStatus: "VALID" } });
  if (existing) redirect(`/reward-entry?pack_code=${encodeURIComponent(packCode)}&sig=${encodeURIComponent(sig)}&duplicate=1`);

  const entry = await prisma.rewardEntry.create({
    data: {
      packCode,
      packId: pack.id,
      phoneNumber,
      campaignName: "SeedShield 2026 Farmer Support Rewards",
      entryStatus: "VALID"
    }
  });
  await createAuditLog({
    entityType: "RewardEntry",
    entityId: entry.id,
    action: "reward entry created",
    details: entry
  });
  redirect(`/reward-entry?pack_code=${encodeURIComponent(packCode)}&sig=${encodeURIComponent(sig)}&success=1`);
}

export default async function RewardEntryPage({
  searchParams
}: {
  searchParams: { pack_code?: string; sig?: string; success?: string; duplicate?: string; error?: string };
}) {
  const packCode = searchParams.pack_code || "";
  const sig = searchParams.sig || "";
  const pack = packCode ? await prisma.pack.findUnique({ where: { packCode }, include: { batch: true } }) : null;
  const existing = packCode ? await prisma.rewardEntry.findFirst({ where: { packCode, entryStatus: "VALID" } }) : null;
  const valid = !!pack && verifyPackSignature(packCode, sig) && pack.scanCount <= 1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader title="Farmer Reward Entry" description="Receive planting tips, activate farmer support, and stand a chance to win Seed Co rewards after a valid first scan." />
      <Card>
        {searchParams.success ? (
          <div>
            <Badge tone="green">VALID ENTRY</Badge>
            <h2 className="mt-4 text-2xl font-bold text-seed-900">You are entered into the reward draw.</h2>
            <p className="mt-2 text-gray-600">Seed Co planting tips and support can now be linked to this verified pack.</p>
            <Link className="mt-4 inline-flex rounded-sm bg-seed-800 px-4 py-2 text-sm font-semibold text-white" href="/">Return home</Link>
          </div>
        ) : existing || searchParams.duplicate ? (
          <div>
            <Badge tone="amber">DUPLICATE</Badge>
            <h2 className="mt-4 text-2xl font-bold text-amber-800">This pack has already been entered into the reward draw.</h2>
            <Link className="mt-4 inline-flex rounded-sm border border-seed-700 px-4 py-2 text-sm font-semibold text-seed-800" href="/">Return home</Link>
          </div>
        ) : !valid ? (
          <div>
            <Badge tone="red">NOT ELIGIBLE</Badge>
            <h2 className="mt-4 text-2xl font-bold text-red-800">Reward entry is only available after the first valid farmer scan.</h2>
            <p className="mt-2 text-gray-600">Verify a genuine pack first, then return to this form.</p>
          </div>
        ) : (
          <form action={rewardEntryAction} className="space-y-4">
            <input type="hidden" name="packCode" value={packCode} />
            <input type="hidden" name="sig" value={sig} />
            <div className="rounded-md bg-seed-50 p-3 text-sm">
              <strong>{pack?.batch.variety}</strong>
              <div className="mt-1 break-all font-mono text-xs">{packCode}</div>
            </div>
            <div>
              <label>Phone number, optional</label>
              <input name="phoneNumber" placeholder="e.g. 0772123456" />
            </div>
            <label className="flex items-start gap-3 rounded-sm border border-gray-200 p-3">
              <input name="consent" type="checkbox" className="mt-1 h-4 w-4" required />
              <span>I agree to receive Seed Co planting tips and be entered into the reward draw.</span>
            </label>
            <button className="w-full rounded-sm bg-seed-800 px-4 py-3 text-sm font-semibold text-white" type="submit">Submit reward entry</button>
          </form>
        )}
      </Card>
    </div>
  );
}
