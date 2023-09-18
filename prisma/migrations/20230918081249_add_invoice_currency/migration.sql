-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fid" TEXT NOT NULL,
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
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "projectDescription" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("billFromCity", "billFromCountry", "billFromPostCode", "billFromStreet", "billToCity", "billToCountry", "billToPostCode", "billToStreet", "clientEmail", "clientName", "createdAt", "fid", "id", "invoiceDate", "paymentTermId", "projectDescription", "status", "updatedAt", "userId") SELECT "billFromCity", "billFromCountry", "billFromPostCode", "billFromStreet", "billToCity", "billToCountry", "billToPostCode", "billToStreet", "clientEmail", "clientName", "createdAt", "fid", "id", "invoiceDate", "paymentTermId", "projectDescription", "status", "updatedAt", "userId" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_fid_key" ON "Invoice"("fid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
