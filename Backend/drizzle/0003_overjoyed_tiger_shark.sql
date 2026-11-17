CREATE TYPE "public"."system_role" AS ENUM('USER', 'BEN_ADMIN');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "system_role" "system_role" DEFAULT 'USER' NOT NULL;