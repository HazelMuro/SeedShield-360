import { prisma } from "../../../../lib/prisma";
import { csvResponse } from "../../../../lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const alerts = await prisma.riskAlert.findMany({ orderBy: { createdAt: "desc" } });
  return csvResponse(
    "seedshield-risk-alerts.csv",
    alerts.map((alert) => ({
      alertType: alert.alertType,
      packCode: alert.packCode || "",
      district: alert.district || "",
      riskLevel: alert.riskLevel,
      reason: alert.reason,
      estimatedExposure: alert.estimatedExposure,
      status: alert.status,
      createdAt: alert.createdAt.toISOString()
    }))
  );
}
