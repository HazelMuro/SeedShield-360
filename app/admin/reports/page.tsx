import { prisma } from "../../../lib/prisma";
import { date } from "../../../lib/format";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Card";
import Link from "next/link";
import { EmptyState } from "../../../components/EmptyState";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await prisma.counterfeitReport.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        title="Counterfeit Reports"
        description="Farmer and public reports submitted from verification and report pages."
        action={<Link href="/api/export/reports" className="rounded-sm border border-seed-700 px-4 py-2 text-sm font-semibold text-seed-800">Export Reports</Link>}
      />
      <Card>
        {reports.length === 0 ? <EmptyState message="No counterfeit reports submitted yet." /> : null}
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>Reference</th><th>Pack</th><th>Reason</th><th>District</th><th>Seller</th><th>Description</th><th>Created</th></tr></thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="font-semibold">{report.referenceNumber}</td>
                  <td className="font-mono text-xs">{report.packCode || "Not provided"}</td>
                  <td>{report.reason}</td>
                  <td>{report.district}</td>
                  <td>{report.sellerName || "Unknown"}</td>
                  <td className="max-w-sm">{report.description}</td>
                  <td>{date(report.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
