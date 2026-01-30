-- =============================================
-- PHASE 1: SOVEREIGN AGENT MEMORY FOUNDATION
-- =============================================

-- 1. USER MEMORY: Store learned facts, preferences, and patterns
CREATE TABLE public.user_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  memory_type TEXT NOT NULL, -- 'preference', 'fact', 'pattern', 'context'
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  source TEXT DEFAULT 'inferred' CHECK (source IN ('explicit', 'inferred', 'learned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  accessed_at TIMESTAMPTZ DEFAULT now(),
  access_count INT DEFAULT 0,
  UNIQUE(user_id, memory_type, key)
);

-- 2. INTERACTION OUTCOMES: Track what worked (learning data)
CREATE TABLE public.interaction_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('nudge', 'chat', 'agent_action', 'notification', 'checkin')),
  interaction_id UUID, -- Reference to original item (ai_nudges.id, chat_messages.id, etc.)
  delivered_at TIMESTAMPTZ NOT NULL,
  engaged_at TIMESTAMPTZ, -- When user responded/acted
  engagement_type TEXT CHECK (engagement_type IN ('opened', 'clicked', 'completed', 'dismissed', 'ignored', NULL)),
  time_to_engage_seconds INT,
  context JSONB DEFAULT '{}', -- What was happening when delivered
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. USER MODEL: Inferred user persona (one per user)
CREATE TABLE public.user_model (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  persona JSONB DEFAULT '{}', -- inferred user archetype
  communication_preferences JSONB DEFAULT '{}', -- tone, length, timing
  engagement_patterns JSONB DEFAULT '{}', -- when they respond, what they engage with
  health_priorities JSONB DEFAULT '{}', -- what they care about most
  pain_points JSONB DEFAULT '{}', -- detected frustrations
  success_patterns JSONB DEFAULT '{}', -- what works for this user
  last_analyzed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_user_memory_user_type ON public.user_memory(user_id, memory_type);
CREATE INDEX idx_user_memory_accessed ON public.user_memory(user_id, accessed_at DESC);
CREATE INDEX idx_interaction_outcomes_user_type ON public.interaction_outcomes(user_id, interaction_type);
CREATE INDEX idx_interaction_outcomes_delivered ON public.interaction_outcomes(user_id, delivered_at DESC);
CREATE INDEX idx_interaction_outcomes_engagement ON public.interaction_outcomes(user_id, engagement_type) WHERE engagement_type IS NOT NULL;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_model ENABLE ROW LEVEL SECURITY;

-- USER MEMORY POLICIES
CREATE POLICY "Users can view their own memories"
  ON public.user_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories"
  ON public.user_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON public.user_memory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON public.user_memory FOR DELETE
  USING (auth.uid() = user_id);

-- INTERACTION OUTCOMES POLICIES
CREATE POLICY "Users can view their own interaction outcomes"
  ON public.interaction_outcomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interaction outcomes"
  ON public.interaction_outcomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No update/delete - outcomes are immutable learning data

-- USER MODEL POLICIES
CREATE POLICY "Users can view their own user model"
  ON public.user_model FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user model"
  ON public.user_model FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user model"
  ON public.user_model FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to remember something about a user
CREATE OR REPLACE FUNCTION public.remember_user_fact(
  p_user_id UUID,
  p_memory_type TEXT,
  p_key TEXT,
  p_value JSONB,
  p_source TEXT DEFAULT 'inferred',
  p_confidence FLOAT DEFAULT 1.0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_memory_id UUID;
BEGIN
  INSERT INTO public.user_memory (user_id, memory_type, key, value, source, confidence)
  VALUES (p_user_id, p_memory_type, p_key, p_value, p_source, p_confidence)
  ON CONFLICT (user_id, memory_type, key) 
  DO UPDATE SET 
    value = EXCLUDED.value,
    confidence = GREATEST(user_memory.confidence, EXCLUDED.confidence),
    source = CASE WHEN EXCLUDED.source = 'explicit' THEN 'explicit' ELSE user_memory.source END,
    updated_at = now(),
    access_count = user_memory.access_count + 1
  RETURNING id INTO v_memory_id;
  
  RETURN v_memory_id;
END;
$$;

-- Function to recall memories for a user
CREATE OR REPLACE FUNCTION public.recall_user_memories(
  p_user_id UUID,
  p_memory_type TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  memory_type TEXT,
  key TEXT,
  value JSONB,
  confidence FLOAT,
  source TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update accessed_at for the memories we're about to return
  UPDATE public.user_memory m
  SET accessed_at = now(), access_count = access_count + 1
  WHERE m.user_id = p_user_id
    AND (p_memory_type IS NULL OR m.memory_type = p_memory_type);
  
  RETURN QUERY
  SELECT m.memory_type, m.key, m.value, m.confidence, m.source, m.updated_at
  FROM public.user_memory m
  WHERE m.user_id = p_user_id
    AND (p_memory_type IS NULL OR m.memory_type = p_memory_type)
  ORDER BY m.access_count DESC, m.updated_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to log interaction outcome
CREATE OR REPLACE FUNCTION public.log_interaction_outcome(
  p_user_id UUID,
  p_interaction_type TEXT,
  p_interaction_id UUID,
  p_delivered_at TIMESTAMPTZ DEFAULT now(),
  p_context JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_outcome_id UUID;
BEGIN
  INSERT INTO public.interaction_outcomes (user_id, interaction_type, interaction_id, delivered_at, context)
  VALUES (p_user_id, p_interaction_type, p_interaction_id, p_delivered_at, p_context)
  RETURNING id INTO v_outcome_id;
  
  RETURN v_outcome_id;
END;
$$;

-- Function to mark interaction as engaged
CREATE OR REPLACE FUNCTION public.mark_interaction_engaged(
  p_outcome_id UUID,
  p_engagement_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delivered_at TIMESTAMPTZ;
BEGIN
  SELECT delivered_at INTO v_delivered_at
  FROM public.interaction_outcomes
  WHERE id = p_outcome_id;
  
  UPDATE public.interaction_outcomes
  SET 
    engaged_at = now(),
    engagement_type = p_engagement_type,
    time_to_engage_seconds = EXTRACT(EPOCH FROM (now() - v_delivered_at))::INT
  WHERE id = p_outcome_id;
END;
$$;

-- Function to get or create user model
CREATE OR REPLACE FUNCTION public.get_or_create_user_model(p_user_id UUID)
RETURNS public.user_model
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_model public.user_model;
BEGIN
  SELECT * INTO v_model FROM public.user_model WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_model (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_model;
  END IF;
  
  RETURN v_model;
END;
$$;

-- Trigger to auto-create user_model on new profile
CREATE OR REPLACE FUNCTION public.handle_new_user_model()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_model (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_create_user_model
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_model();

-- =============================================
-- TRIGGER TO AUTO-UPDATE updated_at
-- =============================================

CREATE TRIGGER update_user_memory_updated_at
  BEFORE UPDATE ON public.user_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_model_updated_at
  BEFORE UPDATE ON public.user_model
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();