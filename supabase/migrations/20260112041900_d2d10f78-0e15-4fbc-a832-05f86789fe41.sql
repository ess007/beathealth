-- =====================================================
-- EXTENDED HEALTH INTELLIGENCE SYSTEM - COMPLETE MIGRATION
-- =====================================================

-- 1. Emergency Contacts Table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  notify_on_fall BOOLEAN DEFAULT true,
  notify_on_health_emergency BOOLEAN DEFAULT true,
  notify_on_missed_checkin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their emergency contacts"
ON public.emergency_contacts FOR ALL
USING (auth.uid() = user_id);

-- 2. Appointments Table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  appointment_type TEXT NOT NULL,
  provider_name TEXT,
  location TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  pre_visit_tasks JSONB DEFAULT '[]'::jsonb,
  post_visit_notes TEXT,
  linked_lab_result_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their appointments"
ON public.appointments FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX idx_appointments_user_date ON public.appointments(user_id, scheduled_at);

-- 3. Appointment Reminders Table
CREATE TABLE public.appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,
  reminder_type TEXT NOT NULL,
  message TEXT,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their appointment reminders"
ON public.appointment_reminders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id AND a.user_id = auth.uid()
  )
);

-- 4. Fall Events Table
CREATE TABLE public.fall_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  severity TEXT NOT NULL,
  acceleration_magnitude NUMERIC,
  location_lat NUMERIC,
  location_lon NUMERIC,
  response_status TEXT DEFAULT 'detected',
  emergency_contacts_notified JSONB DEFAULT '[]'::jsonb,
  user_response_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fall_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their fall events"
ON public.fall_events FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX idx_fall_events_user_date ON public.fall_events(user_id, detected_at DESC);

-- 5. Cognitive Assessments Table
CREATE TABLE public.cognitive_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  assessment_date DATE NOT NULL,
  assessment_type TEXT NOT NULL,
  score NUMERIC,
  max_score NUMERIC,
  time_taken_seconds INTEGER,
  responses JSONB,
  ai_analysis JSONB,
  risk_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cognitive_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their cognitive assessments"
ON public.cognitive_assessments FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX idx_cognitive_assessments_user_date ON public.cognitive_assessments(user_id, assessment_date DESC);

-- 6. Cognitive Patterns Table (Passive Monitoring)
CREATE TABLE public.cognitive_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL,
  baseline_value JSONB,
  current_value JSONB,
  deviation_percent NUMERIC,
  analyzed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cognitive_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cognitive patterns"
ON public.cognitive_patterns FOR ALL
USING (auth.uid() = user_id);

-- 7. Social Wellness Logs Table
CREATE TABLE public.social_wellness_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  log_date DATE NOT NULL,
  social_interactions INTEGER DEFAULT 0,
  interaction_types TEXT[] DEFAULT '{}',
  loneliness_score INTEGER,
  mood_score INTEGER,
  left_home BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.social_wellness_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their social wellness logs"
ON public.social_wellness_logs FOR ALL
USING (auth.uid() = user_id);

CREATE UNIQUE INDEX idx_social_wellness_user_date ON public.social_wellness_logs(user_id, log_date);

-- 8. Wellness Activities Table (Seeded)
CREATE TABLE public.wellness_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT,
  duration_minutes INTEGER,
  suitable_for TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.wellness_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wellness activities"
ON public.wellness_activities FOR SELECT
USING (true);

-- 9. Environmental Logs Table
CREATE TABLE public.environmental_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  aqi INTEGER NOT NULL,
  pm25 NUMERIC,
  pm10 NUMERIC,
  temperature_celsius NUMERIC,
  humidity_percent NUMERIC,
  pollen_index INTEGER,
  uv_index NUMERIC,
  location_lat NUMERIC,
  location_lon NUMERIC,
  city TEXT,
  source TEXT NOT NULL DEFAULT 'openweather',
  measured_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.environmental_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their environmental logs"
ON public.environmental_logs FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX idx_environmental_logs_user_date ON public.environmental_logs(user_id, measured_at DESC);

-- 10. Lab Results Table
CREATE TABLE public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  test_type TEXT NOT NULL,
  test_date DATE NOT NULL,
  results JSONB NOT NULL,
  lab_name TEXT,
  notes TEXT,
  next_test_due DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their lab results"
ON public.lab_results FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX idx_lab_results_user_date ON public.lab_results(user_id, test_date DESC);

