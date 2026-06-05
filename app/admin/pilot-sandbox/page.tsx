import { redirect } from "next/navigation";
import { loadPilotScenarioData } from "../../../lib/pilotData";
import { Card } from "../../../components/Card";
import { PageHeader } from "../../../components/PageHeader";
import { Badge } from "../../../components/Badge";

export const dynamic = "force-dynamic";

async function loadPilotDataAction() {
  "use server";
  await loadPilotScenarioData();
  redirect("/admin/pilot-sandbox?loaded=1");
}

export default function PilotSandboxPage({ searchParams }: { searchParams: { loaded?: string } }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <PageHeader title="Scenario Control Center" description="Load operational scenario records for a complete SeedShield 360 command-center flow." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {searchParams.loaded ? (
            <div className="mb-4 bg-seed-50 p-3 text-sm text-seed-900">
              <Badge tone="green">Operational Records Loaded</Badge>
              <div className="mt-2">The scenario records have been refreshed and are ready for command center review.</div>
            </div>
          ) : null}
          <h2 className="text-xl font-bold text-seed-950">Operational scenario</h2>
          <p className="mt-3 text-gray-700">
            A Seed Co batch is registered, unique pack QR codes are generated, farmers scan packs, rewards motivate scanning,
            suspicious repeated scans trigger risk alerts, counterfeit reports create hotspot intelligence, and management sees
            financial exposure and market intelligence on the dashboard.
          </p>
          <form action={loadPilotDataAction} className="mt-6">
            <button className="rounded-sm bg-seed-800 px-5 py-3 text-sm font-semibold text-white" type="submit">
              Load Operational Scenario Records
            </button>
          </form>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-seed-950">Records included</h2>
          <div className="mt-3 space-y-2 text-sm">
            {["batches", "packs", "scans", "counterfeit reports", "reward entries", "risk alerts", "extension logs"].map((item) => (
              <div key={item} className="bg-gray-50 p-2 capitalize">{item}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
