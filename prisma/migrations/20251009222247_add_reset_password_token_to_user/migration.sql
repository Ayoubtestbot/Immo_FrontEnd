-- AlterTable
ALTER TABLE "User" ADD COLUMN "resetPasswordToken" TEXT;
ALTER TABLE "User" ADD COLUMN "resetPasswordTokenExpiry" DATETIME;
