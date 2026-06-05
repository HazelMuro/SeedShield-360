import { clsx } from "clsx";

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "green" | "red" | "amber" | "gray" }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-sm px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        tone === "green" && "bg-seed-100 text-seed-700",
        tone === "red" && "bg-red-100 text-red-700",
        tone === "amber" && "bg-amber-100 text-amber-800",
        tone === "gray" && "bg-gray-100 text-gray-700"
      )}
    >
      {children}
    </span>
  );
}
