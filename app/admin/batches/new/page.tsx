import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { createBatchWithPacks } from "../../../../lib/batches";
import { QA_STATUSES } from "../../../../lib/status";
import { PageHeader } from "../../../../components/PageHeader";
import { Card } from "../../../../components/Card";

export const dynamic = "force-dynamic";

async function createBatchAction(formData: FormData) {
  "use server";
  const batch = await createBatchWithPacks({
    crop: String(formData.get("crop") || "Maize"),
    variety: String(formData.get("variety") || ""),
    varietyCode: String(formData.get("varietyCode") || "").toUpperCase(),
    packSizeKg: Number(formData.get("packSizeKg") || 0),
    intendedTotalPacks: Number(formData.get("intendedTotalPacks") || 0),
    productionDate: new Date(String(formData.get("productionDate") || new Date().toISOString())),
    qaStatus: String(formData.get("qaStatus") || "PASSED"),
    germinationRate: Number(formData.get("germinationRate") || 0),
    moistureContent: Number(formData.get("moistureContent") || 0),
    physicalPurity: Number(formData.get("physicalPurity") || 0),
    depotId: String(formData.get("depotId") || ""),
    dealerId: String(formData.get("dealerId") || ""),
    averagePackPrice: Number(formData.get("averagePackPrice") || 35)
  });
  redirect(`/admin/batches/${batch.id}/packs?created=1`);
}

export default async function NewBatchPage() {
  const [depots, dealers] = await Promise.all([
    prisma.depot.findMany({ orderBy: { name: "asc" } }),
    prisma.dealer.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <PageHeader title="Register Batch" description="Create a Seed Co seed batch and automatically generate signed pack-level QR verification links." />
      <Card>
        <form action={createBatchAction} className="grid gap-4 md:grid-cols-2">
          <div><label>Crop</label><input name="crop" defaultValue="Maize" required /></div>
          <div><label>Variety</label><input name="variety" defaultValue="SC403 Hybrid Maize" required /></div>
          <div><label>Variety code</label><input name="varietyCode" defaultValue="SC403" required /></div>
          <div><label>Pack size kg</label><input name="packSizeKg" type="number" step="0.1" defaultValue="5" required /></div>
          <div>
            <label>Intended total packs</label>
            <input name="intendedTotalPacks" type="number" defaultValue="1000" required />
            <p className="mt-1 text-xs text-amber-700">For local system speed, this form generates a maximum of 100 pack records even if the intended total is higher.</p>
          </div>
          <div><label>Production date</label><input name="productionDate" type="date" defaultValue="2026-03-01" required /></div>
          <div>
            <label>QA status</label>
            <select name="qaStatus" defaultValue="PASSED">
              {QA_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <div><label>Germination rate</label><input name="germinationRate" type="number" step="0.1" defaultValue="94" required /></div>
          <div><label>Moisture content</label><input name="moistureContent" type="number" step="0.1" defaultValue="12.5" required /></div>
          <div><label>Physical purity</label><input name="physicalPurity" type="number" step="0.1" defaultValue="99" required /></div>
          <div>
            <label>Depot</label>
            <select name="depotId" required>
              {depots.map((depot) => <option key={depot.id} value={depot.id}>{depot.name} - {depot.district}</option>)}
            </select>
          </div>
          <div>
            <label>Dealer</label>
            <select name="dealerId" required>
              {dealers.map((dealer) => <option key={dealer.id} value={dealer.id}>{dealer.name} - {dealer.district}</option>)}
            </select>
          </div>
          <div><label>Average pack price USD</label><input name="averagePackPrice" type="number" step="0.01" defaultValue="35" required /></div>
          <div className="md:col-span-2">
            <button className="rounded-sm bg-seed-800 px-5 py-3 text-sm font-semibold text-white" type="submit">Create batch and generate QR packs</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
