# SeedShield 360 Operator Guide

This guide explains how to use SeedShield 360 as an operational seed verification, traceability, counterfeit risk monitoring, farmer engagement, and market intelligence system.

Use this document when presenting the system, operating it locally, explaining the workflow to judges, or showing where QR codes and reports are generated.

## Quick Start

The project folder is:

```text
C:\Users\user\OneDrive\Desktop\hazel\seedshield 360
```

To start the system without typing commands:

1. Open the project folder.
2. Double-click `start-windows.bat`.
3. Wait for the browser to open.
4. The system opens at:

```text
http://localhost:3005
```

Keep the black command window open while using the system. Closing the black window stops the local app.

## First-Time Setup

If this is the first time running the system on a machine:

1. Open the project folder.
2. Double-click `setup-windows.bat`.
3. Wait for dependencies, Prisma, database migration, and seed records to finish.
4. When setup is complete, double-click `start-windows.bat`.

If setup fails, keep the black window open and read the error message.

## Access and Roles

Open:

```text
http://localhost:3005/login
```

Access PIN:

```text
3600
```

Available roles:

- QA Manager
- Commercial Manager
- Depot Officer
- Dealer
- Executive

After signing in, the top bar shows the current role, for example:

```text
Signed in as: QA Manager
```

The Operations Command Center changes emphasis based on the selected role.

## What Each Role Is For

### QA Manager

Use this role to focus on:

- Counterfeit reports
- High-risk alerts
- Hotspot districts
- Batch quality status
- Traceability issues
- Suspicious pack scan history

### Commercial Manager

Use this role to focus on:

- Scans by variety
- Scans by district
- Farmer reward engagement
- Dealer activity
- Market demand signals
- Most verified products

### Depot Officer

Use this role to focus on:

- Batch registration
- Assigned batches
- Pack QR labels
- Dealer records
- Pack verification status

### Dealer

Use this role to focus on:

- Assigned packs
- Verification activity for assigned stock
- Received stock
- Suspicious seed reporting
- Farmer reward scans linked to dealer area

### Executive

Use this role to focus on:

- Total financial exposure
- Top risk districts
- Overall verification activity
- Open high-risk alerts
- Market intelligence summary
- System readiness

## Main Navigation

Public routes:

- `/`
- `/login`
- `/verify`
- `/reward-entry`
- `/report`

Admin routes:

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

The old route names remain for stability, but the interface uses stronger operational labels:

- `/admin/dashboard` appears as `Operations Command Center`
- `/admin/pilot-sandbox` appears as `Scenario Control Center`
- `/admin/pilot-walkthrough` appears as `Operational Workflow`
- `/admin/pilot-readiness` appears as `System Readiness`

## Loading Operational Scenario Records

The system needs records before the dashboard looks populated.

To load records:

1. Sign in at `/login`.
2. Open `/admin/pilot-sandbox`.
3. The page title is `Scenario Control Center`.
4. Click `Load Operational Scenario Records`.

This loads:

- Depots
- Dealers
- Users and roles
- Batches
- Pack records
- Signed QR codes
- Scan events
- Counterfeit reports
- Reward entries
- Risk alerts
- Extension logs
- Audit logs

Use this when you want the dashboard to show a complete operational story.

## Where to Get QR Codes

QR codes are generated for seed packs.

Fastest path:

1. Sign in.
2. Go to `/admin/batches`.
3. Choose a batch.
4. Click `View packs`.
5. The pack page shows:
   - Pack code
   - Pack status
   - Scan count
   - First scan time
   - Last scan time
   - Signed verification URL
   - QR code image
   - `Open verification` button
   - `Download QR` button

Each QR code points to a URL like:

```text
http://localhost:3005/verify?pack_code=PACK_CODE&sig=SIGNATURE
```

Online, QR links use the deployed URL from `NEXT_PUBLIC_APP_URL`, for example:

