-- Create rate_limits table for request throttling
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 0,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON public.rate_limits(user_id, endpoint, window_start);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits (no user access needed)
CREATE POLICY "System manages rate limits"
  ON public.rate_limits
  FOR ALL
  USING (false);

-- Create audit_logs table for caregiver access tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_user_id, timestamp DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view audit logs where they are the target (see who accessed their data)
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = target_user_id);

-- Caregivers can view audit logs where they are the actor
CREATE POLICY "Caregivers can view their own actions"
  ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = actor_id);

-- Allow authenticated users to insert audit logs (for app-level logging)
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id uuid,
  _endpoint text,
  _max_requests integer,
  _window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count integer;
  v_window_start timestamptz;
  v_now timestamptz := now();
BEGIN
  -- Get current rate limit record
  SELECT request_count, window_start
  INTO v_current_count, v_window_start
  FROM rate_limits
  WHERE user_id = _user_id 
    AND endpoint = _endpoint
    AND window_start > v_now - (_window_seconds || ' seconds')::interval
  ORDER BY window_start DESC
  LIMIT 1;
  
  -- If no record or window expired, create new window
  IF NOT FOUND OR v_window_start <= v_now - (_window_seconds || ' seconds')::interval THEN
    INSERT INTO rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (_user_id, _endpoint, 1, v_now);
    RETURN true;
  END IF;
  
  -- Check if limit exceeded
  IF v_current_count >= _max_requests THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  UPDATE rate_limits
  SET request_count = request_count + 1
  WHERE user_id = _user_id 
    AND endpoint = _endpoint
    AND window_start = v_window_start;
  
  RETURN true;
END;
$$;