-- 11. Lab Reminders Table
CREATE TABLE public.lab_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  test_type TEXT NOT NULL,
  frequency_months INTEGER NOT NULL DEFAULT 3,
  last_test_date DATE,
  next_due_date DATE,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their lab reminders"
ON public.lab_reminders FOR ALL
USING (auth.uid() = user_id);

-- 12. Medication Protocols Table
CREATE TABLE public.medication_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_class TEXT NOT NULL,
  condition TEXT NOT NULL,
  target_range JSONB NOT NULL,
  adjustment_rules JSONB NOT NULL,
  contraindications TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medication_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view medication protocols"
ON public.medication_protocols FOR SELECT
USING (true);

-- 13. Add columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fall_detection_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cognitive_monitoring_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_location_lat NUMERIC,
ADD COLUMN IF NOT EXISTS last_location_lon NUMERIC,
ADD COLUMN IF NOT EXISTS aqi_sensitivity_score NUMERIC DEFAULT 1.0;

-- 14. Add columns to behavior_logs
ALTER TABLE public.behavior_logs
ADD COLUMN IF NOT EXISTS social_interaction_count INTEGER,
ADD COLUMN IF NOT EXISTS loneliness_score INTEGER,
ADD COLUMN IF NOT EXISTS mood_score INTEGER;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Seed additional drug interactions (50+ more)
INSERT INTO public.drug_interactions (drug_a, drug_b, severity, description, recommendation, source) VALUES
('Atenolol', 'Verapamil', 'major', 'Combined use may cause severe bradycardia and heart block', 'Avoid combination or monitor closely with ECG', 'FDA'),
('Losartan', 'Potassium supplements', 'moderate', 'May increase potassium levels dangerously', 'Monitor potassium levels regularly', 'FDA'),
('Ramipril', 'Spironolactone', 'major', 'High risk of hyperkalemia', 'Close monitoring of potassium required', 'FDA'),
('Glimepiride', 'Fluconazole', 'moderate', 'Fluconazole increases glimepiride levels, risk of hypoglycemia', 'Monitor blood sugar closely', 'FDA'),
('Atorvastatin', 'Clarithromycin', 'major', 'Increased risk of myopathy and rhabdomyolysis', 'Avoid combination if possible', 'FDA'),
('Clopidogrel', 'Omeprazole', 'major', 'Omeprazole reduces clopidogrel effectiveness', 'Use pantoprazole instead', 'FDA'),
('Digoxin', 'Amiodarone', 'major', 'Amiodarone increases digoxin levels significantly', 'Reduce digoxin dose by 50%', 'FDA'),
('Warfarin', 'Aspirin', 'major', 'Increased bleeding risk', 'Monitor INR closely, use lowest aspirin dose', 'FDA'),
('Metformin', 'Contrast dye', 'major', 'Risk of lactic acidosis', 'Hold metformin 48hrs before/after contrast', 'FDA'),
('Lisinopril', 'Potassium-sparing diuretics', 'major', 'High risk of hyperkalemia', 'Monitor potassium levels weekly', 'FDA'),
('Amlodipine', 'Simvastatin', 'moderate', 'Increased simvastatin levels', 'Limit simvastatin to 20mg daily', 'FDA'),
('Metoprolol', 'Diltiazem', 'major', 'Risk of severe bradycardia', 'Monitor heart rate closely', 'FDA'),
('Telmisartan', 'Lithium', 'moderate', 'Increased lithium levels', 'Monitor lithium levels', 'FDA'),
('Carvedilol', 'Insulin', 'moderate', 'Beta blockers mask hypoglycemia symptoms', 'Educate patient on alternative symptoms', 'FDA'),
('Rosuvastatin', 'Gemfibrozil', 'major', 'Increased myopathy risk', 'Avoid combination', 'FDA'),
('Sitagliptin', 'Sulphonylureas', 'moderate', 'Increased hypoglycemia risk', 'May need to reduce sulphonylurea dose', 'FDA'),
('Pioglitazone', 'Insulin', 'moderate', 'Increased fluid retention and heart failure risk', 'Monitor for edema and weight gain', 'FDA'),
('Cilnidipine', 'Beta blockers', 'minor', 'Additive blood pressure lowering', 'Monitor BP for hypotension', 'Clinical'),
('Torsemide', 'Digoxin', 'moderate', 'Diuretic-induced hypokalemia increases digoxin toxicity', 'Monitor potassium levels', 'FDA'),
('Pantoprazole', 'Clopidogrel', 'minor', 'Minimal interaction compared to omeprazole', 'Preferred PPI with clopidogrel', 'FDA'),
('Aspirin', 'Ibuprofen', 'moderate', 'Ibuprofen reduces aspirin cardioprotection', 'Take aspirin 30min before ibuprofen', 'FDA'),
('Enalapril', 'Trimethoprim', 'major', 'Increased hyperkalemia risk', 'Monitor potassium levels', 'FDA'),
('Metformin', 'Alcohol', 'major', 'Increased lactic acidosis risk', 'Limit alcohol intake', 'FDA'),
('Glipizide', 'Beta blockers', 'moderate', 'Masked hypoglycemia symptoms', 'Patient education required', 'FDA'),
('Hydrochlorothiazide', 'NSAIDs', 'moderate', 'Reduced diuretic effect', 'Monitor BP and fluid status', 'FDA'),
('Furosemide', 'Aminoglycosides', 'major', 'Increased ototoxicity risk', 'Avoid combination if possible', 'FDA'),
('Propranolol', 'Verapamil', 'major', 'Risk of asystole', 'Avoid IV combination', 'FDA'),
('Candesartan', 'Aliskiren', 'major', 'Contraindicated in diabetics', 'Avoid combination', 'FDA'),
('Empagliflozin', 'Furosemide', 'moderate', 'Enhanced diuretic effect, dehydration risk', 'Monitor hydration status', 'FDA'),
('Dapagliflozin', 'Insulin', 'moderate', 'Increased hypoglycemia risk', 'May need to reduce insulin', 'FDA'),
('Vildagliptin', 'ACE inhibitors', 'minor', 'Slightly increased angioedema risk', 'Monitor for swelling', 'Clinical'),
('Teneligliptin', 'CYP3A4 inhibitors', 'moderate', 'Increased drug levels', 'Monitor for side effects', 'Clinical'),
('Glibenclamide', 'Alcohol', 'major', 'Disulfiram-like reaction possible', 'Avoid alcohol', 'FDA'),
('Nifedipine', 'Grapefruit juice', 'moderate', 'Increased nifedipine levels', 'Avoid grapefruit', 'FDA'),
('Felodipine', 'Grapefruit juice', 'major', 'Significantly increased drug levels', 'Avoid grapefruit completely', 'FDA')
ON CONFLICT DO NOTHING;

