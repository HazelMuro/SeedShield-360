import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { createAuditLog } from "../../../lib/audit";
import { date } from "../../../lib/format";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Card";
import { Badge } from "../../../components/Badge";

export const dynamic = "force-dynamic";

async function extensionLogAction(formData: FormData) {
  "use server";
  const log = await prisma.extensionLog.create({
    data: {
      farmerName: String(formData.get("farmerName") || "") || null,
      district: String(formData.get("district") || ""),
      agronomistName: String(formData.get("agronomistName") || ""),
      varietyDiscussed: String(formData.get("varietyDiscussed") || ""),
      recommendation: String(formData.get("recommendation") || ""),
      farmerFeedback: String(formData.get("farmerFeedback") || ""),
      followUpRequired: formData.get("followUpRequired") === "on"
    }
  });
  await createAuditLog({
    entityType: "ExtensionLog",
    entityId: log.id,
    action: "extension log created",
    details: log
  });
  redirect("/admin/extension-logs");
}

export default async function ExtensionLogsPage() {
  const logs = await prisma.extensionLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader title="Farmer Extension Logs" description="Simple working module for agronomist recommendations, farmer feedback, and follow-up tracking." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-seed-900">Add log</h2>
          <form action={extensionLogAction} className="space-y-3">
            <div><label>Farmer name, optional</label><input name="farmerName" /></div>
            <div><label>District</label><input name="district" required /></div>
            <div><label>Agronomist name</label><input name="agronomistName" required /></div>
            <div><label>Variety discussed</label><input name="varietyDiscussed" defaultValue="SC403" required /></div>
            <div><label>Recommendation</label><textarea name="recommendation" required /></div>
            <div><label>Farmer feedback</label><textarea name="farmerFeedback" required /></div>
            <label className="flex items-center gap-3 rounded-md border border-gray-200 p-3">
              <input name="followUpRequired" type="checkbox" className="h-4 w-4" />
              <span>Follow-up required</span>
            </label>
            <button className="w-full rounded-md bg-seed-600 px-4 py-3 text-sm font-semibold text-white" type="submit">Save extension log</button>
          </form>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-seed-900">Saved logs</h2>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Farmer</th><th>District</th><th>Agronomist</th><th>Variety</th><th>Recommendation</th><th>Follow-up</th><th>Created</th></tr></thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.farmerName || "Not provided"}</td>
                    <td>{log.district}</td>
                    <td>{log.agronomistName}</td>
                    <td>{log.varietyDiscussed}</td>
                    <td className="max-w-sm">{log.recommendation}</td>
                    <td><Badge tone={log.followUpRequired ? "amber" : "green"}>{log.followUpRequired ? "YES" : "NO"}</Badge></td>
                    <td>{date(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
