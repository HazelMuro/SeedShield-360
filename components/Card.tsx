import { clsx } from "clsx";

export function Card({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  return <section className={clsx("rounded-sm border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(9,35,20,0.06)]", className)} {...props}>{children}</section>;
}

export function StatCard({
  label,
  value,
  tone = "green"
}: {
  label: string;
  value: string | number;
  tone?: "green" | "red" | "gray";
}) {
  const color = tone === "red" ? "text-red-700" : tone === "gray" ? "text-gray-800" : "text-seed-800";
  return (
    <Card className="border-l-4 border-l-seed-700">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${color}`}>{value}</div>
    </Card>
  );
}
