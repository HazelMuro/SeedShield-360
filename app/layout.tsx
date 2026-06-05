import type { Metadata } from "next";
import "./globals.css";
import { AdminNav } from "../components/AdminNav";

export const metadata: Metadata = {
  title: "SeedShield 360",
  description: "Secure pack-level seed verification and intelligence prototype"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
