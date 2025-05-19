-- Remove icon fields from Category table
ALTER TABLE "Category" DROP COLUMN IF EXISTS "iconUrl";
ALTER TABLE "Category" DROP COLUMN IF EXISTS "iconSize"; 