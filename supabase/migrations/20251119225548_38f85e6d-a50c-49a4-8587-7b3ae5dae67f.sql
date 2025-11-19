-- Create health_goals table
CREATE TABLE public.health_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL, -- 'bp_control', 'weight_loss', 'step_count', 'sugar_control', 'consistency'
  target_value NUMERIC NOT NULL,
  current_value NUMERIC,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own goals"
  ON public.health_goals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON public.health_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.health_goals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.health_goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Caregivers can view family member goals
CREATE POLICY "Caregivers can view family member goals"
  ON public.health_goals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_links
      WHERE family_links.member_id = health_goals.user_id
        AND family_links.caregiver_id = auth.uid()
        AND family_links.can_view = true
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_health_goals_updated_at
  BEFORE UPDATE ON public.health_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index
CREATE INDEX idx_health_goals_user_status ON public.health_goals(user_id, status);
CREATE INDEX idx_health_goals_type ON public.health_goals(goal_type);