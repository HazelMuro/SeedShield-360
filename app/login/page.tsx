import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { roles, roleLabel } from "../../lib/auth";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";

export const dynamic = "force-dynamic";

async function accessAction(formData: FormData) {
  "use server";
  const pin = String(formData.get("pin") || "");
  const role = String(formData.get("role") || "QA_MANAGER");
  const next = String(formData.get("next") || "/admin/dashboard");
  if (pin !== "3600") redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  const label = roleLabel(role);
  cookies().set("seedshield_role", role, { httpOnly: true, sameSite: "lax", path: "/" });
  cookies().set("seedshield_role_label", label, { sameSite: "lax", path: "/" });
  redirect(next.startsWith("/admin") ? next : "/admin/dashboard");
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: { error?: string; next?: string };
}) {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  const currentRole = cookies().get("seedshield_role")?.value;
  const next = searchParams.next || "/admin/dashboard";

  return (
    <div className="min-h-[calc(100vh-76px)] bg-seed-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-harvest-300">Seed Co Internal Access</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">Role-Based Operations Control</h1>
          <p className="mt-5 max-w-xl text-lg text-seed-50">
            Access SeedShield 360 by operational role. Each view highlights the intelligence that matters most to quality assurance, commercial, depot, dealer, and executive teams.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["Quality assurance", "Counterfeit risk monitoring", "Market intelligence", "Farmer engagement"].map((item) => (
              <div key={item} className="border border-white/15 bg-white/5 p-4 text-sm font-semibold text-seed-50">
                {item}
              </div>
            ))}
          </div>
        </section>
        <Card className="border-0 p-6 shadow-2xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-seed-700">Secure access</p>
            <h2 className="mt-2 text-3xl font-bold text-seed-950">Sign in to SeedShield 360</h2>
            <p className="mt-2 text-sm text-gray-600">Use the access PIN and choose the role you want to present.</p>
          </div>
          {currentRole ? (
            <div className="mt-5 bg-seed-50 p-3 text-sm text-seed-900">
              Current role: <strong>{roleLabel(currentRole)}</strong>
            </div>
          ) : null}
          {searchParams.error ? <div className="mt-5 bg-red-100 p-3 text-sm font-medium text-red-800">Incorrect access PIN.</div> : null}
          <form action={accessAction} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label>Select role</label>
              <select name="role">
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Access PIN</label>
              <input name="pin" type="password" placeholder="Enter access PIN" required />
              <p className="mt-1 text-xs text-gray-500">Access PIN: 3600</p>
            </div>
            <button className="w-full rounded-sm bg-seed-800 px-5 py-4 text-base font-semibold text-white hover:bg-seed-700" type="submit">
              Access Command Center
            </button>
          </form>
          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-seed-950">Configured roles</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {(users.length ? users : roles).map((user: any) => (
                <div key={user.id || user.value} className="border border-gray-100 bg-gray-50 p-3">
                  <div className="font-semibold text-seed-950">{user.name || user.label}</div>
                  <div className="mt-1"><Badge>{roleLabel(user.role || user.value)}</Badge></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
