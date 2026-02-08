ALTER TABLE "document" ADD COLUMN "encrypted_metadata" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "document" DROP COLUMN "file_path";--> statement-breakpoint
ALTER TABLE "document" DROP COLUMN "bucket_path";