import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import { getVerificationUrl } from "../../../../../lib/url";
import { PageHeader } from "../../../../../components/PageHeader";
import { Card } from "../../../../../components/Card";

export const dynamic = "force-dynamic";

export default async function BatchLabelsPage({ params }: { params: { id: string } }) {
  const batch = await prisma.batch.findUnique({
    where: { id: params.id },
    include: { packs: { orderBy: { serialNumber: "asc" } } }
  });
  if (!batch) notFound();

  const labels = await Promise.all(
    batch.packs.map(async (pack) => {
      const url = getVerificationUrl(pack.packCode, pack.signature);
      const qr = await QRCode.toDataURL(url, { margin: 1, width: 170 });
      return { pack, qr };
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <style>{`
        @media print {
          header, .no-print { display: none !important; }
          body { background: white; }
          .label-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10mm; }
          .label-card { break-inside: avoid; box-shadow: none; border: 1px solid #111; }
        }
      `}</style>
      <div className="no-print">
        <PageHeader
          title="Print-Ready QR Labels"
          description={`${batch.batchCode} - ${batch.variety} - ${batch.packSizeKg}kg`}
          action={<Link href={`/admin/batches/${batch.id}/packs`} className="rounded-sm border border-seed-700 px-4 py-2 text-sm font-semibold text-seed-800">Back to packs</Link>}
        />
        <p className="mb-4 bg-seed-50 p-3 text-sm text-seed-950">Use your browser print command to print these labels for seed pack verification workflows.</p>
      </div>
      {labels.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-600">No pack labels are available because this batch has zero generated pack records.</p>
        </Card>
      ) : null}
      <div className="label-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labels.map(({ pack, qr }) => (
          <div key={pack.id} className="label-card border-2 border-seed-800 bg-white p-4">
            <div className="-mx-4 -mt-4 bg-seed-800 px-4 py-3 text-white">
              <div className="text-xs font-semibold uppercase tracking-wide text-harvest-300">SeedShield 360</div>
              <h2 className="mt-1 text-lg font-bold">Seed Co Pack Verification</h2>
            </div>
            <div className="mt-3 flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt={`QR code for ${pack.packCode}`} className="h-32 w-32 border border-gray-200" />
              <div className="text-sm">
                <div className="font-semibold">{batch.variety}</div>
                <div>{batch.packSizeKg}kg pack</div>
                <div className="mt-2 text-xs text-gray-600">Batch</div>
                <div className="font-mono text-xs">{batch.batchCode}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-600">Pack code</div>
            <div className="break-all font-mono text-xs font-semibold">{pack.packCode}</div>
            <p className="mt-3 bg-seed-50 p-2 text-xs font-medium text-seed-950">
              Scan to verify genuine Seed Co seed and receive planting tips.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
