ALTER TABLE "document_shares" ALTER COLUMN "expires_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "log_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "activity_logs" DROP COLUMN "created_at";