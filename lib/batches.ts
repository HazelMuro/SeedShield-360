import { prisma } from "./prisma";
import { signPackCode } from "./security";
import { createAuditLog } from "./audit";

const PILOT_PACK_LIMIT = 100;

export function makeBatchCode(varietyCode: string, batchNumber: string | number) {
  const normalizedBatch = String(batchNumber).padStart(4, "0");
  return `SC-ZW-${varietyCode.toUpperCase()}-2026-${normalizedBatch}`;
}

export function makePackCode(batchCode: string, serialNumber: number) {
  return `${batchCode}-PK${String(serialNumber).padStart(6, "0")}`;
}

async function nextBatchNumber() {
  const existing = await prisma.batch.count();
  return String(existing + 47).padStart(4, "0");
}

export async function createBatchWithPacks(data: {
  crop: string;
  variety: string;
  varietyCode: string;
  packSizeKg: number;
  intendedTotalPacks: number;
  productionDate: Date;
  qaStatus: string;
  germinationRate: number;
  moistureContent: number;
  physicalPurity: number;
  depotId: string;
  dealerId: string;
  averagePackPrice: number;
  batchNumber?: string;
}) {
  const generatedPilotPacks = Math.min(data.intendedTotalPacks, PILOT_PACK_LIMIT);
  const batchCode = makeBatchCode(data.varietyCode, data.batchNumber || (await nextBatchNumber()));

  const batch = await prisma.batch.create({
    data: {
      batchCode,
      crop: data.crop,
      variety: data.variety,
      varietyCode: data.varietyCode.toUpperCase(),
      packSizeKg: data.packSizeKg,
      intendedTotalPacks: data.intendedTotalPacks,
      generatedPilotPacks,
      productionDate: data.productionDate,
      qaStatus: data.qaStatus,
      germinationRate: data.germinationRate,
      moistureContent: data.moistureContent,
      physicalPurity: data.physicalPurity,
      depotId: data.depotId,
      dealerId: data.dealerId,
      averagePackPrice: data.averagePackPrice
    }
  });

  const packs = Array.from({ length: generatedPilotPacks }, (_, index) => {
    const serialNumber = index + 1;
    const packCode = makePackCode(batchCode, serialNumber);
    return {
      packCode,
      serialNumber,
      batchId: batch.id,
      signature: signPackCode(packCode)
    };
  });

  await prisma.pack.createMany({ data: packs });
  await createAuditLog({
    entityType: "Batch",
    entityId: batch.id,
    action: "batch created",
    details: { batchCode, intendedTotalPacks: data.intendedTotalPacks, generatedPilotPacks }
  });
  await createAuditLog({
    entityType: "Batch",
    entityId: batch.id,
    action: "packs generated",
    details: { batchCode, generatedPilotPacks }
  });

  return batch;
}
