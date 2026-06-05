import { prisma } from "./prisma";
import type { RiskLevel, ScanResult } from "./status";
import { createAuditLog } from "./audit";

const FALLBACK_PRICE = 35;

function multiplier(level: RiskLevel) {
  if (level === "HIGH") return 2;
  if (level === "MEDIUM") return 1.5;
  return 1;
}

async function packPrice(packCode?: string | null) {
  if (!packCode) return FALLBACK_PRICE;
  const pack = await prisma.pack.findUnique({
    where: { packCode },
    include: { batch: true }
  });
  return pack?.batch.averagePackPrice || FALLBACK_PRICE;
}

export async function createRiskAlert(data: {
  alertType: string;
  packCode?: string | null;
  district?: string | null;
  riskLevel: RiskLevel;
  reason: string;
  suspectedPacks: number;
}) {
  const price = await packPrice(data.packCode);
  const estimatedExposure = data.suspectedPacks * price * multiplier(data.riskLevel);
  const alert = await prisma.riskAlert.create({
    data: {
      alertType: data.alertType,
      packCode: data.packCode || null,
      district: data.district || null,
      riskLevel: data.riskLevel,
      reason: data.reason,
      estimatedExposure
    }
  });
  await createAuditLog({
    entityType: "RiskAlert",
    entityId: alert.id,
    action: "risk alert created",
    details: alert
  });
  return alert;
}

export async function recordInvalidCode(packCode: string, district?: string | null, deviceInfo?: string | null) {
  const scan = await prisma.scanEvent.create({
    data: {
      packCode,
      result: "INVALID",
      district: district || null,
      deviceInfo: deviceInfo || null
    }
  });
  await createAuditLog({
    entityType: "ScanEvent",
    entityId: scan.id,
    action: "pack scanned",
    details: { packCode, result: "INVALID" }
  });
  await createRiskAlert({
    alertType: "INVALID_CODE",
    packCode,
    district,
    riskLevel: "LOW",
    reason: "Unknown or unsigned pack code was submitted for verification.",
    suspectedPacks: 1
  });
  return scan;
}

export async function evaluateScan(params: {
  packCode: string;
  district?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  deviceInfo?: string | null;
}) {
  const pack = await prisma.pack.findUnique({
    where: { packCode: params.packCode },
    include: { batch: { include: { dealer: true } } }
  });

  if (!pack) {
    await recordInvalidCode(params.packCode, params.district, params.deviceInfo);
    return { result: "INVALID" as ScanResult, pack: null };
  }

  const previousScanCount = pack.scanCount;
  let result: ScanResult = previousScanCount === 0 ? "GENUINE" : "ALREADY_SCANNED";
  if (pack.status === "SUSPICIOUS" || previousScanCount >= 2) result = "SUSPICIOUS";

  const now = new Date();
  const scan = await prisma.scanEvent.create({
    data: {
      packCode: pack.packCode,
      packId: pack.id,
      result,
      district: params.district || null,
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      deviceInfo: params.deviceInfo || null
    }
  });

  const updatedScanCount = previousScanCount + 1;
  let newStatus = pack.status;
  if (updatedScanCount === 2) newStatus = "ALREADY_SCANNED";
  if (updatedScanCount >= 3 || result === "SUSPICIOUS") newStatus = "SUSPICIOUS";

  await prisma.pack.update({
    where: { id: pack.id },
    data: {
      scanCount: updatedScanCount,
      status: newStatus,
      firstScannedAt: pack.firstScannedAt || now,
      lastScannedAt: now
    }
  });

  await createAuditLog({
    entityType: "ScanEvent",
    entityId: scan.id,
    action: "pack scanned",
    details: { packCode: pack.packCode, result, district: params.district }
  });

  if (updatedScanCount === 2) {
    await createRiskAlert({
      alertType: "DUPLICATE_SCAN",
      packCode: pack.packCode,
      district: params.district,
      riskLevel: "LOW",
      reason: "Pack code has been scanned for a second time.",
      suspectedPacks: 1
    });
  }

  if (updatedScanCount >= 3) {
    result = "SUSPICIOUS";
    await createRiskAlert({
      alertType: "MULTIPLE_SCANS",
      packCode: pack.packCode,
      district: params.district,
      riskLevel: "HIGH",
      reason: `Pack code has been scanned ${updatedScanCount} times.`,
      suspectedPacks: updatedScanCount
    });
  }

  if (params.district && pack.batch.dealer.district && params.district !== pack.batch.dealer.district) {
    await createRiskAlert({
      alertType: "LOCATION_MISMATCH",
      packCode: pack.packCode,
      district: params.district,
      riskLevel: "MEDIUM",
      reason: `Scan district ${params.district} differs from assigned dealer district ${pack.batch.dealer.district}.`,
      suspectedPacks: 1
    });
  }

  const districts = await prisma.scanEvent.findMany({
    where: { packCode: pack.packCode, district: { not: null } },
    select: { district: true },
    distinct: ["district"]
  });
  if (districts.length >= 2) {
    result = "SUSPICIOUS";
    await prisma.pack.update({ where: { id: pack.id }, data: { status: "SUSPICIOUS" } });
    await createRiskAlert({
      alertType: "LOCATION_MISMATCH",
      packCode: pack.packCode,
      district: params.district,
      riskLevel: "HIGH",
      reason: "Same pack code has appeared in two or more districts.",
      suspectedPacks: districts.length
    });
  }

  const refreshedPack = await prisma.pack.findUnique({
    where: { id: pack.id },
    include: { batch: { include: { dealer: true, depot: true } } }
  });
  return { result, pack: refreshedPack };
}

export async function evaluateReportCluster(district: string) {
  const count = await prisma.counterfeitReport.count({ where: { district } });
  if (count >= 3) {
    await createRiskAlert({
      alertType: "REPORT_CLUSTER",
      district,
      riskLevel: "HIGH",
      reason: `${count} counterfeit reports have been submitted from ${district}.`,
      suspectedPacks: count
    });
  }
}
