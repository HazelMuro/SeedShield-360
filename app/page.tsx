import Link from "next/link";
import { Card } from "../components/Card";
import { ProblemAlignment } from "../components/ProblemAlignment";

const operations = [
  {
    title: "Pack-Level Verification",
    text: "Every pack receives a secure digital identity and signed verification URL."
  },
  {
    title: "Counterfeit Hotspot Detection",
    text: "Repeated scans, invalid codes, report clusters, and district shifts surface operational risk."
  },
  {
    title: "Farmer Reward Engagement",
    text: "Planting tips and support incentives encourage farmers to verify packs before planting."
  },
  {
    title: "Market Intelligence",
    text: "Scan activity becomes a signal for product demand, dealer activity, and district engagement."
  }
];

const steps = [
  "Register certified batch",
  "Generate signed pack QR codes",
  "Farmer verifies seed pack",
  "Suspicious activity is detected",
  "Managers act through the command center"
];

export default function HomePage() {
  return (
    <div>
      <section className="corporate-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="max-w-4xl text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-harvest-300">Seed Co-aligned operational platform</p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
              Secure Seed Verification and Counterfeit Intelligence for Seed Co
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-seed-50">
              SeedShield 360 gives every seed pack a secure digital identity, motivates farmer verification through planting support and rewards, detects cloned codes, maps counterfeit hotspots, and converts scan activity into market intelligence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="rounded-sm bg-harvest-300 px-6 py-4 text-center text-sm font-bold text-seed-950 shadow-lg hover:bg-harvest-200" href="/admin/dashboard">
                Access Command Center
              </Link>
              <Link className="rounded-sm bg-white px-6 py-4 text-center text-sm font-bold text-seed-950 hover:bg-seed-50" href="/verify">
                Verify Seed Pack
              </Link>
              <Link className="rounded-sm border border-red-200 bg-red-700 px-6 py-4 text-center text-sm font-bold text-white hover:bg-red-800" href="/report">
                Report Suspicious Seed
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-4 md:grid-cols-4">
            {operations.map((item) => (
              <Card key={item.title} className="border-t-4 border-t-seed-800">
                <h2 className="text-lg font-bold text-seed-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="field-band py-14">
        <div className="mx-auto max-w-7xl px-4">
          <ProblemAlignment />
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-seed-700">How it works</p>
            <h2 className="mt-2 text-3xl font-bold text-seed-950">From certified batch to executive action</h2>
            <p className="mt-3 text-gray-600">
              SeedShield 360 links quality assurance, farmer verification, counterfeit monitoring, and market intelligence in one operational workflow.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step} className="border-l-4 border-l-seed-800 bg-seed-50 p-5">
                <div className="text-sm font-bold text-harvest-600">0{index + 1}</div>
                <div className="mt-3 font-bold text-seed-950">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-seed-950 px-4 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold">SeedShield 360</div>
            <div className="text-sm text-seed-100">Secure Seed Verification | Traceability | Counterfeit Intelligence | Market Intelligence</div>
          </div>
          <Link href="/login" className="rounded-sm border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10">
            Internal Access
          </Link>
        </div>
      </footer>
    </div>
  );
}
