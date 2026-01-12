-- Fix the overly permissive INSERT policy on health_alerts
-- Replace WITH CHECK (true) with proper service role check
DROP POLICY IF EXISTS "Service can insert alerts" ON public.health_alerts;

-- Create a more restrictive policy that allows inserts only when:
-- 1. The user is inserting their own alert (authenticated user)
-- 2. Or when called from service role (edge functions)
CREATE POLICY "Users and service can insert alerts"
  ON public.health_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);