```text
https://seedshield360.vercel.app/verify?pack_code=PACK_CODE&sig=SIGNATURE
```

## Printing QR Labels

To view printable labels:

1. Go to `/admin/batches`.
2. Click `Print labels` for a batch.
3. Or open `/admin/batches/[id]/labels`.

Each label includes:

- SeedShield 360
- Seed Co Pack Verification
- QR code
- Pack code
- Batch code
- Variety
- Pack size
- Instruction: `Scan to verify genuine Seed Co seed and receive planting tips.`

Use the browser print function to print the label page.

## Registering a New Batch

Open:

```text
/admin/batches/new
```

Fill in:

- Crop
- Variety
- Variety code
- Pack size
- Intended total packs
- Production date
- QA status
- Germination rate
- Moisture content
- Physical purity
- Depot
- Dealer
- Average pack price

Click:

```text
Create batch and generate QR packs
```

The system will:

1. Create the batch.
2. Generate pack records.
3. Generate signed pack codes.
4. Generate QR verification URLs.
5. Redirect to the pack QR code page.

For local performance, the app generates up to 100 pack records even if the intended total pack count is higher.

## Pack Code Format

Pack codes follow this structure:

```text
SC-ZW-[VARIETY_CODE]-2026-[BATCH_NUMBER]-PK000001
```

Example:

```text
SC-ZW-SC403-2026-0047-PK000001
```

## Farmer Verification Flow

The farmer verification page is:

```text
/verify
```

Normally the farmer reaches this page by scanning a QR code.

The verification URL contains:

- `pack_code`
- `sig`

Example:

```text
/verify?pack_code=SC-ZW-SC403-2026-0047-PK000001&sig=abc123
```

The page:

1. Reads the pack code.
2. Reads the signature.
3. Allows optional district entry.
4. Allows optional GPS permission.
5. Verifies whether the pack exists.
6. Verifies whether the signature is valid.
7. Logs the scan event.
8. Shows the farmer a result.

Possible verification results:

- `Genuine Seed Co Product`
- `This pack code has already been scanned.`
- `Suspicious Product Warning`
- `Code Not Found or Invalid`

## Genuine Result

For a genuine pack, the farmer sees:

- Variety
- Pack size
- Batch code
- Pack code
- QA status
- Production date
- Planting tips
- Reward entry button
- Suspicious seed report link

The genuine message says:

```text
Enter your phone number to receive planting tips, activate farmer support, and stand a chance to win Seed Co rewards.
```

## Already Scanned Result

If the same pack is scanned again, the farmer sees:

```text
This pack code has already been scanned.
```

The page explains:

```text
If this is the same pack, this may be normal. If this is a different pack, report it.
```

## Suspicious Result

If the scan pattern becomes suspicious, the farmer sees:

```text
Suspicious Product Warning
```

The farmer is asked to report the product or seller.

Internal risk rules are not shown to the farmer.

## Invalid Result

If the pack code does not exist or the signature is invalid, the farmer sees:

```text
Code Not Found or Invalid
```

The farmer can submit a suspicious seed report.

## Reward Entry Flow

Open:

```text
/reward-entry
```

Usually this page is opened from the genuine verification result.

Reward entry rules:

- Phone number is optional.
- Consent checkbox is required.
- Only the first valid scan of a pack qualifies.
- If the pack already has a reward entry, the system shows:

```text
This pack has already been entered into the reward draw.
```

Reward entries are visible in:

```text
/admin/rewards
```

## Counterfeit Report Flow

Open:

```text
/report
```

The report page is for farmers, public users, dealers, and Seed Co staff to report suspicious seed.

Fields:

- Pack code, optional
- Reason
- Description
- Seller name, optional
- District
- Phone number, optional
- Photo URL, optional
- GPS location, optional

After submission, the system shows:

```text
Thank you. Your report has been received.
```

It also shows a reference number like:

