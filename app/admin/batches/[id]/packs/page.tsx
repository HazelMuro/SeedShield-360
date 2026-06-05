import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import { getVerificationUrl } from "../../../../../lib/url";
import { date, shortDate } from "../../../../../lib/format";
import { PageHeader } from "../../../../../components/PageHeader";
import { Card } from "../../../../../components/Card";
import { Badge } from "../../../../../components/Badge";

export const dynamic = "force-dynamic";

export default async function BatchPacksPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { created?: string };
}) {
  const batch = await prisma.batch.findUnique({
    where: { id: params.id },
    include: { packs: { orderBy: { serialNumber: "asc" } }, dealer: true, depot: true }
  });
  if (!batch) notFound();

  const packRows = await Promise.all(
    batch.packs.map(async (pack) => {
      const url = getVerificationUrl(pack.packCode, pack.signature);
      const qr = await QRCode.toDataURL(url, { margin: 1, width: 180 });
      return { ...pack, url, qr };
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        title={`Packs for ${batch.batchCode}`}
        description={`${batch.variety} - ${batch.packSizeKg}kg - ${batch.dealer.name} - produced ${shortDate(batch.productionDate)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/batches/${batch.id}/labels`} className="rounded-sm bg-seed-800 px-4 py-2 text-sm font-semibold text-white">Print QR labels</Link>
            <Link href="/admin/batches" className="rounded-sm border border-seed-700 px-4 py-2 text-sm font-semibold text-seed-800">Back to batches</Link>
          </div>
        }
      />
      {searchParams.created ? (
        <div className="mb-4 border border-seed-200 bg-seed-50 p-4 text-sm text-seed-950">
          Batch created successfully. Pack QR codes generated for this batch.
        </div>
      ) : null}
      <div className="mb-4 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Intended total: {batch.intendedTotalPacks}. Pack records generated for this scenario: {batch.generatedPilotPacks}. Use any verification link below for the farmer scan flow.
      </div>
      {packRows.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-600">No pack records were generated for this batch. Create a batch with at least one pack record to print labels and QR codes.</p>
        </Card>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {packRows.map((pack) => (
          <Card key={pack.id}>
            <div className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pack.qr} alt={`QR code for ${pack.packCode}`} className="h-32 w-32 rounded-sm border border-gray-200" />
              <div className="min-w-0 flex-1">
                <div className="break-all font-mono text-xs font-semibold">{pack.packCode}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={pack.status === "ACTIVE" ? "green" : pack.status === "SUSPICIOUS" ? "red" : "amber"}>{pack.status}</Badge>
                  <Badge>{pack.scanCount} scans</Badge>
                </div>
                <div className="mt-2 text-xs text-gray-600">First: {date(pack.firstScannedAt)}</div>
                <div className="text-xs text-gray-600">Last: {date(pack.lastScannedAt)}</div>
              </div>
            </div>
            <textarea className="mt-4 h-20 font-mono text-xs" readOnly value={pack.url} />
            <div className="mt-3 flex flex-wrap gap-2">
              <Link target="_blank" className="rounded-sm bg-seed-800 px-3 py-2 text-sm font-semibold text-white" href={pack.url}>Open verification</Link>
              <a download={`${pack.packCode}.png`} href={pack.qr} className="rounded-sm border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">Download QR</a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
