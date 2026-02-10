ALTER TABLE "document_shares" ADD COLUMN "is_expired" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "document_shares" DROP COLUMN "is_active";