```text
RPT-2026-0001
```

Reports are visible in:

```text
/admin/reports
```

## Risk Alerts

Open:

```text
/admin/alerts
```

This page shows:

- Alert type
- Pack code or district
- Risk level
- Reason
- Estimated financial exposure
- Status
- Created date

Risk levels:

- LOW
- MEDIUM
- HIGH

Alert statuses:

- OPEN
- INVESTIGATING
- RESOLVED

## Risk Rules

SeedShield 360 uses rule-based anomaly detection.

Rules:

1. Second scan of the same pack creates a LOW risk alert.
2. Three or more scans of the same pack creates a HIGH risk alert.
3. Same pack scanned in different districts creates a HIGH risk alert.
4. Scan district different from dealer district creates a MEDIUM risk alert.
5. Three or more reports from the same district creates a HIGH hotspot alert.
6. Invalid pack code verification creates a LOW invalid code alert.

The system is rule-based so the logic is explainable for quality assurance and management review.

## Financial Exposure

Each alert has estimated exposure.

Formula:

```text
Estimated Exposure = suspectedPacks × averagePackPrice × riskMultiplier
```

Risk multipliers:

- LOW = 1.0
- MEDIUM = 1.5
- HIGH = 2.0

Financial exposure appears on:

- `/admin/dashboard`
- `/admin/alerts`
- Hotspot summaries
- Management insight cards

## Operations Command Center

Open:

```text
/admin/dashboard
```

The dashboard shows:

- Verified packs
- Registered batches
- Scan events
- Counterfeit reports
- Reward entries
- Open risk alerts
- Financial exposure
- Counterfeit hotspots
- Management insights
- Pack verification activity
- Counterfeit risk summary
- Scans by variety
- Scans by district
- Reward entries by district
- Suspicious activity by district
- Report density
- Dealer activity
- High-risk packs
- Farmer engagement

The dashboard is the main page for presenting management value.

## Market Intelligence

Market intelligence is shown inside the Operations Command Center.

It includes:

- Scans by variety
- Scans by district
- Most verified varieties
- Top active districts
- Dealer activity
- Reward entries by district
- Suspicious activity by district
- Counterfeit report density

This helps Seed Co understand where farmers are scanning, which products are active, and where risk is emerging.

## Extension Logs

Open:

```text
/admin/extension-logs
```

This page records farmer support and agronomist interactions.

Fields:

- Farmer name, optional
- District
- Agronomist name
- Variety discussed
- Recommendation
- Farmer feedback
- Follow-up required

Use it to show how SeedShield 360 can connect verification activity with farmer support.

## CSV Exports

CSV export buttons are available on:

- `/admin/alerts`
- `/admin/reports`
- `/admin/scans`
- `/admin/rewards`

Export files:

- Risk alerts CSV
- Counterfeit reports CSV
- Scan events CSV
- Reward entries CSV

These exports support management reporting and offline analysis.

## System Readiness

Open:

```text
/admin/pilot-readiness
```

The visible page title is:

```text
System Readiness
```

It shows:

- Pack-level QR verification
- Signed pack codes
- Scan logging
- Reward engagement
- Counterfeit reporting
- Risk alerts
- Financial exposure scoring
- Market intelligence
- Role-based access
- Local offline support on port 3005
- Online deployment readiness
- System readiness score

## Operational Workflow Page

Open:

```text
/admin/pilot-walkthrough
```

The visible page title is:

```text
Operational Workflow
```

Use this page when presenting the system to a judge or manager.

It guides the user through:

1. Register a certified seed batch.
2. View generated pack QR codes.
3. Open farmer verification page.
4. Enter reward draw.
5. Trigger suspicious repeated scan.
6. Submit suspicious seed report.
7. Return to Operations Command Center.

## Recommended Presentation Flow

Use this sequence for judging or stakeholder presentation:

