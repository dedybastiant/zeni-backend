-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "is_deleted" DROP NOT NULL,
ALTER COLUMN "is_deleted" SET DEFAULT false,
ALTER COLUMN "deleted_at" DROP NOT NULL;
