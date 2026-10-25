CREATE TYPE "public"."auth_method" AS ENUM('LOCAL_ONLY', 'SSO_ONLY', 'BOTH');--> statement-breakpoint
CREATE TABLE "account_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"email" text NOT NULL,
	"provider" "oauth_provider" NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "account_members" ADD COLUMN "auth_method" "auth_method" DEFAULT 'LOCAL_ONLY' NOT NULL;--> statement-breakpoint
ALTER TABLE "account_members" ADD COLUMN "sso_provider" "oauth_provider";--> statement-breakpoint
ALTER TABLE "account_invitations" ADD CONSTRAINT "account_invitations_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_invitations" ADD CONSTRAINT "account_invitations_member_id_account_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."account_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_invitations" ADD CONSTRAINT "account_invitations_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_invitations_member_idx" ON "account_invitations" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "account_invitations_account_idx" ON "account_invitations" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_members_one_main_per_account" ON "account_members" USING btree ("account_id") WHERE "account_members"."type" = 'MAIN';--> statement-breakpoint
CREATE UNIQUE INDEX "account_members_one_main_per_user" ON "account_members" USING btree ("user_id") WHERE "account_members"."type" = 'MAIN';