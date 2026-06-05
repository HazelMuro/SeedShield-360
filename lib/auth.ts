import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const roles = [
  { value: "QA_MANAGER", label: "QA Manager" },
  { value: "COMMERCIAL_MANAGER", label: "Commercial Manager" },
  { value: "DEPOT_OFFICER", label: "Depot Officer" },
  { value: "DEALER", label: "Dealer" },
  { value: "EXECUTIVE", label: "Executive" }
];

export function roleLabel(role?: string) {
  return roles.find((item) => item.value === role)?.label || "Internal User";
}

export function getCurrentRole() {
  return cookies().get("seedshield_role")?.value || "";
}

export function requireRole() {
  const role = getCurrentRole();
  if (!role) redirect("/login");
  return role;
}
