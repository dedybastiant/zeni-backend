-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email_enc" BYTEA NOT NULL,
    "email_hash" TEXT NOT NULL,
    "phone_enc" BYTEA NOT NULL,
    "phone_hash" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "pin_hash" TEXT NOT NULL,
    "is_merchant" BOOLEAN NOT NULL DEFAULT false,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_hash_key" ON "public"."users"("email_hash");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_hash_key" ON "public"."users"("phone_hash");

-- CreateIndex
CREATE INDEX "users_email_hash_phone_hash_idx" ON "public"."users"("email_hash", "phone_hash");
