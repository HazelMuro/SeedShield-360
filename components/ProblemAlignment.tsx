import { Card } from "./Card";

const problems = [
  "Counterfeit seed",
  "Lack of end-to-end traceability",
  "Manual/paper-based reporting",
  "Delayed customer and market intelligence",
  "Lack of real-time product visibility",
  "Fragmented supply chain data",
  "Weak financial quantification of counterfeit risk"
];

export function ProblemAlignment({ compact = false }: { compact?: boolean }) {
  return (
    <Card>
      <div className={compact ? "" : "md:flex md:items-start md:justify-between md:gap-6"}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-seed-700">Seed Co Problem Alignment</p>
          <h2 className="mt-2 text-2xl font-bold text-seed-950">Built for Seed Co Operational Challenges</h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            SeedShield 360 connects pack verification, farmer reporting, risk alerts, and financial exposure into one operating view for quality assurance, commercial teams, and supply chain managers.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((problem) => (
          <div key={problem} className="rounded-sm border border-seed-100 bg-seed-50 p-3 text-sm font-medium text-seed-950">
            {problem}
          </div>
        ))}
      </div>
    </Card>
  );
}
