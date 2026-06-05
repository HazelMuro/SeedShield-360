# SeedShield 360

## Project Overview

SeedShield 360 is a pilot-ready sandbox prototype for Seed Co pack-level seed verification, traceability, counterfeit intelligence, farmer engagement, financial exposure scoring, and market intelligence.

The app interface is written as an operational product. The current build uses Seed Co-style operational scenario records; during an official pilot it can be connected to real Seed Co batch, dealer, depot, QA, and distribution data.

For step-by-step operating instructions, QR code locations, role usage, presentation flow, exports, deployment, and troubleshooting, read:

```text
OPERATOR_GUIDE.md
```

## Problem Solved

SeedShield 360 helps Seed Co address counterfeit seed, lack of end-to-end traceability, manual reporting, delayed customer and market intelligence, limited real-time product visibility, fragmented supply chain data, and weak financial quantification of counterfeit risk.

## Features

- Batch registration and pack-level QR code generation.
- HMAC-SHA256 signed verification URLs.
- Farmer verification flow for genuine, already scanned, suspicious, and invalid products.
- Optional farmer reward entry for planting tips, farmer support activation, and Seed Co rewards.
- Counterfeit reporting with reference numbers such as `RPT-2026-0001`.
- Rule-based anomaly detection for duplicate scans, multiple scans, district mismatch, invalid codes, and report clusters.
- Financial exposure scoring on every risk alert.
- Operations Command Center with alerts, hotspots, farmer engagement, dealer activity, role-based views, and market intelligence.
- Scenario Control Center for loading realistic Seed Co-style operational scenario records.
- Operational Workflow page for judge and manager review.
- System Readiness checklist and score.
- Print-ready pack QR label page for seed verification packaging workflows.
- CSV exports for risk alerts, reports, scans, and reward entries.
- Audit log hash chaining for important actions.

## Tech Stack

- Next.js with TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite for fast local development
- PostgreSQL-ready Prisma schema for Supabase or Neon
- `qrcode` npm package
- Node `crypto` HMAC-SHA256 signing

## Local Offline Setup on Port 3005

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

