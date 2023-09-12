/*
  Warnings:

  - You are about to drop the column `paymentTerms` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `paymentTermId` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PaymentTerm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "days" INTEGER NOT NULL
);
INSERT INTO "PaymentTerm" ("createdAt", "days", "id", "name", "updatedAt") VALUES (CURRENT_TIMESTAMP, 1, 'net-1', 'Net 1 Day', CURRENT_TIMESTAMP);
INSERT INTO "PaymentTerm" ("createdAt", "days", "id", "name", "updatedAt") VALUES (CURRENT_TIMESTAMP, 7, 'net-7', 'Net 7 Days', CURRENT_TIMESTAMP);
INSERT INTO "PaymentTerm" ("createdAt", "days", "id", "name", "updatedAt") VALUES (CURRENT_TIMESTAMP, 14, 'net-14', 'Net 14 Days', CURRENT_TIMESTAMP);
INSERT INTO "PaymentTerm" ("createdAt", "days", "id", "name", "updatedAt") VALUES (CURRENT_TIMESTAMP, 30, 'net-30', 'Net 30 Days', CURRENT_TIMESTAMP);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "billFromStreet" TEXT NOT NULL,
    "billFromCity" TEXT NOT NULL,
    "billFromPostCode" TEXT NOT NULL,
    "billFromCountry" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "billToStreet" TEXT NOT NULL,
    "billToCity" TEXT NOT NULL,
    "billToPostCode" TEXT NOT NULL,
    "billToCountry" TEXT NOT NULL,
    "invoiceDate" TEXT NOT NULL,
    "paymentTermId" TEXT NOT NULL,
    "projectDescription" TEXT NOT NULL,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("billFromCity", "billFromCountry", "billFromPostCode", "billFromStreet", "billToCity", "billToCountry", "billToPostCode", "billToStreet", "clientEmail", "clientName", "createdAt", "id", "invoiceDate", "projectDescription", "updatedAt", "userId", "paymentTermId") SELECT "billFromCity", "billFromCountry", "billFromPostCode", "billFromStreet", "billToCity", "billToCountry", "billToPostCode", "billToStreet", "clientEmail", "clientName", "createdAt", "id", "invoiceDate", "projectDescription", "updatedAt", "userId", "net-1" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
