-- Fix RLS policies to be more secure
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Service can insert agent actions" ON public.agent_action_log;
DROP POLICY IF EXISTS "Service can manage scheduled tasks" ON public.agent_scheduled_tasks;

-- These tables are managed by edge functions using service role key
-- Users can only view/update their own data via the specific policies already created
-- No additional policies needed - service role bypasses RLS