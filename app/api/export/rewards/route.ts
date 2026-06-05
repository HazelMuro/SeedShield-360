import { prisma } from "../../../../lib/prisma";
import { csvResponse } from "../../../../lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const rewards = await prisma.rewardEntry.findMany({ orderBy: { createdAt: "desc" } });
  return csvResponse(
    "seedshield-reward-entries.csv",
    rewards.map((entry) => ({
      packCode: entry.packCode,
      phoneNumber: entry.phoneNumber,
      campaignName: entry.campaignName,
      entryStatus: entry.entryStatus,
      createdAt: entry.createdAt.toISOString()
    }))
  );
}
