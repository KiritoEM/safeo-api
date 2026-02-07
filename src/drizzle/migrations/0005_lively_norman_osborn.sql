ALTER TABLE "account" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "log_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "log_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "document_shares" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "document_shares" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "document_shares" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "document_shares" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "document_shares" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "deleted_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_login_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_login_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "deleted_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();