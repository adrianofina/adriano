/*
  Warnings:

  - You are about to drop the column `guarantorName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `guarantorPhone` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `guarantorRelation` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `nextOfKinName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `nextOfKinPhone` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `nextOfKinRelation` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `registrationMethod` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `spouseName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `spousePhone` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedById` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedById` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Loan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_verifiedById_fkey";

-- DropIndex
DROP INDEX "User_role_idx";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "guarantorName",
DROP COLUMN "guarantorPhone",
DROP COLUMN "guarantorRelation",
DROP COLUMN "nextOfKinName",
DROP COLUMN "nextOfKinPhone",
DROP COLUMN "nextOfKinRelation",
DROP COLUMN "registrationMethod",
DROP COLUMN "spouseName",
DROP COLUMN "spousePhone",
DROP COLUMN "updatedById",
DROP COLUMN "uploadedAt",
DROP COLUMN "uploadedById",
DROP COLUMN "verifiedAt",
DROP COLUMN "verifiedById",
ADD COLUMN     "courtCaseNotes" TEXT,
ADD COLUMN     "documentStatus" JSONB,
ADD COLUMN     "hasCourtCase" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "updatedById",
ADD COLUMN     "courtCaseId" TEXT,
ADD COLUMN     "courtOrderTerms" TEXT,
ADD COLUMN     "isCourtOrdered" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLogin" TIMESTAMP(3),
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CustomerDocument" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "uploadedAt" TIMESTAMP(3),
    "uploadedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'missing',
    "notes" TEXT,
    "expiryDate" TIMESTAMP(3),
    "isCourtDocument" BOOLEAN NOT NULL DEFAULT false,
    "courtCaseId" TEXT,

    CONSTRAINT "CustomerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourtCase" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "filingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courtName" TEXT NOT NULL,
    "judgeName" TEXT,
    "caseType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "amountInvolved" DOUBLE PRECISION,
    "settlementTerms" TEXT,
    "settlementAmount" DOUBLE PRECISION,
    "settlementSchedule" TEXT,
    "nextHearingDate" TIMESTAMP(3),
    "resolutionDate" TIMESTAMP(3),
    "notes" TEXT,
    "filedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourtCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerDocument_customerId_idx" ON "CustomerDocument"("customerId");

-- CreateIndex
CREATE INDEX "CustomerDocument_status_idx" ON "CustomerDocument"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDocument_customerId_documentType_key" ON "CustomerDocument"("customerId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "CourtCase_caseNumber_key" ON "CourtCase"("caseNumber");

-- CreateIndex
CREATE INDEX "CourtCase_customerId_idx" ON "CourtCase"("customerId");

-- CreateIndex
CREATE INDEX "CourtCase_status_idx" ON "CourtCase"("status");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_courtCaseId_fkey" FOREIGN KEY ("courtCaseId") REFERENCES "CourtCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtCase" ADD CONSTRAINT "CourtCase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtCase" ADD CONSTRAINT "CourtCase_filedById_fkey" FOREIGN KEY ("filedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_courtCaseId_fkey" FOREIGN KEY ("courtCaseId") REFERENCES "CourtCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
