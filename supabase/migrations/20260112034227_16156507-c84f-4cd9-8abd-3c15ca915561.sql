-- =============================================
-- PHASE 1: CGM + Enhanced Vitals Tables
-- =============================================

-- CGM readings table for continuous glucose monitoring data
CREATE TABLE public.cgm_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  glucose_mg_dl INTEGER NOT NULL,
  trend_arrow TEXT CHECK (trend_arrow IN ('rising_fast', 'rising', 'stable', 'falling', 'falling_fast')),
  measured_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  time_in_range BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Continuous vitals table for SpO2, HRV, heart rate, temperature
CREATE TABLE public.vitals_continuous (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vital_type TEXT NOT NULL CHECK (vital_type IN ('heart_rate', 'spo2', 'hrv', 'temperature', 'respiratory_rate')),
  value NUMERIC NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 2: Diet Tracking Tables
-- =============================================

-- Meal logs with AI-detected nutrition
CREATE TABLE public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  image_url TEXT,
  description TEXT,
  ai_detected_items JSONB,
  estimated_calories INTEGER,
  estimated_carbs NUMERIC,
  estimated_glycemic_load INTEGER,
  logged_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 3: Activity Intelligence Tables
-- =============================================

-- Activity sessions for tracking exercise and movement
CREATE TABLE public.activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('walking', 'running', 'cycling', 'yoga', 'stairs', 'sedentary', 'other')),
  duration_minutes INTEGER,
  intensity TEXT CHECK (intensity IN ('light', 'moderate', 'vigorous')),
  estimated_calories_burned INTEGER,
  avg_heart_rate INTEGER,
  steps_count INTEGER,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  source TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 4: Multi-Condition Reasoning Tables
-- =============================================

-- Condition analysis for multi-condition optimization
CREATE TABLE public.condition_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  analysis_date DATE NOT NULL,
  conditions JSONB NOT NULL,
  risk_scores JSONB NOT NULL,
  cross_impacts JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Drug interactions reference table
CREATE TABLE public.drug_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_a TEXT NOT NULL,
  drug_b TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('major', 'moderate', 'minor')),
  description TEXT NOT NULL,
  recommendation TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lifestyle correlations for pattern learning
CREATE TABLE public.lifestyle_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  correlation_type TEXT NOT NULL CHECK (correlation_type IN ('meal_glucose', 'exercise_bp', 'sleep_metabolism', 'stress_vitals', 'medication_timing')),
  input_factors JSONB NOT NULL,
  predicted_outcome JSONB NOT NULL,
  actual_outcome JSONB,
  accuracy_score NUMERIC,
  analyzed_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 5: Risk Forecasting Tables
-- =============================================

-- Risk forecasts for 6-12 month predictions
CREATE TABLE public.risk_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  forecast_date DATE NOT NULL,
  forecast_horizon_months INTEGER NOT NULL CHECK (forecast_horizon_months IN (6, 12)),
  risk_type TEXT NOT NULL CHECK (risk_type IN ('cardiovascular_event', 'diabetic_complications', 'kidney_disease', 'retinopathy', 'stroke', 'neuropathy')),
  current_risk_percent NUMERIC NOT NULL,
  projected_risk_percent NUMERIC NOT NULL,
  key_risk_factors JSONB,
  mitigation_actions JSONB,
  confidence_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Add drug_code and drug_class to medications
-- =============================================

ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS drug_code TEXT;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS drug_class TEXT;
ALTER TABLE public.medications ADD COLUMN IF NOT EXISTS interactions_checked BOOLEAN DEFAULT false;

-- =============================================
-- Enable RLS on all new tables
-- =============================================

ALTER TABLE public.cgm_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals_continuous ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condition_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyle_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_forecasts ENABLE ROW LEVEL SECURITY;

-- Drug interactions is a reference table, publicly readable
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for CGM Readings
-- =============================================

CREATE POLICY "Users can view their own CGM readings"
ON public.cgm_readings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CGM readings"
ON public.cgm_readings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CGM readings"
ON public.cgm_readings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CGM readings"
ON public.cgm_readings FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for Vitals Continuous
-- =============================================

CREATE POLICY "Users can view their own vitals"
ON public.vitals_continuous FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vitals"
ON public.vitals_continuous FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vitals"
ON public.vitals_continuous FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vitals"
ON public.vitals_continuous FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for Meal Logs
-- =============================================

CREATE POLICY "Users can view their own meal logs"
ON public.meal_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal logs"
ON public.meal_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal logs"
ON public.meal_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal logs"
ON public.meal_logs FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for Activity Sessions
-- =============================================

CREATE POLICY "Users can view their own activity sessions"
ON public.activity_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity sessions"
ON public.activity_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity sessions"
ON public.activity_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity sessions"
ON public.activity_sessions FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for Condition Analysis
-- =============================================

