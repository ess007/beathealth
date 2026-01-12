-- Add smoking and cholesterol fields to profiles for better risk calculation
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS smoking_status TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS cholesterol_ratio NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_hba1c NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_hba1c_date DATE DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.smoking_status IS 'Smoking status: never, former, current, unknown';
COMMENT ON COLUMN public.profiles.cholesterol_ratio IS 'Total cholesterol / HDL ratio';
COMMENT ON COLUMN public.profiles.last_hba1c IS 'Last HbA1c test result';
COMMENT ON COLUMN public.profiles.last_hba1c_date IS 'Date of last HbA1c test';

-- Create index for wellness activities
CREATE INDEX IF NOT EXISTS idx_wellness_activities_category ON public.wellness_activities(category, is_active);

-- Enable realtime for social wellness logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_wellness_logs;