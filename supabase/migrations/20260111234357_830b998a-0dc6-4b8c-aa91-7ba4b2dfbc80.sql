-- L2 Agent Infrastructure Tables

-- 1. Agent Action Log - Track all autonomous agent actions for transparency
CREATE TABLE public.agent_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'auto_nudge', 'auto_goal_adjust', 'auto_celebrate', 'escalate', 'schedule_followup'
  action_payload JSONB NOT NULL DEFAULT '{}',
  trigger_reason TEXT NOT NULL, -- Why agent took this action
  trigger_type TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'event', 'user_request'
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'pending_review', 'reverted', 'failed'
  reverted_at TIMESTAMPTZ,
  revert_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Agent Preferences - Per-user autonomy settings
CREATE TABLE public.agent_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  autonomy_level TEXT NOT NULL DEFAULT 'balanced', -- 'minimal', 'balanced', 'full'
  auto_nudge_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_goal_adjust_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_celebrate_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_escalate_enabled BOOLEAN NOT NULL DEFAULT true,
  max_nudges_per_day INTEGER NOT NULL DEFAULT 5,
  max_goal_adjustments_per_week INTEGER NOT NULL DEFAULT 2,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '07:00:00',
  preferred_nudge_times JSONB DEFAULT '{"morning": "07:30", "afternoon": "13:00", "evening": "19:30"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Agent Scheduled Tasks - Proactive task queue
CREATE TABLE public.agent_scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  task_type TEXT NOT NULL, -- 'daily_analysis', 'streak_check', 'goal_review', 'bp_logged', 'sugar_logged', 'missed_checkin'
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  priority INTEGER NOT NULL DEFAULT 5, -- 1 = highest, 10 = lowest
  payload JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.agent_action_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_action_log
CREATE POLICY "Users can view their own agent actions"
  ON public.agent_action_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can revert their own agent actions"
  ON public.agent_action_log FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can insert (agent operates with service role)
CREATE POLICY "Service can insert agent actions"
  ON public.agent_action_log FOR INSERT
  WITH CHECK (true);

-- RLS Policies for agent_preferences
CREATE POLICY "Users can view their own agent preferences"
  ON public.agent_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent preferences"
  ON public.agent_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent preferences"
  ON public.agent_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for agent_scheduled_tasks (service-managed, users can view)
CREATE POLICY "Users can view their scheduled tasks"
  ON public.agent_scheduled_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage scheduled tasks"
  ON public.agent_scheduled_tasks FOR ALL
  USING (true);

-- Indexes for performance
CREATE INDEX idx_agent_action_log_user_id ON public.agent_action_log(user_id);
CREATE INDEX idx_agent_action_log_created_at ON public.agent_action_log(created_at DESC);
CREATE INDEX idx_agent_action_log_status ON public.agent_action_log(status);

CREATE INDEX idx_agent_scheduled_tasks_status ON public.agent_scheduled_tasks(status);
CREATE INDEX idx_agent_scheduled_tasks_scheduled_for ON public.agent_scheduled_tasks(scheduled_for);
CREATE INDEX idx_agent_scheduled_tasks_user_id ON public.agent_scheduled_tasks(user_id);

-- Function to create default agent preferences for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_agent_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agent_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create agent preferences on profile creation
CREATE TRIGGER on_profile_created_agent_prefs
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_agent_preferences();

-- Function to schedule agent task on BP log
CREATE OR REPLACE FUNCTION public.trigger_agent_on_bp_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agent_scheduled_tasks (user_id, task_type, scheduled_for, priority, payload)
  VALUES (
    NEW.user_id,
    'bp_logged',
    now() + interval '30 seconds',
    3,
    jsonb_build_object(
      'bp_log_id', NEW.id,
      'systolic', NEW.systolic,
      'diastolic', NEW.diastolic,
      'heart_rate', NEW.heart_rate
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER bp_log_agent_trigger
  AFTER INSERT ON public.bp_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_agent_on_bp_log();

-- Function to schedule agent task on sugar log
CREATE OR REPLACE FUNCTION public.trigger_agent_on_sugar_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agent_scheduled_tasks (user_id, task_type, scheduled_for, priority, payload)
  VALUES (
    NEW.user_id,
    'sugar_logged',
    now() + interval '30 seconds',
    3,
    jsonb_build_object(
      'sugar_log_id', NEW.id,
      'glucose_mg_dl', NEW.glucose_mg_dl,
      'measurement_type', NEW.measurement_type
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER sugar_log_agent_trigger
  AFTER INSERT ON public.sugar_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_agent_on_sugar_log();

-- Function to update agent preferences timestamp
CREATE TRIGGER update_agent_preferences_updated_at
  BEFORE UPDATE ON public.agent_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to count today's nudges for guardrails
CREATE OR REPLACE FUNCTION public.get_agent_nudge_count_today(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.agent_action_log
  WHERE user_id = p_user_id
    AND action_type = 'auto_nudge'
    AND status = 'completed'
    AND created_at >= CURRENT_DATE;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to count this week's goal adjustments for guardrails
CREATE OR REPLACE FUNCTION public.get_agent_goal_adjustments_this_week(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.agent_action_log
  WHERE user_id = p_user_id
    AND action_type = 'auto_goal_adjust'
    AND status = 'completed'
    AND created_at >= date_trunc('week', CURRENT_DATE);
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;