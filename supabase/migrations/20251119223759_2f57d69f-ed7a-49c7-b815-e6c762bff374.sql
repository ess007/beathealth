-- Medications table
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT NOT NULL, -- 'morning', 'evening', 'both', 'custom'
  custom_times TIME[],
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Medication logs for adherence tracking
CREATE TABLE public.medication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE,
  skipped BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Achievements/badges table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL, -- '7_day_streak', '30_day_streak', 'bp_control_month', 'sugar_control_month'
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  shared BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications
CREATE POLICY "Users can view their own medications"
  ON public.medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
  ON public.medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON public.medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON public.medications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for medication_logs
CREATE POLICY "Users can view their own medication logs"
  ON public.medication_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medication logs"
  ON public.medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication logs"
  ON public.medication_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medication logs"
  ON public.medication_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Caregivers can view family member medications
CREATE POLICY "Caregivers can view family member medications"
  ON public.medications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_links
      WHERE family_links.member_id = medications.user_id
        AND family_links.caregiver_id = auth.uid()
        AND family_links.can_view = true
    )
  );

-- Caregivers can view family member medication logs
CREATE POLICY "Caregivers can view family member medication logs"
  ON public.medication_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_links
      WHERE family_links.member_id = medication_logs.user_id
        AND family_links.caregiver_id = auth.uid()
        AND family_links.can_view = true
    )
  );

-- RLS Policies for achievements
CREATE POLICY "Users can view their own achievements"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON public.achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- Caregivers can view family member achievements
CREATE POLICY "Caregivers can view family member achievements"
  ON public.achievements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_links
      WHERE family_links.member_id = achievements.user_id
        AND family_links.caregiver_id = auth.uid()
        AND family_links.can_view = true
    )
  );

-- Trigger for updated_at on medications
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for better query performance
CREATE INDEX idx_medications_user_id ON public.medications(user_id);
CREATE INDEX idx_medication_logs_user_id ON public.medication_logs(user_id);
CREATE INDEX idx_medication_logs_scheduled_at ON public.medication_logs(scheduled_at);
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_achievements_badge_type ON public.achievements(badge_type);