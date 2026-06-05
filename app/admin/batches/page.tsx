import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { shortDate } from "../../../lib/format";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Card";
import { Badge } from "../../../components/Badge";
import { EmptyState } from "../../../components/EmptyState";

export const dynamic = "force-dynamic";

export default async function BatchesPage() {
  const batches = await prisma.batch.findMany({
    orderBy: { createdAt: "desc" },
    include: { depot: true, dealer: true, _count: { select: { packs: true } } }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        title="Batch Registry"
        description="Registered seed batches and generated pack-level verification records."
        action={<Link href="/admin/batches/new" className="rounded-sm bg-seed-800 px-4 py-2 text-sm font-semibold text-white">Register batch</Link>}
      />
      <Card>
        {batches.length === 0 ? <EmptyState message="No batches registered yet. Use Scenario Control Center or register a certified seed batch." /> : null}
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Batch code</th><th>Variety</th><th>Crop</th><th>Pack size</th><th>Intended</th><th>Pack records</th><th>QA</th><th>Created</th><th></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id}>
                  <td className="font-mono text-xs">{batch.batchCode}</td>
                  <td>{batch.variety}</td>
                  <td>{batch.crop}</td>
                  <td>{batch.packSizeKg}kg</td>
                  <td>{batch.intendedTotalPacks}</td>
                  <td>{batch.generatedPilotPacks}</td>
                  <td><Badge tone={batch.qaStatus === "PASSED" ? "green" : "amber"}>{batch.qaStatus}</Badge></td>
                  <td>{shortDate(batch.createdAt)}</td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <Link className="font-semibold text-seed-700" href={`/admin/batches/${batch.id}/packs`}>View packs</Link>
                      <Link className="font-semibold text-seed-700" href={`/admin/batches/${batch.id}/labels`}>Print labels</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
