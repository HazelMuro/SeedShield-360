import { prisma } from "../../../lib/prisma";
import { date, money } from "../../../lib/format";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Card";
import { Badge } from "../../../components/Badge";
import Link from "next/link";
import { EmptyState } from "../../../components/EmptyState";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const alerts = await prisma.riskAlert.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        title="Risk Alerts"
        description="Rule-based anomaly detection outputs and estimated financial exposure."
        action={<Link href="/api/export/alerts" className="rounded-sm border border-seed-700 px-4 py-2 text-sm font-semibold text-seed-800">Export Alerts</Link>}
      />
      <Card>
        {alerts.length === 0 ? <EmptyState message="No risk alerts recorded. Use Scenario Control Center to load operational scenario records." /> : null}
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>Type</th><th>Pack/District</th><th>Risk</th><th>Reason</th><th>Exposure</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.alertType}</td>
                  <td><div className="font-mono text-xs">{alert.packCode || alert.district || "System"}</div></td>
                  <td><Badge tone={alert.riskLevel === "HIGH" ? "red" : alert.riskLevel === "MEDIUM" ? "amber" : "gray"}>{alert.riskLevel}</Badge></td>
                  <td className="max-w-md">{alert.reason}</td>
                  <td className="font-semibold">{money(alert.estimatedExposure)}</td>
                  <td><Badge>{alert.status}</Badge></td>
                  <td>{date(alert.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
