import { Card } from "../../../components/Card";
import { PageHeader } from "../../../components/PageHeader";
import { Badge } from "../../../components/Badge";

const items = [
  "Pack-level QR verification working",
  "Signed QR codes working",
  "Scan logging working",
  "Farmer reward entry working",
  "Counterfeit reporting working",
  "Rule-based risk alerts working",
  "Financial exposure scoring working",
  "Operations command center working",
  "Market intelligence visible",
  "Role-based access working",
  "CSV export available",
  "Local offline version available on port 3005",
  "Online deployment instructions ready",
  "Ready for Seed Co operational data integration"
];

const limitations = [
  "Current version uses Seed Co-style operational scenario records.",
  "Real Seed Co batch, dealer and QA records would be connected during an official rollout.",
  "Current anomaly detection is rule-based for explainability.",
  "Machine learning can be introduced after real scan, report and investigation data is collected.",
  "SMS/USSD can be added to support farmers without smartphones.",
  "ERP integration can be added after Seed Co confirms existing systems."
];

export default function PilotReadinessPage() {
  const complete = items.length;
  const score = Math.round((complete / items.length) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <PageHeader title="System Readiness" description="Operational checklist for SeedShield 360 verification, intelligence, and deployment readiness." />
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-seed-700">System Readiness Score</p>
          <div className="mt-3 text-6xl font-bold text-seed-800">{score}%</div>
          <p className="mt-3 text-sm text-gray-600">
            Core verification, reporting, alerting, export, role access, and command center capabilities are ready for controlled operational use.
          </p>
        </Card>
        <Card>
          <div className="grid gap-3">
            {items.map((item) => (
              <div key={item} className="flex items-center justify-between gap-4 border border-seed-100 bg-seed-50 p-3">
                <span className="font-medium text-seed-950">{item}</span>
                <Badge tone="green">READY</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-4">
        <h2 className="text-lg font-semibold text-seed-900">Known Limitations and Next Operational Steps</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {limitations.map((item) => (
            <div key={item} className="border border-gray-200 bg-white p-3 text-sm text-gray-700">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