The local offline version runs at [http://localhost:3005](http://localhost:3005).

Production build check:

```bash
npm run build
```

## How to run offline without typing commands

Use the Windows batch files in the project folder:

1. First time only: double-click `setup-windows.bat`.
2. To open the app later: double-click `start-windows.bat`.
3. The app opens at [http://localhost:3005](http://localhost:3005).
4. Keep the black command window open while using the system.
5. Close the black window to stop the app.

Use `build-check-windows.bat` when you want to check whether the app is production-ready.

## How to Use the System Operationally

1. Double-click `start-windows.bat`.
2. Open [http://localhost:3005](http://localhost:3005).
3. Go to `/login`.
4. Select a role such as `QA Manager`, `Commercial Manager`, `Depot Officer`, `Dealer`, or `Executive`.
5. Enter access PIN `3600`.
6. Open `/admin/pilot-sandbox`, shown in the interface as `Scenario Control Center`.
7. Click `Load Operational Scenario Records`.
8. Open `/admin/dashboard`, shown as `Operations Command Center`, to view verification activity, reports, alerts, hotspots, farmer engagement, market intelligence, and financial exposure.

## Where to Get QR Codes

QR codes are generated at pack level after a batch exists.

Fastest path:

1. Go to `/admin/batches`.
2. Click `View packs` on any batch.
3. The pack page shows each pack code, signed verification URL, QR code image, scan count, and status.
4. Use `Open verification` to test the QR link as a farmer.
5. Use `Download QR` to save an individual QR image.
6. Use `Print labels` to open `/admin/batches/[id]/labels`, where printable Seed Co pack verification labels are shown.

For a newly registered batch:

1. Go to `/admin/batches/new`.
2. Register the batch.
3. The system automatically generates pack records and signed QR links.
4. It redirects to the generated pack QR code page.

## Environment Variables

Required:

```bash
DATABASE_URL="file:./dev.db"
SEEDSHIELD_SIGNING_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3005"
```

For a deployed pilot:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
SEEDSHIELD_SIGNING_SECRET="use-a-long-random-production-secret"
NEXT_PUBLIC_APP_URL="https://seedshield360.vercel.app"
```

All QR verification URLs are generated from `NEXT_PUBLIC_APP_URL`:

```text
{NEXT_PUBLIC_APP_URL}/verify?pack_code=PACK_CODE&sig=SIGNATURE
```

Local QR example:

```text
http://localhost:3005/verify?pack_code=PACK_CODE&sig=SIGNATURE
```

Online QR example:

```text
https://seedshield360.vercel.app/verify?pack_code=PACK_CODE&sig=SIGNATURE
```

## Loading Operational Scenario Records

Use either path:

```bash
npx prisma db seed
```

Or open:

```text
/admin/pilot-sandbox
```

Then click:

```text
Load Operational Scenario Records
```

This refreshes batches, packs, scans, reports, reward entries, risk alerts, extension logs, and seeded roles.

## PostgreSQL Deployment Setup

Local development uses `prisma/schema.prisma` with SQLite.

For Supabase or Neon, use the supplied PostgreSQL schema:

```bash
copy prisma\schema.postgres.prisma prisma\schema.prisma
npm install
npx prisma migrate dev --name init-postgres
npx prisma db seed
npm run build
```

On hosted deployment environments, set `DATABASE_URL` to the Supabase or Neon PostgreSQL connection string and run:

```bash
npx prisma migrate deploy
npx prisma db seed
```

For production pilots, load real Seed Co records instead of scenario records after the schema has been migrated.

## How to deploy online

1. Push the project to GitHub.
2. Import the GitHub repository into Vercel.
3. Create or connect a PostgreSQL database using Supabase, Neon, Prisma Postgres, or Vercel Marketplace storage.
4. Add environment variables in Vercel:
   - `DATABASE_URL`
   - `SEEDSHIELD_SIGNING_SECRET`
   - `NEXT_PUBLIC_APP_URL`
5. Set `NEXT_PUBLIC_APP_URL` to the deployed Vercel URL, for example `https://seedshield360.vercel.app`.
6. Use PostgreSQL for the deployed version. Do not use SQLite online because serverless deployment needs a persistent cloud database.
7. Run Prisma migration and scenario record loading for the production database from a local terminal or CI:

```bash
npx prisma migrate deploy
npx prisma db seed
```

8. Redeploy the Vercel project.

## Routes

- `/`
- `/login`
- `/admin/login`
- `/admin/dashboard`
- `/admin/pilot-sandbox`
- `/admin/pilot-walkthrough`
- `/admin/pilot-readiness`
- `/admin/batches`
- `/admin/batches/new`
- `/admin/batches/[id]/packs`
- `/admin/batches/[id]/labels`
- `/admin/scans`
- `/admin/reports`
- `/admin/alerts`
- `/admin/rewards`
- `/admin/extension-logs`
- `/verify`
- `/reward-entry`
- `/report`
- `/api/export/alerts`
- `/api/export/reports`
- `/api/export/scans`
- `/api/export/rewards`

## Operational Walkthrough

1. Open `/login` and enter PIN `3600`.
2. Open `/admin/pilot-sandbox`.
3. Click `Load Operational Scenario Records`.
4. Open `/admin/pilot-walkthrough`.
5. Open `/admin/dashboard`.
6. Open `/admin/batches/new`.
7. Register a new SC403 batch.
8. View generated packs and QR verification links.
9. Open `/admin/batches/[id]/labels` to view print-ready pack labels.
10. Open one pack verification URL.
11. Verify the pack and see `Genuine Seed Co Product`.
12. Enter an optional phone number for reward entry.
13. Open the same verification URL again.
14. See `ALREADY SCANNED` or `SUSPICIOUS`.
15. Submit a suspicious seed report.
16. Return to `/admin/dashboard` and review scans, rewards, reports, alerts, hotspots, market intelligence, manager insights, and financial exposure.
17. Open `/admin/extension-logs` and add a farmer extension log.
18. Open `/admin/pilot-readiness` for the readiness checklist and System Readiness Score.

## Known Limitations and Next Pilot Steps

- Current version uses Seed Co-style operational scenario records.
- Real Seed Co batch, dealer and QA records would be connected during an official pilot.
- Current anomaly detection is rule-based for explainability.
- Machine learning can be introduced after real scan, report and investigation data is collected.
- SMS/USSD can be added to support farmers without smartphones.
- ERP integration can be added after Seed Co confirms existing systems.
- Authentication is simplified with an access PIN and role selector.
- Location-to-district conversion is manual in the current sandbox.

## Future Improvements

- Real Seed Co role-based authentication.
- ERP and distribution data integration.
- Dealer inventory and depot dispatch integration.
- SMS/USSD verification for low-connectivity farmers.
- Geospatial hotspot maps.
- Investigation workflow for alert resolution.
- Bulk QR label export and production packaging templates.
