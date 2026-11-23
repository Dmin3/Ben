ALTER TYPE "public"."system_role" ADD VALUE 'SUPER_ADMIN';--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "invitation_code" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_invitation_code_unique" UNIQUE("invitation_code");