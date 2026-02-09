ALTER TABLE "document" ALTER COLUMN "encrypted_metadata" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "encrypt_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "encrypted_key" text;--> statement-breakpoint
ALTER TABLE "document" DROP COLUMN "encryption_key";--> statement-breakpoint
ALTER TABLE "document" DROP COLUMN "encryption_iv";--> statement-breakpoint
ALTER TABLE "document" DROP COLUMN "encryption_tag";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "encryption_key";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "encryption_iv";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "encryption_tag";