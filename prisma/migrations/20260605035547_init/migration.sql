-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Depot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Dealer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "depotId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Dealer_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "Depot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchCode" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "varietyCode" TEXT NOT NULL,
    "packSizeKg" REAL NOT NULL,
    "intendedTotalPacks" INTEGER NOT NULL,
    "generatedDemoPacks" INTEGER NOT NULL,
    "productionDate" DATETIME NOT NULL,
    "qaStatus" TEXT NOT NULL,
    "germinationRate" REAL NOT NULL,
    "moistureContent" REAL NOT NULL,
    "physicalPurity" REAL NOT NULL,
    "depotId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "averagePackPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Batch_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "Depot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Batch_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packCode" TEXT NOT NULL,
    "serialNumber" INTEGER NOT NULL,
    "batchId" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "firstScannedAt" DATETIME,
    "lastScannedAt" DATETIME,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pack_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScanEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packCode" TEXT NOT NULL,
    "packId" TEXT,
    "result" TEXT NOT NULL,
    "district" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "deviceInfo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScanEvent_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CounterfeitReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceNumber" TEXT NOT NULL,
    "packCode" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sellerName" TEXT,
    "district" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "photoUrl" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RiskAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertType" TEXT NOT NULL,
    "packCode" TEXT,
    "district" TEXT,
    "riskLevel" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "estimatedExposure" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RewardEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packCode" TEXT NOT NULL,
    "packId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "entryStatus" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardEntry_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExtensionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerName" TEXT,
    "district" TEXT NOT NULL,
    "agronomistName" TEXT NOT NULL,
    "varietyDiscussed" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "farmerFeedback" TEXT NOT NULL,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "previousHash" TEXT,
    "currentHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batchCode_key" ON "Batch"("batchCode");

-- CreateIndex
CREATE UNIQUE INDEX "Pack_packCode_key" ON "Pack"("packCode");

-- CreateIndex
CREATE INDEX "ScanEvent_packCode_idx" ON "ScanEvent"("packCode");

-- CreateIndex
CREATE INDEX "ScanEvent_district_idx" ON "ScanEvent"("district");

-- CreateIndex
CREATE UNIQUE INDEX "CounterfeitReport_referenceNumber_key" ON "CounterfeitReport"("referenceNumber");

-- CreateIndex
CREATE INDEX "CounterfeitReport_district_idx" ON "CounterfeitReport"("district");

-- CreateIndex
CREATE INDEX "RiskAlert_packCode_idx" ON "RiskAlert"("packCode");

-- CreateIndex
CREATE INDEX "RiskAlert_district_idx" ON "RiskAlert"("district");

-- CreateIndex
CREATE INDEX "RiskAlert_riskLevel_idx" ON "RiskAlert"("riskLevel");

-- CreateIndex
CREATE INDEX "RewardEntry_packCode_idx" ON "RewardEntry"("packCode");
