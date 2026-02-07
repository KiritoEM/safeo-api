CREATE TYPE "public"."access_level" AS ENUM('private', 'shareable');--> statement-breakpoint
CREATE TYPE "public"."file_type" AS ENUM('pdf', 'docs', 'image', 'csv');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"ip_address" varchar,
	"user_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" date NOT NULL,
	"is_active" boolean DEFAULT true,
	"share_token" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"shared_user_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_shares_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_size" bigint NOT NULL,
	"fileType" "file_type",
	"encryption_key" text NOT NULL,
	"encryption_iv" text NOT NULL,
	"accessLevel" "access_level",
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp DEFAULT now(),
	"user_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "encryption_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "encryption_iv" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "storage_limits" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "storage_used" bigint DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_shared_user_id_users_id_fk" FOREIGN KEY ("shared_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;