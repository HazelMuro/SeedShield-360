import { prisma } from "../../../../lib/prisma";
import { csvResponse } from "../../../../lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const scans = await prisma.scanEvent.findMany({ orderBy: { createdAt: "desc" } });
  return csvResponse(
    "seedshield-scan-events.csv",
    scans.map((scan) => ({
      packCode: scan.packCode,
      result: scan.result,
      district: scan.district || "",
      latitude: scan.latitude || "",
      longitude: scan.longitude || "",
      deviceInfo: scan.deviceInfo || "",
      createdAt: scan.createdAt.toISOString()
    }))
  );
}
