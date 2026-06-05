"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const publicLinks = [
  ["/", "Home"],
  ["/verify", "Verify Seed Pack"],
  ["/report", "Report Suspicious Seed"],
  ["/login", "Sign In"]
];

const adminLinks = [
  ["/admin/dashboard", "Command Center"],
  ["/admin/batches", "Batch Registry"],
  ["/admin/batches", "Pack QR Labels"],
  ["/admin/scans", "Scan Activity"],
  ["/admin/reports", "Counterfeit Reports"],
  ["/admin/alerts", "Risk Alerts"],
  ["/admin/dashboard#market-intelligence", "Market Intelligence"],
  ["/admin/rewards", "Reward Engagement"],
  ["/admin/extension-logs", "Extension Logs"],
  ["/admin/pilot-sandbox", "Scenario Control"],
  ["/admin/pilot-walkthrough", "Operational Workflow"],
  ["/admin/pilot-readiness", "System Readiness"]
];

export function AdminNav() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(
      decodeURIComponent(
        document.cookie
          .split("; ")
          .find((item) => item.startsWith("seedshield_role_label="))
          ?.split("=")[1] || ""
      )
    );
  }, []);

  if (isAdmin) {
    return (
      <div className="admin-shell">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-seed-900/20 bg-seed-950 text-white shadow-2xl lg:flex">
          <Link href="/" className="border-b border-white/10 px-6 py-6">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-harvest-300">Seed Co Systems</div>
            <div className="mt-2 text-2xl font-bold">SeedShield 360</div>
            <div className="mt-1 text-sm text-seed-100">Verification and counterfeit intelligence</div>
          </Link>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
            {adminLinks.map(([href, label]) => (
              <Link
                key={`${href}-${label}`}
                href={href}
                className="block rounded-md px-4 py-3 text-sm font-semibold text-seed-50 transition hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/10 px-6 py-5 text-sm text-seed-100">
            <div className="font-semibold text-white">Signed in as</div>
            <div>{role || "Internal User"}</div>
          </div>
        </aside>
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur lg:ml-72">
          <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-seed-700">SeedShield 360</div>
              <div className="text-lg font-bold text-seed-950">Operational Intelligence Platform</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-seed-50 px-3 py-1 text-xs font-semibold text-seed-800">Signed in as: {role || "Internal User"}</span>
              <span className="rounded-full bg-seed-700 px-3 py-1 text-xs font-semibold text-white">Operational</span>
              <Link href="/login" className="rounded-md border border-seed-200 px-3 py-2 text-sm font-semibold text-seed-800">Switch role</Link>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-gray-100 px-4 py-2 lg:hidden">
            {adminLinks.map(([href, label]) => (
              <Link key={`${href}-${label}-mobile`} href={href} className="whitespace-nowrap rounded-md bg-seed-50 px-3 py-2 text-xs font-semibold text-seed-900">
                {label}
              </Link>
            ))}
          </nav>
        </header>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-seed-800 font-bold text-white shadow-md">
            S360
          </div>
          <div>
            <div className="text-lg font-bold text-seed-950">SeedShield 360</div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Seed verification and intelligence</div>
          </div>
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm">
          {publicLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-sm px-4 py-2 font-semibold text-seed-900 transition hover:bg-seed-50"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
