import { prisma } from "../../../lib/prisma";
import { date } from "../../../lib/format";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Card";
import { Badge } from "../../../components/Badge";
import Link from "next/link";
import { EmptyState } from "../../../components/EmptyState";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const rewards = await prisma.rewardEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { pack: { include: { batch: true } } }
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        title="Reward Entries"
        description="Farmer incentive entries linked to first valid verification scans."
        action={<Link href="/api/export/rewards" className="rounded-md border border-seed-600 px-4 py-2 text-sm font-semibold text-seed-700">Export Reward Entries</Link>}
      />
      <Card>
        {rewards.length === 0 ? <EmptyState message="No reward entries yet." /> : null}
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>Pack</th><th>Variety</th><th>Phone</th><th>Campaign</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {rewards.map((entry) => (
                <tr key={entry.id}>
                  <td className="font-mono text-xs">{entry.packCode}</td>
                  <td>{entry.pack?.batch.varietyCode || "Unknown"}</td>
                  <td>{entry.phoneNumber || "Not provided"}</td>
                  <td>{entry.campaignName}</td>
                  <td><Badge tone={entry.entryStatus === "VALID" ? "green" : "amber"}>{entry.entryStatus}</Badge></td>
                  <td>{date(entry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
