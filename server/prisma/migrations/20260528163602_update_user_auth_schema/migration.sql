/*
  Warnings:

  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `users` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "password",
DROP COLUMN "verificationCode",
ADD COLUMN     "passwordHash" VARCHAR(255) NOT NULL,
ADD COLUMN     "verificationTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verificationTokenHash" VARCHAR,
ALTER COLUMN "phone" DROP NOT NULL;
