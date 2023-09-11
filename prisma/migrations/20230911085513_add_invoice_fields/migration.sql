/*
  Warnings:

  - Added the required column `billFromCity` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billFromCountry` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billFromPostCode` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billFromStreet` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billToCity` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billToCountry` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billToPostCode` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billToStreet` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientEmail` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceDate` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTerms` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectDescription` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
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
    "paymentTerms" TEXT NOT NULL,
    "projectDescription" TEXT NOT NULL,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("clientName", "createdAt", "id", "updatedAt", "userId") SELECT "clientName", "createdAt", "id", "updatedAt", "userId" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
