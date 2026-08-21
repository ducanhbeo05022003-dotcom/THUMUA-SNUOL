-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "categoryCode" TEXT,
ADD COLUMN     "categoryName" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "creatorName" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "exchangeRate" DOUBLE PRECISION,
ADD COLUMN     "goodsAmount" DOUBLE PRECISION,
ADD COLUMN     "orderDate" TIMESTAMP(3),
ADD COLUMN     "taxAmount" DOUBLE PRECISION,
ADD COLUMN     "totalAmount" DOUBLE PRECISION;