CREATE POLICY "Users can view their own condition analysis"
ON public.condition_analysis FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own condition analysis"
ON public.condition_analysis FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own condition analysis"
ON public.condition_analysis FOR UPDATE
USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for Lifestyle Correlations
-- =============================================

CREATE POLICY "Users can view their own lifestyle correlations"
ON public.lifestyle_correlations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lifestyle correlations"
ON public.lifestyle_correlations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lifestyle correlations"
ON public.lifestyle_correlations FOR UPDATE
USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for Risk Forecasts
-- =============================================

CREATE POLICY "Users can view their own risk forecasts"
ON public.risk_forecasts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own risk forecasts"
ON public.risk_forecasts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk forecasts"
ON public.risk_forecasts FOR UPDATE
USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for Drug Interactions (Public Read)
-- =============================================

CREATE POLICY "Anyone can view drug interactions"
ON public.drug_interactions FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage drug interactions"
ON public.drug_interactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Create indexes for performance
-- =============================================

CREATE INDEX idx_cgm_readings_user_date ON public.cgm_readings(user_id, measured_at DESC);
CREATE INDEX idx_vitals_continuous_user_type ON public.vitals_continuous(user_id, vital_type, measured_at DESC);
CREATE INDEX idx_meal_logs_user_date ON public.meal_logs(user_id, logged_at DESC);
CREATE INDEX idx_activity_sessions_user_date ON public.activity_sessions(user_id, started_at DESC);
CREATE INDEX idx_condition_analysis_user_date ON public.condition_analysis(user_id, analysis_date DESC);
CREATE INDEX idx_lifestyle_correlations_user ON public.lifestyle_correlations(user_id, analyzed_at DESC);
CREATE INDEX idx_risk_forecasts_user_date ON public.risk_forecasts(user_id, forecast_date DESC);
CREATE INDEX idx_drug_interactions_drugs ON public.drug_interactions(drug_a, drug_b);

-- =============================================
-- Seed common drug interactions for India
-- =============================================

INSERT INTO public.drug_interactions (drug_a, drug_b, severity, description, recommendation, source) VALUES
('metformin', 'alcohol', 'major', 'Increases risk of lactic acidosis', 'Avoid alcohol or limit consumption significantly', 'FDA'),
('metformin', 'contrast_dye', 'major', 'Can cause acute kidney injury', 'Stop metformin 48 hours before contrast procedures', 'FDA'),
('amlodipine', 'simvastatin', 'moderate', 'Increases simvastatin blood levels and risk of muscle problems', 'Limit simvastatin to 20mg when used with amlodipine', 'FDA'),
('atenolol', 'metformin', 'moderate', 'Beta blockers can mask hypoglycemia symptoms', 'Monitor blood sugar more frequently', 'Clinical'),
('ramipril', 'potassium_supplements', 'major', 'Risk of dangerous hyperkalemia', 'Avoid potassium supplements unless directed by doctor', 'FDA'),
('telmisartan', 'potassium_supplements', 'major', 'Risk of dangerous hyperkalemia', 'Avoid potassium supplements unless directed by doctor', 'FDA'),
('glimepiride', 'fluconazole', 'major', 'Increases hypoglycemia risk significantly', 'Monitor blood sugar closely, may need dose adjustment', 'FDA'),
('aspirin', 'clopidogrel', 'moderate', 'Increased bleeding risk but often prescribed together', 'Monitor for signs of bleeding, take as prescribed', 'Clinical'),
('atorvastatin', 'grapefruit', 'moderate', 'Grapefruit increases statin blood levels', 'Avoid grapefruit or limit to small amounts', 'FDA'),
('losartan', 'ibuprofen', 'moderate', 'NSAIDs reduce effectiveness of blood pressure medications', 'Use acetaminophen instead when possible', 'FDA'),
('insulin', 'beta_blockers', 'moderate', 'Beta blockers can mask hypoglycemia symptoms', 'Monitor blood sugar more frequently, know other hypoglycemia signs', 'Clinical'),
('warfarin', 'aspirin', 'major', 'Significantly increases bleeding risk', 'Only combine under close medical supervision', 'FDA'),
('digoxin', 'amiodarone', 'major', 'Amiodarone increases digoxin levels by 70-100%', 'Reduce digoxin dose by 50% when starting amiodarone', 'FDA'),
('lisinopril', 'spironolactone', 'major', 'High risk of hyperkalemia', 'Monitor potassium levels regularly', 'FDA'),
('metoprolol', 'verapamil', 'major', 'Can cause severe bradycardia and heart block', 'Avoid combination if possible', 'FDA');

-- =============================================
-- Enable realtime for key tables
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.cgm_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_forecasts;