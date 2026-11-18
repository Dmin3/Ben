ALTER TABLE "membership_requests" ADD COLUMN "requested_login_id" text;--> statement-breakpoint
ALTER TABLE "membership_requests" ADD COLUMN "pending_password_hash" text;