-- CreateTable
CREATE TABLE "public"."email_verification_challenges" (
    "id" TEXT NOT NULL,
    "email_hash" TEXT NOT NULL,
    "phone_hash" TEXT NOT NULL,
    "verification_token" TEXT NOT NULL,
    "is_consumed" BOOLEAN NOT NULL DEFAULT false,
    "cosumed_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_verification_challenges_phone_hash_email_hash_idx" ON "public"."email_verification_challenges"("phone_hash", "email_hash");
