ALTER TABLE "users" ALTER COLUMN "encryption_key" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "encryption_iv" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "storage_limits" SET DEFAULT 536870912;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "storage_limits" DROP NOT NULL;