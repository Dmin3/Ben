CREATE TYPE "public"."membership_request_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'UNMATCHED');--> statement-breakpoint
CREATE TABLE "membership_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid,
	"business_number_hash" text NOT NULL,
	"status" "membership_request_status" DEFAULT 'PENDING' NOT NULL,
	"reviewed_by_member_id" uuid,
	"rejection_reason" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "business_number_hash" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "business_number_last4" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "member_limit" integer DEFAULT 20 NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_reviewed_by_member_id_account_members_id_fk" FOREIGN KEY ("reviewed_by_member_id") REFERENCES "public"."account_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "membership_requests_user_idx" ON "membership_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "membership_requests_account_status_idx" ON "membership_requests" USING btree ("account_id","status");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_business_number_hash_unique" UNIQUE("business_number_hash");