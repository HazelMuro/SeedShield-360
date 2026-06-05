import { prisma } from "../../../lib/prisma";
import { date } from "../../../lib/format";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Card";
import { Badge } from "../../../components/Badge";
import Link from "next/link";
import { EmptyState } from "../../../components/EmptyState";

export const dynamic = "force-dynamic";

export default async function ScansPage() {
  const scans = await prisma.scanEvent.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { pack: { include: { batch: true } } } });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        title="Scan Events"
        description="Every verification attempt is logged, including invalid code attempts."
        action={<Link href="/api/export/scans" className="rounded-md border border-seed-600 px-4 py-2 text-sm font-semibold text-seed-700">Export Scans</Link>}
      />
      <Card>
        {scans.length === 0 ? <EmptyState message="No scans recorded yet." /> : null}
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>Pack code</th><th>Result</th><th>Variety</th><th>District</th><th>Location</th><th>Created</th></tr></thead>
            <tbody>
              {scans.map((scan) => (
                <tr key={scan.id}>
                  <td className="font-mono text-xs">{scan.packCode}</td>
                  <td><Badge tone={scan.result === "GENUINE" ? "green" : scan.result === "ALREADY_SCANNED" ? "amber" : "red"}>{scan.result}</Badge></td>
                  <td>{scan.pack?.batch.varietyCode || "Unknown"}</td>
                  <td>{scan.district || "Unknown"}</td>
                  <td>{scan.latitude && scan.longitude ? `${scan.latitude.toFixed(4)}, ${scan.longitude.toFixed(4)}` : "Not provided"}</td>
                  <td>{date(scan.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
