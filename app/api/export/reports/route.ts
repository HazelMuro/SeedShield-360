import { prisma } from "../../../../lib/prisma";
import { csvResponse } from "../../../../lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const reports = await prisma.counterfeitReport.findMany({ orderBy: { createdAt: "desc" } });
  return csvResponse(
    "seedshield-counterfeit-reports.csv",
    reports.map((report) => ({
      referenceNumber: report.referenceNumber,
      packCode: report.packCode || "",
      reason: report.reason,
      description: report.description,
      sellerName: report.sellerName || "",
      district: report.district,
      phoneNumber: report.phoneNumber || "",
      photoUrl: report.photoUrl || "",
      latitude: report.latitude || "",
      longitude: report.longitude || "",
      createdAt: report.createdAt.toISOString()
    }))
  );
}
