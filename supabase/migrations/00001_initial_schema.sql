-- Create a trigger function to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  default_country TEXT DEFAULT 'BR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Monitored Searches
CREATE TABLE public.monitored_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keyword TEXT,
  niche TEXT NOT NULL,
  queries JSONB NOT NULL DEFAULT '[]'::jsonb,
  country TEXT NOT NULL DEFAULT 'BR',
  status TEXT NOT NULL CHECK (status IN ('active', 'paused')),
  ad_status TEXT NOT NULL DEFAULT 'ACTIVE',
  results_count INTEGER NOT NULL DEFAULT 0,
  identified_offers_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  next_execution_at TIMESTAMPTZ,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly')),
  limit_results INTEGER NOT NULL CHECK (limit_results > 0 AND limit_results <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_monitored_searches_user_id ON public.monitored_searches(user_id);

CREATE TRIGGER update_monitored_searches_updated_at
BEFORE UPDATE ON public.monitored_searches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.monitored_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own searches" 
ON public.monitored_searches FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 3. Search Runs
CREATE TABLE public.search_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_id UUID NOT NULL REFERENCES public.monitored_searches(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'timed_out', 'cancelled')),
  provider TEXT DEFAULT 'apify',
  provider_run_id TEXT,
  token_slot INTEGER,
  query_count INTEGER,
  requested_limit INTEGER,
  raw_ads_count INTEGER,
  identified_offers_count INTEGER,
  error_code TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_runs_user_id ON public.search_runs(user_id);
CREATE INDEX idx_search_runs_search_id ON public.search_runs(search_id);

ALTER TABLE public.search_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own search runs" 
ON public.search_runs FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 4. Offers
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  summary TEXT,
  niche TEXT,
  country TEXT,
  language TEXT,
  status TEXT CHECK (status IN ('scaling', 'monitored', 'recent', 'inactive')),
  funnel_type TEXT CHECK (funnel_type IN ('sales_page', 'quiz', 'whatsapp', 'app', 'direct_checkout')),
  has_vsl BOOLEAN,
  ticket NUMERIC,
  currency TEXT CHECK (currency IN ('BRL', 'USD', 'EUR')),
  active_ads_count INTEGER DEFAULT 0,
  unique_creatives_count INTEGER DEFAULT 0,
  oldest_active_ad_days INTEGER DEFAULT 0,
  ads_change_last_7_days INTEGER DEFAULT 0,
  scale_score INTEGER DEFAULT 0,
  sales_page_url TEXT,
  sales_page_domain TEXT,
  page_technology TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  platforms JSONB DEFAULT '[]'::jsonb,
  creative_formats JSONB DEFAULT '[]'::jsonb,
  key_promises JSONB DEFAULT '[]'::jsonb,
  scale_evidences JSONB DEFAULT '[]'::jsonb,
  meta_library_search_url TEXT,
  first_seen_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug) -- Prevent duplicate offers for the same user based on slug (which is often domain-based)
);

CREATE INDEX idx_offers_user_id ON public.offers(user_id);
CREATE INDEX idx_offers_status ON public.offers(status);
CREATE INDEX idx_offers_niche ON public.offers(niche);

CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own offers" 
ON public.offers FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 5. Offer Advertisers
CREATE TABLE public.offer_advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  external_page_id TEXT,
  name TEXT,
  avatar_url TEXT,
  verified BOOLEAN,
  category TEXT,
  ads_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(offer_id, external_page_id)
);

CREATE INDEX idx_offer_advertisers_offer_id ON public.offer_advertisers(offer_id);

CREATE TRIGGER update_offer_advertisers_updated_at
BEFORE UPDATE ON public.offer_advertisers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.offer_advertisers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own offer advertisers" 
ON public.offer_advertisers FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 6. Offer Creatives
CREATE TABLE public.offer_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  external_creative_id TEXT,
  type TEXT CHECK (type IN ('image', 'video', 'carousel', 'dynamic')),
  thumbnail_url TEXT,
  media_url TEXT,
  title TEXT,
  body TEXT,
  ads_using_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ,
  duration TEXT,
  aspect_ratio TEXT,
  carousel_cards_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(offer_id, external_creative_id)
);

CREATE INDEX idx_offer_creatives_offer_id ON public.offer_creatives(offer_id);

CREATE TRIGGER update_offer_creatives_updated_at
BEFORE UPDATE ON public.offer_creatives
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.offer_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own offer creatives" 
ON public.offer_creatives FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 7. Offer Ads
CREATE TABLE public.offer_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  external_ad_id TEXT,
  library_id TEXT,
  library_url TEXT,
  advertiser_page_id TEXT,
  advertiser_page_name TEXT,
  body TEXT,
  title TEXT,
  call_to_action TEXT,
  start_date TIMESTAMPTZ,
  is_active BOOLEAN,
  platforms JSONB DEFAULT '[]'::jsonb,
  creative_external_id TEXT,
  destination_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(offer_id, external_ad_id)
);

CREATE INDEX idx_offer_ads_offer_id ON public.offer_ads(offer_id);

CREATE TRIGGER update_offer_ads_updated_at
BEFORE UPDATE ON public.offer_ads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.offer_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own offer ads" 
ON public.offer_ads FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 8. Offer History
CREATE TABLE public.offer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  active_ads INTEGER,
  unique_creatives INTEGER,
  ticket NUMERIC,
  scale_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(offer_id, observed_at)
);

CREATE INDEX idx_offer_history_offer_id ON public.offer_history(offer_id);

ALTER TABLE public.offer_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own offer history" 
ON public.offer_history FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 9. Favorites
CREATE TABLE public.favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, offer_id)
);

CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites" 
ON public.favorites FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 10. Search Offers
CREATE TABLE public.search_offers (
  search_id UUID NOT NULL REFERENCES public.monitored_searches(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_matched_at TIMESTAMPTZ DEFAULT NOW(),
  last_matched_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (search_id, offer_id)
);

CREATE INDEX idx_search_offers_user_id ON public.search_offers(user_id);
CREATE INDEX idx_search_offers_search_id ON public.search_offers(search_id);

ALTER TABLE public.search_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own search offers" 
ON public.search_offers FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
