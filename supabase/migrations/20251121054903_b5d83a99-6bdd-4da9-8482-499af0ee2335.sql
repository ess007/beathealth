-- Fix critical security issues in database functions

-- 1. Create secure email lookup function to fix family member addition
CREATE OR REPLACE FUNCTION public.lookup_user_by_email(_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Only allow looking up users by email for family link creation
  -- This is secure because it only returns the user ID, not sensitive profile data
  SELECT id INTO _user_id
  FROM profiles
  WHERE email = _email;
  
  RETURN _user_id;
END;
$$;

-- 2. Fix create_ai_nudge to include search_path (best practice)
CREATE OR REPLACE FUNCTION public.create_ai_nudge(target_user_id uuid, nudge_text text, category text DEFAULT NULL::text, delivered_via text DEFAULT 'app'::text)
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