-- Seed wellness activities
INSERT INTO public.wellness_activities (title, description, category, difficulty, duration_minutes, suitable_for) VALUES
('Morning Walk', 'A gentle 15-minute walk in your neighborhood', 'physical', 'easy', 15, ARRAY['diabetes', 'hypertension', 'heart_disease']),
('Chair Yoga', 'Gentle stretching exercises done seated', 'physical', 'easy', 20, ARRAY['mobility_limited', 'diabetes', 'hypertension']),
('Family Video Call', 'Schedule a video call with family members', 'social', 'easy', 30, ARRAY['diabetes', 'hypertension', 'heart_disease', 'mobility_limited']),
('Temple/Mosque/Church Visit', 'Attend a religious gathering for spiritual wellness', 'spiritual', 'easy', 60, ARRAY['diabetes', 'hypertension']),
('Crossword Puzzle', 'Solve a crossword puzzle for mental stimulation', 'mental', 'moderate', 20, ARRAY['diabetes', 'hypertension', 'heart_disease', 'mobility_limited']),
('Sudoku Challenge', 'Complete a sudoku puzzle', 'mental', 'moderate', 15, ARRAY['diabetes', 'hypertension', 'heart_disease', 'mobility_limited']),
('Breathing Exercises', 'Deep breathing for stress relief', 'mental', 'easy', 10, ARRAY['diabetes', 'hypertension', 'heart_disease', 'mobility_limited']),
('Neighborhood Walk with Friend', 'Walk with a friend or neighbor', 'social', 'easy', 30, ARRAY['diabetes', 'hypertension']),
('Light Gardening', 'Water plants or do light gardening work', 'physical', 'easy', 20, ARRAY['diabetes', 'hypertension']),
('Call an Old Friend', 'Reconnect with someone you haven''t spoken to in a while', 'social', 'easy', 20, ARRAY['diabetes', 'hypertension', 'heart_disease', 'mobility_limited']),
('Meditation Session', '10-minute guided meditation', 'spiritual', 'easy', 10, ARRAY['diabetes', 'hypertension', 'heart_disease', 'mobility_limited']),
('Memory Card Game', 'Play a memory matching card game', 'mental', 'easy', 15, ARRAY['diabetes', 'hypertension', 'heart_disease', 'mobility_limited']),
('Senior Center Activity', 'Participate in local senior center programs', 'social', 'moderate', 120, ARRAY['diabetes', 'hypertension']),
('Reading Club', 'Join or start a book reading group', 'mental', 'easy', 60, ARRAY['diabetes', 'hypertension', 'heart_disease', 'mobility_limited']),
('Cooking Together', 'Prepare a healthy meal with family', 'social', 'moderate', 45, ARRAY['diabetes', 'hypertension']),
('Evening Prayer/Bhajan', 'Evening spiritual practice', 'spiritual', 'easy', 20, ARRAY['diabetes', 'hypertension', 'heart_disease', 'mobility_limited']),
('Arm Chair Exercises', 'Upper body exercises while seated', 'physical', 'easy', 15, ARRAY['mobility_limited', 'heart_disease']),
('Photo Album Review', 'Look through old photos with family', 'social', 'easy', 30, ARRAY['diabetes', 'hypertension', 'heart_disease', 'mobility_limited']),
('Word Association Game', 'Play word games for cognitive health', 'mental', 'easy', 15, ARRAY['diabetes', 'hypertension', 'heart_disease', 'mobility_limited']),
('Gentle Swimming', 'Low-impact swimming or water exercises', 'physical', 'moderate', 30, ARRAY['diabetes', 'hypertension', 'heart_disease'])
ON CONFLICT DO NOTHING;

