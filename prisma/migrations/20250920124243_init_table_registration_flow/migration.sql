-- CreateEnum
CREATE TYPE "public"."OtpType" AS ENUM ('REGISTER', 'LOGIN', 'TRANSFER', 'CHANGE_PASSWORD');

-- CreateEnum
CREATE TYPE "public"."OtpChannel" AS ENUM ('SMS', 'EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "public"."RegistrationStep" AS ENUM ('NAME_INPUT', 'PASSWORD_INPUT', 'PASSCODE_INPUT', 'EMAIL_INPUT', 'EMAIL_VERIFY', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email_enc" TEXT NOT NULL,
    "email_hash" TEXT NOT NULL,
    "phone_enc" TEXT NOT NULL,
    "phone_hash" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "passcode_hash" TEXT NOT NULL,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL,
    "phone_verified_at" TIMESTAMP(3) NOT NULL,
    "email_verified_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otp_challenges" (
    "id" TEXT NOT NULL,
    "phone_hash" TEXT NOT NULL,
    "email_hash" TEXT,
    "user_id" TEXT,
    "type" "public"."OtpType" NOT NULL,
    "channel" "public"."OtpChannel" NOT NULL,
    "code_hash" TEXT NOT NULL,
    "code_salt" TEXT NOT NULL,
    "is_consumed" BOOLEAN NOT NULL DEFAULT false,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."registration_sessions" (
    "id" TEXT NOT NULL,
    "phone_enc" TEXT NOT NULL,
    "phone_hash" TEXT NOT NULL,
    "verification_data" JSONB,
    "registration_data" JSONB,
    "next_step" "public"."RegistrationStep" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_hash_key" ON "public"."users"("email_hash");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_hash_key" ON "public"."users"("phone_hash");

-- CreateIndex
CREATE INDEX "users_email_hash_phone_hash_idx" ON "public"."users"("email_hash", "phone_hash");

-- CreateIndex
CREATE INDEX "otp_challenges_user_id_type_expired_at_idx" ON "public"."otp_challenges"("user_id", "type", "expired_at");

-- CreateIndex
CREATE INDEX "registration_sessions_phone_hash_idx" ON "public"."registration_sessions"("phone_hash");

-- AddForeignKey
ALTER TABLE "public"."otp_challenges" ADD CONSTRAINT "otp_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
