CREATE TABLE "account_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"recipient" text NOT NULL,
	"phone" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_contacts" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_manager_assignments" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"manager_user_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ben_staff_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"phone" text,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "customer_no" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "name_en" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "ceo_name" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "business_type" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "account_addresses" ADD CONSTRAINT "account_addresses_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_contacts" ADD CONSTRAINT "account_contacts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_manager_assignments" ADD CONSTRAINT "account_manager_assignments_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_manager_assignments" ADD CONSTRAINT "account_manager_assignments_manager_user_id_users_id_fk" FOREIGN KEY ("manager_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ben_staff_profiles" ADD CONSTRAINT "ben_staff_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_addresses_account_idx" ON "account_addresses" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_addresses_one_default_per_account" ON "account_addresses" USING btree ("account_id") WHERE "account_addresses"."is_default" = true;--> statement-breakpoint
CREATE INDEX "account_manager_assignments_manager_idx" ON "account_manager_assignments" USING btree ("manager_user_id");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_customer_no_unique" UNIQUE("customer_no");