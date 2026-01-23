-- Add DELETE policy for challenge_members so users can leave challenges
CREATE POLICY "Users can leave challenges"
ON public.challenge_members
FOR DELETE
USING (auth.uid() = user_id);

-- Add some sample wellness activities
INSERT INTO public.wellness_activities (title, description, category, difficulty, duration_minutes, suitable_for, is_active) VALUES
('5-Minute Deep Breathing', 'Calm your mind with guided deep breathing exercises. Perfect for reducing stress and lowering blood pressure.', 'breathing', 'easy', 5, ARRAY['hypertension', 'diabetes', 'stress'], true),
('Morning Stretch Routine', 'Gentle stretches to start your day right. Improves circulation and flexibility.', 'exercise', 'easy', 10, ARRAY['seniors', 'diabetes', 'heart_disease'], true),
('Mindful Walking', 'A 15-minute walking meditation combining movement with mindfulness.', 'meditation', 'easy', 15, ARRAY['diabetes', 'hypertension', 'obesity'], true),
('Heart-Healthy Cardio', 'Low-impact cardio exercises designed for heart health. Suitable for beginners.', 'cardio', 'medium', 20, ARRAY['heart_disease', 'hypertension'], true),
('Sleep Wind-Down', 'Relaxing routine to prepare your body for restful sleep. Includes gentle yoga and breathing.', 'sleep', 'easy', 15, ARRAY['stress', 'hypertension', 'seniors'], true),
('Guided Meditation', 'A calming 10-minute guided meditation for stress relief and mental clarity.', 'meditation', 'easy', 10, ARRAY['stress', 'anxiety', 'hypertension'], true),
('Chair Exercises', 'Safe and effective exercises you can do while seated. Perfect for those with mobility concerns.', 'exercise', 'easy', 15, ARRAY['seniors', 'mobility_issues'], true),
('Post-Meal Walk', 'A gentle 10-minute walk after meals to help regulate blood sugar levels.', 'exercise', 'easy', 10, ARRAY['diabetes', 'prediabetes'], true)
ON CONFLICT DO NOTHING;

-- Add some sample challenges 
INSERT INTO public.challenges (title, description, start_date, end_date, is_active, reward_points, rule_json) VALUES
('#120Club', 'Keep your systolic BP under 120 for 7 consecutive days. Join the elite club of controlled BP!', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true, 100, '{"target": "bp_systolic", "threshold": 120, "duration_days": 7}'::jsonb),
('Sugar Steady Challenge', 'Maintain fasting sugar under 100 mg/dL for 14 days. Win badges and health!', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true, 150, '{"target": "fasting_sugar", "threshold": 100, "duration_days": 14}'::jsonb),
('Morning Ritual Streak', 'Complete your morning check-in for 21 consecutive days. Build the habit!', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true, 200, '{"target": "morning_ritual", "streak_days": 21}'::jsonb),
('10K Steps Week', 'Average 10,000 steps per day for a full week. Get moving!', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', true, 75, '{"target": "daily_steps", "average": 10000, "duration_days": 7}'::jsonb),
('Medication Master', 'Take all your medications on time for 30 days straight. Perfect adherence!', CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', true, 250, '{"target": "medication_adherence", "threshold": 100, "duration_days": 30}'::jsonb)
ON CONFLICT DO NOTHING;