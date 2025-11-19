-- Add debrid_service field (debrid_token was already renamed via db push)
ALTER TABLE "user_settings" ADD COLUMN "debrid_service" VARCHAR(255);

-- Set default service to 'realdebrid' for existing users who have a token
UPDATE "user_settings" SET "debrid_service" = 'realdebrid' WHERE "debrid_token" IS NOT NULL;
