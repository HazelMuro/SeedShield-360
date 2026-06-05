import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { createAuditLog } from "../../lib/audit";
import { evaluateReportCluster } from "../../lib/risk";
import { Card } from "../../components/Card";
import { PageHeader } from "../../components/PageHeader";
import { Badge } from "../../components/Badge";
import { ReportForm } from "./ReportForm";

export const dynamic = "force-dynamic";

async function nextReferenceNumber() {
  const count = await prisma.counterfeitReport.count();
  return `RPT-2026-${String(count + 1).padStart(4, "0")}`;
}

async function reportAction(formData: FormData) {
  "use server";
  const description = String(formData.get("description") || "").trim();
  const district = String(formData.get("district") || "").trim();
  if (!description || !district) {
    redirect("/report?error=missing");
  }
  let destination = "/report?error=1";
  try {
    const referenceNumber = await nextReferenceNumber();
    const report = await prisma.counterfeitReport.create({
      data: {
        referenceNumber,
        packCode: String(formData.get("packCode") || "") || null,
        reason: String(formData.get("reason") || "Other"),
        description,
        sellerName: String(formData.get("sellerName") || "") || null,
        district,
        phoneNumber: String(formData.get("phoneNumber") || "") || null,
        photoUrl: String(formData.get("photoUrl") || "") || null,
        latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
        longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null
      }
    });
    await createAuditLog({
      entityType: "CounterfeitReport",
      entityId: report.id,
      action: "report submitted",
      details: report
    });
    await evaluateReportCluster(report.district);
    destination = `/report?reference=${referenceNumber}`;
  } catch {
    destination = "/report?error=1";
  }
  redirect(destination);
}

export default function ReportPage({
  searchParams
}: {
  searchParams: { reference?: string; pack_code?: string; reason?: string; district?: string; error?: string };
}) {
  if (searchParams.reference) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <Badge tone="green">RECEIVED</Badge>
          <h1 className="mt-4 text-3xl font-bold text-seed-900">Thank you. Your report has been received.</h1>
          <p className="mt-3 text-gray-600">Reference number: <strong>{searchParams.reference}</strong></p>
          <Link className="mt-5 inline-flex rounded-sm bg-seed-800 px-4 py-2 text-sm font-semibold text-white" href="/">Return home</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader title="Report Suspicious Seed" description="Help protect farmers and Seed Co's certified seed supply chain." />
      <Card>
        {searchParams.error ? (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-800">
            {searchParams.error === "missing"
              ? "Please add a district and a short description before submitting your report."
              : "Your report could not be submitted right now. Please try again."}
          </div>
        ) : null}
        <ReportForm action={reportAction} packCode={searchParams.pack_code || ""} reason={searchParams.reason || ""} district={searchParams.district || ""} />
      </Card>
    </div>
  );
}
