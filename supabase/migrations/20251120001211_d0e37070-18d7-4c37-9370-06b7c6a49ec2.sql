-- Fix 1: Restrict feature_flags to admin-only access
DROP POLICY IF EXISTS "Everyone can view feature flags" ON public.feature_flags;

CREATE POLICY "Only admins can view all feature flags"
  ON public.feature_flags
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Add authorization check to update_or_create_streak function
-- This prevents users from updating other users' streaks
CREATE OR REPLACE FUNCTION public.update_or_create_streak(p_user_id uuid, p_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_streak RECORD;
  v_now TIMESTAMP WITH TIME ZONE;
  v_yesterday TIMESTAMP WITH TIME ZONE;
  v_new_count INTEGER;
BEGIN
  -- CRITICAL: Validate caller is updating their own streak
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only update your own streaks';
  END IF;

  v_now := NOW();
  v_yesterday := v_now - INTERVAL '1 day';
  
  -- Get existing streak
  SELECT * INTO v_existing_streak
  FROM streaks
  WHERE user_id = p_user_id AND type = p_type;
  
  IF FOUND THEN
    -- Check if already logged today
    IF DATE(v_existing_streak.last_logged_at) = DATE(v_now) THEN
      RETURN;
    END IF;
    
    -- Check if was logged yesterday
    IF DATE(v_existing_streak.last_logged_at) = DATE(v_yesterday) THEN
      v_new_count := v_existing_streak.count + 1;
    ELSE
      -- Streak broken, restart at 1
      v_new_count := 1;
    END IF;
    
    -- Update existing streak
    UPDATE streaks
    SET count = v_new_count,
        last_logged_at = v_now
    WHERE id = v_existing_streak.id;
  ELSE
    -- Create new streak
    INSERT INTO streaks (user_id, type, count, last_logged_at)
    VALUES (p_user_id, p_type, 1, v_now);
  END IF;
END;
$$;

-- Fix 3: Add authorization check to create_ai_nudge function
-- Only admins should be able to create nudges (this is called by edge functions with service role)
CREATE OR REPLACE FUNCTION public.create_ai_nudge(
  target_user_id uuid, 
  nudge_text text, 
  category text DEFAULT NULL, 
  delivered_via text DEFAULT 'app'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if caller is admin OR if this is a service role call (no auth.uid())
  -- Service role calls from edge functions will have NULL auth.uid()
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only system can create AI nudges';
  END IF;
  
  INSERT INTO public.ai_nudges (user_id, nudge_text, category, delivered_via)
  VALUES (target_user_id, nudge_text, category, delivered_via);
END;
$$;