1. Open `/`.
2. Explain the homepage and Seed Co operational problem alignment.
3. Open `/login`.
4. Select `QA Manager`.
5. Enter PIN `3600`.
6. Open `/admin/pilot-sandbox`.
7. Click `Load Operational Scenario Records`.
8. Open `/admin/dashboard`.
9. Show KPIs, risk alerts, financial exposure, hotspots, and management insights.
10. Open `/admin/batches`.
11. Click `View packs`.
12. Show QR codes and signed verification URLs.
13. Click `Print labels`.
14. Show printable Seed Co pack labels.
15. Open a pack verification URL.
16. Show `Genuine Seed Co Product`.
17. Enter reward entry.
18. Open the same pack verification URL again.
19. Show `Already Scanned` or `Suspicious`.
20. Submit a suspicious seed report.
21. Return to `/admin/dashboard`.
22. Show updated scans, reports, alerts, hotspot, reward engagement, and financial exposure.
23. Open `/admin/extension-logs`.
24. Add a farmer support log.
25. Open `/admin/pilot-readiness`.
26. Show System Readiness Score.

## Local Environment Variables

Local `.env` values:

```text
DATABASE_URL="file:./dev.db"
SEEDSHIELD_SIGNING_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3005"
```

The QR code base URL comes from:

```text
NEXT_PUBLIC_APP_URL
```

Do not use port 3000. Local development uses port 3005.

## Online Deployment

For online deployment:

1. Push the project to GitHub.
2. Import it into Vercel.
3. Create or connect a PostgreSQL database using Supabase, Neon, Prisma Postgres, or Vercel Marketplace storage.
4. Add these environment variables in Vercel:
   - `DATABASE_URL`
   - `SEEDSHIELD_SIGNING_SECRET`
   - `NEXT_PUBLIC_APP_URL`
5. Set `NEXT_PUBLIC_APP_URL` to the deployed Vercel URL.
6. Run Prisma migrations for the production database.
7. Seed or import operational records.
8. Redeploy.

Online deployments should use PostgreSQL, not SQLite.

## Troubleshooting

### The app does not open

Check that the black command window is still open.

If it closed, double-click:

```text
start-windows.bat
```

### Port conflict

SeedShield 360 uses:

```text
http://localhost:3005
```

If another app is using port 3005, close it or restart the computer.

### Prisma generate fails with an EPERM error

This usually means a Node or Next.js process is locking Prisma files.

Fix:

1. Close all black command windows running the app.
2. Close browser tabs using the local app.
3. Restart the computer if needed.
4. Run `start-windows.bat` again.

### QR code opens the wrong URL

Check:

```text
NEXT_PUBLIC_APP_URL
```

Local value should be:

```text
http://localhost:3005
```

Online value should be your Vercel URL.

### Admin route redirects to login

This is expected if no role is selected.

Go to:

```text
/login
```

Select a role and enter PIN `3600`.

### Dashboard looks empty

Open:

```text
/admin/pilot-sandbox
```

Click:

```text
Load Operational Scenario Records
```

### Reward entry says the pack is already entered

That is expected if a valid reward entry already exists for that pack.

Only the first valid scan qualifies.

## Known Limitations

- The current version uses Seed Co-style operational scenario records.
- Real Seed Co batch, dealer, QA, depot, and distribution data would be connected during an official pilot.
- Authentication is simplified with a role selector and access PIN.
- Risk detection is rule-based for explainability.
- GPS location is optional and district entry is still manual.
- SMS/USSD is not included yet.
- ERP integration is not included yet.
- Machine learning is not included yet.

## Future Improvements

- Real Seed Co authentication and permissions.
- ERP and distribution system integration.
- Bulk QR export for packaging lines.
- SMS/USSD verification for farmers without smartphones.
- Investigation workflow for risk alert resolution.
- Geospatial hotspot maps.
- Dealer inventory and dispatch tracking.
- Machine learning after real scan and report data is collected.
