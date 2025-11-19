-- Create streaks table
CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_streak_type CHECK (type IN ('daily_checkin', 'bp_log', 'sugar_log', 'steps_log'))
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streaks"
  ON public.streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
  ON public.streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Create AI nudges table
CREATE TABLE public.ai_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nudge_text TEXT NOT NULL,
  category TEXT,
  delivered_via TEXT NOT NULL DEFAULT 'app',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_delivery_channel CHECK (delivered_via IN ('app', 'whatsapp', 'push'))
);

ALTER TABLE public.ai_nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nudges"
  ON public.ai_nudges FOR SELECT
  USING (auth.uid() = user_id);

-- Create feature flags table
CREATE TABLE public.feature_flags (
  key TEXT PRIMARY KEY,
  value_json JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

-- Insert default feature flags
INSERT INTO public.feature_flags (key, value_json, description) VALUES
  ('beatBoxEnabled', '{"enabled": false}', 'Enable Beat Box subscription'),
  ('marketplaceEnabled', '{"enabled": false}', 'Enable marketplace/shop'),
  ('deviceConnectEnabled', '{"enabled": false}', 'Enable BLE device connections'),
  ('insurancePortalEnabled', '{"enabled": false}', 'Enable insurance portal');

-- Create events table for analytics
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  type TEXT NOT NULL,
  payload_json JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add onboarding completion and language preference to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS text_size_preference TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS high_contrast_mode BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]';

-- Create index for faster streak lookups
CREATE INDEX idx_streaks_user_type ON public.streaks(user_id, type);
CREATE INDEX idx_events_user_type ON public.events(user_id, type);
CREATE INDEX idx_ai_nudges_user ON public.ai_nudges(user_id, created_at DESC);