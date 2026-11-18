CREATE TYPE "public"."account_factory_status" AS ENUM('ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."factory_grade" AS ENUM('EXCELLENT', 'GOOD');--> statement-breakpoint
CREATE TYPE "public"."factory_issue_type" AS ENUM('DELAY', 'DEFECT', 'ETC');--> statement-breakpoint
CREATE TYPE "public"."factory_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "account_factories" (
	"account_id" uuid NOT NULL,
	"factory_id" uuid NOT NULL,
	"status" "account_factory_status" DEFAULT 'ACTIVE' NOT NULL,
	"memo" text,
	"first_order_at" timestamp with time zone,
	"last_order_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_factories_account_id_factory_id_pk" PRIMARY KEY("account_id","factory_id")
);
--> statement-breakpoint
CREATE TABLE "factories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"legal_name" text,
	"country_code" text NOT NULL,
	"region" text NOT NULL,
	"address" text NOT NULL,
	"manager_name" text,
	"primary_category" text NOT NULL,
	"grade" "factory_grade" DEFAULT 'GOOD' NOT NULL,
	"status" "factory_status" DEFAULT 'ACTIVE' NOT NULL,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "factories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "factory_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"factory_id" uuid NOT NULL,
	"account_id" uuid,
	"name" text NOT NULL,
	"object_key" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "factory_files_object_key_unique" UNIQUE("object_key")
);
--> statement-breakpoint
CREATE TABLE "factory_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"factory_id" uuid NOT NULL,
	"type" "factory_issue_type" NOT NULL,
	"title" text NOT NULL,
	"order_code" text,
	"occurred_at" timestamp with time zone NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factory_metrics" (
	"account_id" uuid NOT NULL,
	"factory_id" uuid NOT NULL,
	"deals" integer DEFAULT 0 NOT NULL,
	"total_amount" double precision DEFAULT 0 NOT NULL,
	"on_time_rate" double precision DEFAULT 0 NOT NULL,
	"defect_rate" double precision DEFAULT 0 NOT NULL,
	"avg_lead_days" integer DEFAULT 0 NOT NULL,
	"yearly" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"category_share" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "factory_metrics_account_id_factory_id_pk" PRIMARY KEY("account_id","factory_id")
);
--> statement-breakpoint
CREATE TABLE "factory_tags" (
	"factory_id" uuid NOT NULL,
	"tag" text NOT NULL,
	CONSTRAINT "factory_tags_factory_id_tag_pk" PRIMARY KEY("factory_id","tag")
);
--> statement-breakpoint
ALTER TABLE "account_factories" ADD CONSTRAINT "account_factories_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_factories" ADD CONSTRAINT "account_factories_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_files" ADD CONSTRAINT "factory_files_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_files" ADD CONSTRAINT "factory_files_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_issues" ADD CONSTRAINT "factory_issues_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_issues" ADD CONSTRAINT "factory_issues_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_metrics" ADD CONSTRAINT "factory_metrics_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_metrics" ADD CONSTRAINT "factory_metrics_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_tags" ADD CONSTRAINT "factory_tags_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_factories_factory_idx" ON "account_factories" USING btree ("factory_id");--> statement-breakpoint
CREATE INDEX "account_factories_account_status_idx" ON "account_factories" USING btree ("account_id","status");--> statement-breakpoint
CREATE INDEX "factories_status_idx" ON "factories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "factories_name_idx" ON "factories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "factory_files_factory_idx" ON "factory_files" USING btree ("factory_id");--> statement-breakpoint
CREATE INDEX "factory_files_account_idx" ON "factory_files" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "factory_issues_account_factory_idx" ON "factory_issues" USING btree ("account_id","factory_id");