-- Seed medication protocols
INSERT INTO public.medication_protocols (medication_class, condition, target_range, adjustment_rules, contraindications) VALUES
('ace_inhibitor', 'hypertension', 
  '{"systolic_min": 110, "systolic_max": 130, "diastolic_min": 70, "diastolic_max": 80}',
  '[{"if": "avg_systolic > 140 for 7 days", "then": "suggest_increase", "urgency": "routine"}, {"if": "avg_systolic < 100 for 3 days", "then": "suggest_decrease", "urgency": "soon"}]',
  ARRAY['pregnancy', 'angioedema_history', 'bilateral_renal_artery_stenosis']),
('arb', 'hypertension',
  '{"systolic_min": 110, "systolic_max": 130, "diastolic_min": 70, "diastolic_max": 80}',
  '[{"if": "avg_systolic > 140 for 7 days", "then": "suggest_increase", "urgency": "routine"}, {"if": "avg_systolic < 100 for 3 days", "then": "suggest_decrease", "urgency": "soon"}]',
  ARRAY['pregnancy', 'hyperkalemia']),
('beta_blocker', 'hypertension',
  '{"systolic_min": 110, "systolic_max": 130, "heart_rate_min": 55, "heart_rate_max": 80}',
  '[{"if": "heart_rate < 50", "then": "suggest_decrease", "urgency": "soon"}, {"if": "avg_systolic > 140 for 7 days", "then": "suggest_increase", "urgency": "routine"}]',
  ARRAY['severe_bradycardia', 'heart_block', 'uncontrolled_asthma']),
('metformin', 'diabetes',
  '{"fasting_glucose_min": 80, "fasting_glucose_max": 130, "hba1c_max": 7.0}',
  '[{"if": "avg_fasting > 150 for 14 days", "then": "suggest_increase", "urgency": "routine"}, {"if": "avg_fasting < 70 for 3 days", "then": "suggest_decrease", "urgency": "soon"}]',
  ARRAY['renal_impairment_severe', 'lactic_acidosis_history']),
('sulfonylurea', 'diabetes',
  '{"fasting_glucose_min": 80, "fasting_glucose_max": 130, "hba1c_max": 7.0}',
  '[{"if": "hypoglycemia_episodes > 2 per week", "then": "suggest_decrease", "urgency": "soon"}, {"if": "avg_fasting > 160 for 14 days", "then": "suggest_increase", "urgency": "routine"}]',
  ARRAY['renal_impairment', 'hepatic_impairment']),
('statin', 'dyslipidemia',
  '{"ldl_max": 100, "total_cholesterol_max": 200}',
  '[{"if": "ldl > 130 on current dose", "then": "suggest_increase", "urgency": "routine"}, {"if": "muscle_pain_reported", "then": "suggest_review", "urgency": "soon"}]',
  ARRAY['active_liver_disease', 'pregnancy', 'myopathy_history'])
ON CONFLICT DO NOTHING;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.fall_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.environmental_logs;