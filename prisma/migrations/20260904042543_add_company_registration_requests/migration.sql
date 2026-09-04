-- CreateEnum
CREATE TYPE "CompanyRequestStatus" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "company_registration_requests" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "passwordHash" TEXT NOT NULL,
    "status" "CompanyRequestStatus" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "company_registration_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_registration_requests_status_idx" ON "company_registration_requests"("status");

-- AddForeignKey
ALTER TABLE "company_registration_requests" ADD CONSTRAINT "company_registration_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
