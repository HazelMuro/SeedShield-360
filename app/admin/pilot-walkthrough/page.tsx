import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { getVerificationUrl } from "../../../lib/url";
import { Card } from "../../../components/Card";
import { PageHeader } from "../../../components/PageHeader";
import { Badge } from "../../../components/Badge";

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "Step 1: Register a certified seed batch",
    detail: "Capture crop, variety, pack size, QA results, depot, dealer, and pack price.",
    href: "/admin/batches/new",
    action: "Open Batch Registration"
  },
  {
    title: "Step 2: View generated pack QR codes",
    detail: "Each pack receives a unique pack code and HMAC-signed verification URL.",
    href: "/admin/batches",
    action: "View Pack QR Codes"
  },
  {
    title: "Step 3: Verify a seed pack as a farmer",
    detail: "A farmer opens the QR link and sees whether the product is genuine, suspicious, or invalid.",
    href: "/verify",
    action: "Open Verification Page"
  },
  {
    title: "Step 4: Enter reward draw for planting tips and farmer support",
    detail: "A first valid scan can activate farmer support and optional reward entry.",
    href: "/reward-entry",
    action: "Open Reward Entry"
  },
  {
    title: "Step 5: Trigger a suspicious repeated scan pattern",
    detail: "Opening the same pack link again creates duplicate-scan intelligence and risk alerts.",
    href: "/admin/scans",
    action: "Review Scan Events"
  },
  {
    title: "Step 6: Submit a suspicious seed report",
    detail: "A farmer or field officer submits seller, district, and product concern details.",
    href: "/report",
    action: "Submit Suspicious Report"
  },
  {
    title: "Step 7: Return to Operations Command Center",
    detail: "Confirm scan count, reward entry, risk alert, hotspot district, financial exposure, and market intelligence updates.",
    href: "/admin/dashboard",
    action: "View Command Center"
  }
];

export default async function PilotWalkthroughPage() {
  const pack = await prisma.pack.findFirst({
    orderBy: { serialNumber: "asc" },
    include: { batch: true }
  });
  const packUrl = pack ? getVerificationUrl(pack.packCode, pack.signature) : "/verify";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <PageHeader
        title="Operational Workflow"
        description="A guided path through SeedShield 360 pack verification, farmer engagement, risk detection, and management intelligence."
        action={<Link href="/admin/batches/new" className="rounded-sm bg-seed-800 px-4 py-2 text-sm font-semibold text-white">Start Operational Workflow</Link>}
      />
      <Card>
        <div className="mb-5 bg-seed-50 p-4 text-sm text-seed-950">
          <Badge tone="green">Recommended Path</Badge>
          <p className="mt-2">
            Use the first pack QR link below to verify, enter a reward entry, open the same link again, submit a report, then return to the dashboard.
          </p>
          {pack ? (
            <Link href={packUrl} target="_blank" className="mt-3 inline-flex rounded-sm border border-seed-700 px-4 py-2 font-semibold text-seed-800">
              Open Farmer Verification
            </Link>
          ) : null}
        </div>
        <div className="grid gap-3">
          {steps.map((step) => (
            <div key={step.title} className="border border-gray-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold text-seed-900">{step.title}</h2>
                  <p className="mt-1 text-sm text-gray-600">{step.detail}</p>
                </div>
                <Link href={step.title.includes("Step 3") && pack ? packUrl : step.href} target={step.title.includes("Step 3") && pack ? "_blank" : undefined} className="rounded-sm border border-seed-700 px-3 py-2 text-center text-sm font-semibold text-seed-800">
                  {step.action}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
