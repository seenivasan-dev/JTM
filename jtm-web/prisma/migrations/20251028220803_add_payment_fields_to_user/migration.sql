-- AlterTable
ALTER TABLE "User" ADD COLUMN 
ADD COLUMN     "initialPaymentConfirmation" TEXT,
ADD COLUMN     "initialPaymentMethod" TEXT;

-- AddForeignKey
ALTER TABLE "MembershipRenewal" ADD CONSTRAINT "MembershipRenewal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
