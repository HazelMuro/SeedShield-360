import { prisma } from "./prisma";
import { createBatchWithPacks } from "./batches";
import { signPackCode } from "./security";
import { createAuditLog } from "./audit";
import { createRiskAlert, evaluateReportCluster, evaluateScan } from "./risk";

export async function loadPilotScenarioData() {
  await prisma.auditLog.deleteMany();
  await prisma.rewardEntry.deleteMany();
  await prisma.riskAlert.deleteMany();
  await prisma.counterfeitReport.deleteMany();
  await prisma.scanEvent.deleteMany();
  await prisma.pack.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.dealer.deleteMany();
  await prisma.depot.deleteMany();
  await prisma.extensionLog.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { name: "QA Manager", email: "qa.manager@seedshield.local", role: "QA_MANAGER" },
      { name: "Commercial Manager", email: "commercial.manager@seedshield.local", role: "COMMERCIAL_MANAGER" },
      { name: "Depot Officer", email: "depot.officer@seedshield.local", role: "DEPOT_OFFICER" },
      { name: "Dealer", email: "dealer@seedshield.local", role: "DEALER" },
      { name: "Executive", email: "executive@seedshield.local", role: "EXECUTIVE" }
    ]
  });

  const mutareDepot = await prisma.depot.create({
    data: { name: "Mutare Depot", district: "Mutare", province: "Manicaland" }
  });
  const gweruDepot = await prisma.depot.create({
    data: { name: "Gweru Depot", district: "Gweru", province: "Midlands" }
  });
  const masvingoDepot = await prisma.depot.create({
    data: { name: "Masvingo Depot", district: "Masvingo", province: "Masvingo" }
  });

  const agroPlus = await prisma.dealer.create({
    data: { name: "AgroPlus Mutare", district: "Mutare", province: "Manicaland", depotId: mutareDepot.id }
  });
  const midlands = await prisma.dealer.create({
    data: { name: "Midlands Farm Supplies", district: "Gweru", province: "Midlands", depotId: gweruDepot.id }
  });
  const masvingo = await prisma.dealer.create({
    data: { name: "Masvingo Agro Centre", district: "Masvingo", province: "Masvingo", depotId: masvingoDepot.id }
  });
  await prisma.dealer.create({
    data: { name: "Harare Seed Hub", district: "Harare", province: "Harare", depotId: mutareDepot.id }
  });
  await prisma.dealer.create({
    data: { name: "Chinhoyi Agro Dealer", district: "Chinhoyi", province: "Mashonaland West", depotId: gweruDepot.id }
  });

  const batch403 = await createBatchWithPacks({
    crop: "Maize",
    variety: "SC403 Hybrid Maize",
    varietyCode: "SC403",
    packSizeKg: 5,
    intendedTotalPacks: 1000,
    productionDate: new Date("2026-01-18"),
    qaStatus: "PASSED",
    germinationRate: 94,
    moistureContent: 12.5,
    physicalPurity: 99,
    depotId: mutareDepot.id,
    dealerId: agroPlus.id,
    averagePackPrice: 35,
    batchNumber: "0047"
  });

  const batch513 = await createBatchWithPacks({
    crop: "Maize",
    variety: "SC513 Hybrid Maize",
    varietyCode: "SC513",
    packSizeKg: 10,
    intendedTotalPacks: 800,
    productionDate: new Date("2026-02-02"),
    qaStatus: "PASSED",
    germinationRate: 92,
    moistureContent: 12.9,
    physicalPurity: 98.8,
    depotId: gweruDepot.id,
    dealerId: midlands.id,
    averagePackPrice: 60,
    batchNumber: "0051"
  });

  const batch719 = await createBatchWithPacks({
    crop: "Maize",
    variety: "SC719 Hybrid Maize",
    varietyCode: "SC719",
    packSizeKg: 10,
    intendedTotalPacks: 650,
    productionDate: new Date("2026-02-15"),
    qaStatus: "PASSED",
    germinationRate: 95,
    moistureContent: 12.2,
    physicalPurity: 99.2,
    depotId: masvingoDepot.id,
    dealerId: masvingo.id,
    averagePackPrice: 75,
    batchNumber: "0062"
  });

  const p403One = "SC-ZW-SC403-2026-0047-PK000001";
  const p403Two = "SC-ZW-SC403-2026-0047-PK000002";
  const p513One = "SC-ZW-SC513-2026-0051-PK000001";
  const p719One = "SC-ZW-SC719-2026-0062-PK000001";

  await evaluateScan({ packCode: p403One, district: "Mutare", deviceInfo: "SeedShield browser" });
  await evaluateScan({ packCode: p403Two, district: "Mutare", deviceInfo: "SeedShield browser" });
  await evaluateScan({ packCode: p403Two, district: "Harare", deviceInfo: "SeedShield browser" });
  await evaluateScan({ packCode: p513One, district: "Gweru", deviceInfo: "SeedShield browser" });
  await evaluateScan({ packCode: p719One, district: "Masvingo", deviceInfo: "SeedShield browser" });
  await evaluateScan({ packCode: p719One, district: "Chinhoyi", deviceInfo: "SeedShield browser" });
  await evaluateScan({ packCode: "SC-ZW-UNREGISTERED-2026-0999-PK000111", district: "Harare" });

  const pack403 = await prisma.pack.findUnique({ where: { packCode: p403One } });
  if (pack403) {
    const reward = await prisma.rewardEntry.create({
      data: {
        packCode: p403One,
        packId: pack403.id,
        phoneNumber: "0772123456",
        campaignName: "SeedShield 2026 Farmer Support Rewards",
        entryStatus: "VALID"
      }
    });
    await createAuditLog({
      entityType: "RewardEntry",
      entityId: reward.id,
      action: "reward entry created",
      details: reward
    });
  }

  const reportRows = [
    {
      referenceNumber: "RPT-2026-0001",
      packCode: p403Two,
      reason: "Code already scanned",
      description: "Dealer pack was reported as already scanned by a different buyer.",
      sellerName: "Street vendor near bus rank",
      district: "Harare",
      phoneNumber: "0772987654"
    },
    {
      referenceNumber: "RPT-2026-0002",
      packCode: null,
      reason: "Suspicious packaging",
      description: "Packaging print looked faded and bag stitching was poor.",
      sellerName: "Open market seller",
      district: "Harare",
      phoneNumber: null
    },
    {
      referenceNumber: "RPT-2026-0003",
      packCode: null,
      reason: "Poor germination",
      description: "Several farmers in the area complained about poor emergence.",
      sellerName: "Unknown",
      district: "Harare",
      phoneNumber: null
    },
    {
      referenceNumber: "RPT-2026-0004",
      packCode: p719One,
      reason: "Suspicious seller",
      description: "Seller could not identify the Seed Co dealer source.",
      sellerName: "Roadside seller",
      district: "Chinhoyi",
      phoneNumber: null
    }
  ];

  for (const row of reportRows) {
    const report = await prisma.counterfeitReport.create({ data: row });
    await createAuditLog({
      entityType: "CounterfeitReport",
      entityId: report.id,
      action: "report submitted",
      details: report
    });
    await evaluateReportCluster(report.district);
  }

  await createRiskAlert({
    alertType: "DEALER_RISK",
    district: "Harare",
    riskLevel: "MEDIUM",
    reason: "Reports mention informal sellers around Harare markets.",
    suspectedPacks: 2
  });

  const logs = await prisma.extensionLog.createMany({
    data: [
      {
        farmerName: "Tariro Moyo",
        district: "Mutare",
        agronomistName: "R. Dube",
        varietyDiscussed: "SC403",
        recommendation: "Plant with first effective rains and keep spacing consistent.",
        farmerFeedback: "Requested fertiliser guidance.",
        followUpRequired: true
      },
      {
        farmerName: "Blessing Ncube",
        district: "Gweru",
        agronomistName: "N. Sibanda",
        varietyDiscussed: "SC513",
        recommendation: "Use medium rainfall guidance and early weed control.",
        farmerFeedback: "Positive response to planting tips concept.",
        followUpRequired: false
      }
    ]
  });
  await createAuditLog({
    entityType: "ExtensionLog",
    entityId: "scenario-seed",
    action: "extension log created",
    details: logs
  });

  return {
    batches: [batch403.batchCode, batch513.batchCode, batch719.batchCode],
    exampleSignature: signPackCode(p403One).slice(0, 12)
  };
}
