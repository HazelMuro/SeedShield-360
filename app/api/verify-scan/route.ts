import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifyPackSignature } from "../../../lib/security";
import { getPlantingTip } from "../../../lib/plantingTips";
import { evaluateScan, recordInvalidCode } from "../../../lib/risk";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      packCode?: string;
      sig?: string;
      district?: string;
      latitude?: number;
      longitude?: number;
      deviceInfo?: string;
    };

    const packCode = (body.packCode || "").trim();
    const signature = (body.sig || "").trim();
    const district = body.district?.trim() || null;

    if (!packCode) {
      return NextResponse.json({ result: "INVALID", message: "Code not found or invalid" }, { status: 400 });
    }

    const pack = await prisma.pack.findUnique({
      where: { packCode },
      include: { batch: { include: { dealer: true, depot: true } } }
    });

    if (!pack || !verifyPackSignature(packCode, signature)) {
      await recordInvalidCode(packCode, district, body.deviceInfo);
      return NextResponse.json({
        result: "INVALID",
        message: "Code not found or invalid",
        explanation: "This product may not be registered in SeedShield."
      });
    }

    const { result, pack: updatedPack } = await evaluateScan({
      packCode,
      district,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      deviceInfo: body.deviceInfo
    });

    if (!updatedPack) {
      return NextResponse.json({ result: "INVALID", message: "Code not found or invalid" });
    }

    return NextResponse.json({
      result,
      packCode,
      signature,
      scanCount: updatedPack.scanCount,
      status: updatedPack.status,
      batch: {
        batchCode: updatedPack.batch.batchCode,
        crop: updatedPack.batch.crop,
        variety: updatedPack.batch.variety,
        varietyCode: updatedPack.batch.varietyCode,
        packSizeKg: updatedPack.batch.packSizeKg,
        qaStatus: updatedPack.batch.qaStatus,
        productionDate: updatedPack.batch.productionDate,
        dealerDistrict: updatedPack.batch.dealer.district
      },
      plantingTip: getPlantingTip(updatedPack.batch.varietyCode)
    });
  } catch {
    return NextResponse.json(
      {
        result: "INVALID",
        message: "Verification temporarily unavailable",
        explanation: "Please try again or report the seed pack for Seed Co follow-up."
      },
      { status: 500 }
    );
  }
}
