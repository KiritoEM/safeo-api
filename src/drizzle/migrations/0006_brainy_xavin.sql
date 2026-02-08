ALTER TABLE "document" ALTER COLUMN "fileType" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "file_path" text NOT NULL;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "bucket_path" text;