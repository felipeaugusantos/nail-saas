-- AlterTable: add portalToken as nullable first, backfill, then enforce NOT NULL + UNIQUE
ALTER TABLE "Client" ADD COLUMN "portalToken" TEXT;

UPDATE "Client"
SET "portalToken" = substr(md5(random()::text || clock_timestamp()::text || "id"), 1, 25)
WHERE "portalToken" IS NULL;

ALTER TABLE "Client" ALTER COLUMN "portalToken" SET NOT NULL;

CREATE UNIQUE INDEX "Client_portalToken_key" ON "Client"("portalToken");

-- CreateTable
CREATE TABLE "Anamnesis" (
    "id" TEXT NOT NULL,
    "allergies" TEXT,
    "skinNailConditions" TEXT,
    "medications" TEXT,
    "pregnantOrBreastfeeding" BOOLEAN NOT NULL DEFAULT false,
    "diabetes" BOOLEAN NOT NULL DEFAULT false,
    "preferences" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Anamnesis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Anamnesis_clientId_key" ON "Anamnesis"("clientId");

-- AddForeignKey
ALTER TABLE "Anamnesis" ADD CONSTRAINT "Anamnesis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
