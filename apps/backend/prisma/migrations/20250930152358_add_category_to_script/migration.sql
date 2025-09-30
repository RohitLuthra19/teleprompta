-- AlterTable
ALTER TABLE "public"."Script" ADD COLUMN     "category" TEXT[] DEFAULT ARRAY[]::TEXT[];
