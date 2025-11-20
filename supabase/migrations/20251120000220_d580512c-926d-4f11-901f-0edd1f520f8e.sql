-- Add INSERT policy for ai_nudges to allow edge functions to create nudges
-- Users can insert their own nudges (for client-side generation)
CREATE POLICY "Users can insert their own nudges"
  ON public.ai_nudges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create SECURITY DEFINER function for edge functions to create nudges
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
  INSERT INTO public.ai_nudges (user_id, nudge_text, category, delivered_via)
  VALUES (target_user_id, nudge_text, category, delivered_via);
END;
$$;