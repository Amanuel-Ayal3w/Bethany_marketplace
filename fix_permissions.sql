-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant table permissions for existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Ensure future tables have the same permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO service_role;

-- Create Settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Settings" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE "Settings" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" 
ON "Settings" FOR SELECT USING (true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Enable insert for authenticated users only" 
ON "Settings" FOR INSERT WITH CHECK (auth.role() = 'authenticated')
ON CONFLICT DO NOTHING;

CREATE POLICY "Enable update for authenticated users only" 
ON "Settings" FOR UPDATE USING (auth.role() = 'authenticated')
ON CONFLICT DO NOTHING;

-- Insert default footer settings
INSERT INTO "Settings" (key, value) 
VALUES ('footer', '{"contactPhone":"+49 30 575909881","contactAddress":"685 Market Street, San Francisco, CA 94105, US","contactEmail":"contact@bethanymarketplace.com","socialLinks":{"facebook":"https://www.facebook.com","instagram":"https://www.instagram.com","twitter":"https://www.twitter.com","linkedin":"https://www.linkedin.com"}}') 
ON CONFLICT (key) DO NOTHING;

-- Grant specific permissions for each table from the schema
GRANT ALL PRIVILEGES ON TABLE "Category" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "FeaturedCategory" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "Category_OptionSet" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "OptionSet" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "Category_SpecGroup" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "SpecGroup" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "Product" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "Brand" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "PageVisit" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "Profile" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "Account" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "User" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "FeaturedBanner" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "HomepageBrand" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "ProductReview" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "SiteSettings" TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE "Settings" TO postgres, anon, authenticated, service_role; 