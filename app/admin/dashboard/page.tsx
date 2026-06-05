import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { money, date } from "../../../lib/format";
import { Card, StatCard } from "../../../components/Card";
import { PageHeader } from "../../../components/PageHeader";
import { Badge } from "../../../components/Badge";
import { ProblemAlignment } from "../../../components/ProblemAlignment";
import { EmptyState } from "../../../components/EmptyState";
import { requireRole, roleLabel } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const role = requireRole();
  const roleName = roleLabel(role);
  const [
    totalBatches,
    totalPacks,
    totalScans,
    totalReports,
    totalRewards,
    totalAlerts,
    exposureAgg,
    recentScans,
    recentReports,
    recentRewards,
    highRiskPacks,
    districtScans,
    alertLevels,
    scanRows,
    dealerRowsRaw,
    rewardRows,
    reportDensity,
    suspiciousDistricts,
    hotspotExposure
  ] = await Promise.all([
    prisma.batch.count(),
    prisma.pack.count(),
    prisma.scanEvent.count(),
    prisma.counterfeitReport.count(),
    prisma.rewardEntry.count(),
    prisma.riskAlert.count(),
    prisma.riskAlert.aggregate({ _sum: { estimatedExposure: true } }),
    prisma.scanEvent.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.counterfeitReport.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.rewardEntry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.pack.findMany({
      where: { OR: [{ status: "SUSPICIOUS" }, { scanCount: { gte: 2 } }] },
      orderBy: [{ scanCount: "desc" }, { lastScannedAt: "desc" }],
      take: 6,
      include: { batch: true }
    }),
    prisma.scanEvent.groupBy({
      by: ["district"],
      _count: { id: true },
      where: { district: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 6
    }),
    prisma.riskAlert.groupBy({ by: ["riskLevel"], _count: { id: true } }),
    prisma.scanEvent.findMany({
      where: { packId: { not: null } },
      include: { pack: { include: { batch: true } } },
      orderBy: { createdAt: "desc" },
      take: 300
    }),
    prisma.dealer.findMany({ include: { batches: { include: { packs: { include: { scans: true } } } } } }),
    prisma.rewardEntry.findMany({ include: { pack: { include: { batch: { include: { dealer: true } } } } }, take: 300 }),
    prisma.counterfeitReport.groupBy({
      by: ["district"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6
    }),
    prisma.riskAlert.groupBy({
      by: ["district"],
      _count: { id: true },
      where: { district: { not: null }, riskLevel: { in: ["MEDIUM", "HIGH"] } },
      orderBy: { _count: { id: "desc" } },
      take: 6
    }),
    prisma.riskAlert.groupBy({
      by: ["district"],
      _sum: { estimatedExposure: true },
      _count: { id: true },
      where: { district: { not: null } },
      orderBy: { _sum: { estimatedExposure: "desc" } },
      take: 6
    })
  ]);

  const varietyMap = new Map<string, number>();
  for (const scan of scanRows) {
    const variety = scan.pack?.batch.varietyCode || "Unknown";
    varietyMap.set(variety, (varietyMap.get(variety) || 0) + 1);
  }
  const varietyRows = Array.from(varietyMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const dealerRows = dealerRowsRaw
    .map((dealer) => {
      const packs = dealer.batches.reduce((sum, batch) => sum + batch.packs.length, 0);
      const scans = dealer.batches.reduce((sum, batch) => sum + batch.packs.reduce((inner, pack) => inner + pack.scans.length, 0), 0);
      return { name: dealer.name, district: dealer.district, packs, scans };
    })
    .sort((a, b) => b.scans - a.scans)
    .slice(0, 5);

  const rewardDistrictMap = new Map<string, number>();
  for (const reward of rewardRows) {
    const district = reward.pack?.batch.dealer.district || "Unassigned";
    rewardDistrictMap.set(district, (rewardDistrictMap.get(district) || 0) + 1);
  }
  const rewardDistrictRows = Array.from(rewardDistrictMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topRiskDistrict = hotspotExposure[0]?.district || reportDensity[0]?.district || "No hotspot yet";
  const topVariety = varietyRows[0]?.[0] || "No variety activity yet";
  const topDealer = dealerRows[0]?.name || "No dealer activity yet";
  const topReportDistrict = reportDensity[0]?.district || "No report cluster yet";
  const openExposure = exposureAgg._sum.estimatedExposure || 0;
  const insightCards = [
    `${topRiskDistrict} has the highest counterfeit risk signal in current operational records.`,
    `${topVariety} has the highest verification activity.`,
    `${topDealer} is showing the strongest farmer scan engagement.`,
    `${topReportDistrict} report density suggests a possible hotspot for QA follow-up.`,
    `Estimated exposure from open alerts is ${money(openExposure)}.`
  ];
  const roleFocus: Record<string, { title: string; points: string[] }> = {
    QA_MANAGER: {
      title: "Quality Assurance Focus",
      points: ["Counterfeit reports", "High-risk alerts", "Hotspot districts", "Batch quality status", "Suspicious pack scan history"]
    },
    COMMERCIAL_MANAGER: {
      title: "Commercial Management Focus",
      points: ["Scans by variety", "Scans by district", "Farmer reward engagement", "Dealer activity", "Market demand signals"]
    },
    DEPOT_OFFICER: {
      title: "Depot Operations Focus",
      points: ["Batch registration", "Assigned batches", "Pack QR labels", "Dealer records", "Pack verification status"]
    },
    DEALER: {
      title: "Dealer Area Focus",
      points: ["Assigned packs", "Verification activity for stock", "Received stock", "Report suspicious seed", "Farmer reward scans"]
    },
    EXECUTIVE: {
      title: "Executive Summary Focus",
      points: ["Financial exposure", "Top risk districts", "Overall verification activity", "Open high-risk alerts", "Market intelligence summary"]
    }
  };
  const focus = roleFocus[role] || roleFocus.QA_MANAGER;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        title="Operations Command Center"
        description={`Signed in as ${roleName}. Operational view of pack verification, farmer engagement, counterfeit risk, financial exposure, and market intelligence.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/batches/new" className="rounded-sm bg-seed-800 px-4 py-2 text-sm font-semibold text-white">Register batch</Link>
            <Link href="/admin/pilot-sandbox" className="rounded-sm border border-seed-700 px-4 py-2 text-sm font-semibold text-seed-800">Scenario Control</Link>
            <Link href="/admin/pilot-walkthrough" className="rounded-sm border border-seed-700 px-4 py-2 text-sm font-semibold text-seed-800">Operational Workflow</Link>
          </div>
        }
      />

      <Card className="mb-6 border-l-4 border-l-harvest-300 bg-gradient-to-r from-seed-950 to-seed-800 text-white">
        <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-harvest-300">System status</p>
            <h2 className="mt-2 text-2xl font-bold">Welcome, {roleName}</h2>
            <p className="mt-2 text-sm leading-6 text-seed-50">
              QR verification, risk monitoring, reward engagement, and financial exposure scoring are active.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {["Operational", "QR Active", "Risk Active"].map((item) => (
              <div key={item} className="bg-white/10 p-3 text-center text-sm font-bold text-white">{item}</div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-seed-700">{focus.title}</p>
            <h2 className="mt-1 text-xl font-bold text-seed-950">Role-based command view</h2>
          </div>
          <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {focus.points.map((point) => (
              <div key={point} className="bg-seed-50 p-3 text-sm font-semibold text-seed-950">{point}</div>
            ))}
          </div>
        </div>
      </Card>

      <ProblemAlignment compact />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Verified Packs" value={totalPacks} />
        <StatCard label="Registered Batches" value={totalBatches} />
        <StatCard label="Scan Events" value={totalScans} />
        <StatCard label="Counterfeit Reports" value={totalReports} tone="red" />
        <StatCard label="Reward Entries" value={totalRewards} />
        <StatCard label="Open Risk Alerts" value={totalAlerts} tone="red" />
        <StatCard label="Financial Exposure" value={money(exposureAgg._sum.estimatedExposure || 0)} tone="red" />
        <StatCard label="Counterfeit Hotspots" value={districtScans.length} tone="gray" />
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-seed-950">Management Insights</h2>
        <p className="mt-1 text-sm text-gray-600">Plain-language interpretation for Seed Co QA and Commercial teams.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {insightCards.map((insight) => (
            <div key={insight} className="rounded-md border border-seed-100 bg-white p-3 text-sm font-medium text-gray-800 shadow-sm">
              {insight}
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-seed-900">Pack Verification Activity</h2>
            <Link href="/api/export/scans" className="text-sm font-semibold text-seed-700">Export Scans</Link>
          </div>
          <div className="overflow-x-auto">
            {recentScans.length === 0 ? (
              <EmptyState message="No scans recorded yet. Use Scenario Control Center to load operational scenario records." />
            ) : (
              <table>
                <thead><tr><th>Pack</th><th>Result</th><th>District</th><th>Time</th></tr></thead>
                <tbody>
                  {recentScans.map((scan) => (
                    <tr key={scan.id}>
                      <td className="font-mono text-xs">{scan.packCode}</td>
                      <td><Badge tone={scan.result === "GENUINE" ? "green" : scan.result === "INVALID" || scan.result === "SUSPICIOUS" ? "red" : "amber"}>{scan.result}</Badge></td>
                      <td>{scan.district || "Unknown"}</td>
                      <td>{date(scan.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-seed-900">Counterfeit Risk Summary</h2>
          <div className="space-y-3">
            {alertLevels.length === 0 ? <EmptyState message="No risk alerts recorded. Use Scenario Control Center to load operational scenario records." /> : alertLevels.map((row) => (
              <div key={row.riskLevel} className="flex items-center justify-between rounded-md bg-gray-50 p-3">
                <Badge tone={row.riskLevel === "HIGH" ? "red" : row.riskLevel === "MEDIUM" ? "amber" : "gray"}>{row.riskLevel}</Badge>
                <span className="text-2xl font-bold text-seed-900">{row._count.id}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-seed-900">Counterfeit Hotspots</h2>
          <div className="space-y-2">
            {hotspotExposure.length === 0 ? <EmptyState message="No hotspot exposure calculated yet." /> : hotspotExposure.map((row) => (
              <div key={row.district} className="rounded-md border border-red-100 p-3">
                <div className="flex justify-between text-sm"><span>{row.district}</span><strong>{row._count.id} alerts</strong></div>
                <div className="mt-1 text-sm font-semibold text-red-700">{money(row._sum.estimatedExposure || 0)} exposure</div>
              </div>
            ))}
          </div>
        </Card>
        <Card id="market-intelligence">
          <h2 className="mb-3 text-lg font-semibold text-seed-900">Scans by Variety</h2>
          <div className="space-y-2">
            {varietyRows.length === 0 ? <EmptyState message="No variety verification activity yet." /> : varietyRows.map(([variety, count]) => (
              <div key={variety}>
                <div className="flex justify-between text-sm"><span>{variety}</span><span>{count}</span></div>
                <div className="mt-1 h-2 rounded bg-gray-100"><div className="h-2 rounded bg-seed-600" style={{ width: `${Math.min(100, count * 20)}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-seed-900">Scans by District</h2>
          <div className="space-y-2">
            {districtScans.length === 0 ? <EmptyState message="No district scan activity yet." /> : districtScans.map((row) => (
              <div key={row.district} className="flex justify-between rounded-md bg-seed-50 p-3 text-sm">
                <span>{row.district}</span>
                <strong>{row._count.id}</strong>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-seed-900">Reward Entries by District</h2>
          <div className="space-y-2">
            {rewardDistrictRows.length === 0 ? <EmptyState message="No reward entries yet." /> : rewardDistrictRows.map(([district, count]) => (
              <div key={district} className="flex justify-between rounded-md bg-gray-50 p-3 text-sm">
                <span>{district}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-seed-900">Suspicious Activity by District</h2>
          <div className="space-y-3">
            {suspiciousDistricts.length === 0 ? <EmptyState message="No suspicious district activity yet." /> : suspiciousDistricts.map((row) => (
              <div key={row.district} className="rounded-md border border-amber-100 p-3 text-sm">
                <strong>{row.district}</strong>
                <div className="text-gray-600">{row._count.id} medium/high risk signals</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-seed-900">Counterfeit Report Density</h2>
            <Link href="/api/export/reports" className="text-sm font-semibold text-seed-700">Export Reports</Link>
          </div>
          <div className="space-y-3">
            {reportDensity.length === 0 ? <EmptyState message="No counterfeit reports submitted yet." /> : reportDensity.map((row) => (
              <div key={row.district} className="rounded-md bg-red-50 p-3 text-sm">
                <strong>{row.district}</strong>
                <div className="text-red-700">{row._count.id} reports</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-seed-900">Dealer Activity</h2>
          <div className="space-y-3">
            {dealerRows.length === 0 ? <EmptyState message="No dealer activity yet." /> : dealerRows.map((dealer) => (
              <div key={dealer.name} className="rounded-md border border-gray-100 p-3 text-sm">
                <div className="font-semibold">{dealer.name}</div>
                <div className="text-gray-600">{dealer.district} · {dealer.packs} packs · {dealer.scans} scans</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-seed-900">High-Risk Packs</h2>
          <div className="space-y-3">
            {highRiskPacks.length === 0 ? <EmptyState message="No high-risk packs yet." /> : highRiskPacks.map((pack) => (
              <div key={pack.id} className="rounded-md border border-red-100 p-3">
                <div className="font-mono text-xs">{pack.packCode}</div>
                <div className="mt-2 flex justify-between text-sm"><Badge tone="red">{pack.status}</Badge><span>{pack.scanCount} scans</span></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-seed-900">Counterfeit Reports</h2>
          <div className="space-y-3">
            {recentReports.length === 0 ? <EmptyState message="No counterfeit reports submitted yet." /> : recentReports.map((report) => (
              <div key={report.id} className="rounded-md bg-gray-50 p-3 text-sm">
                <div className="font-semibold">{report.referenceNumber} · {report.district}</div>
                <div className="text-gray-600">{report.reason}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-seed-900">Farmer Engagement</h2>
            <Link href="/api/export/rewards" className="text-sm font-semibold text-seed-700">Export Reward Entries</Link>
          </div>
          <div className="overflow-x-auto">
            {recentRewards.length === 0 ? (
              <EmptyState message="No reward entries yet." />
            ) : (
              <table>
                <thead><tr><th>Pack</th><th>Phone</th><th>Status</th></tr></thead>
                <tbody>
                  {recentRewards.map((entry) => (
                    <tr key={entry.id}>
                      <td className="font-mono text-xs">{entry.packCode}</td>
                      <td>{entry.phoneNumber || "Not provided"}</td>
                      <td><Badge tone="green">{entry.entryStatus}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
