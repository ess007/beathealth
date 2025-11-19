-- Add RLS policies to allow caregivers to view family member health data

-- Allow caregivers to view family member profiles
CREATE POLICY "Caregivers can view family member profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_links
      WHERE family_links.member_id = profiles.id
      AND family_links.caregiver_id = auth.uid()
      AND family_links.can_view = true
    )
  );

-- Allow caregivers to view family member BP logs
CREATE POLICY "Caregivers can view family member BP logs"
  ON public.bp_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_links
      WHERE family_links.member_id = bp_logs.user_id
      AND family_links.caregiver_id = auth.uid()
      AND family_links.can_view = true
    )
  );

-- Allow caregivers to view family member sugar logs
CREATE POLICY "Caregivers can view family member sugar logs"
  ON public.sugar_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_links
      WHERE family_links.member_id = sugar_logs.user_id
      AND family_links.caregiver_id = auth.uid()
      AND family_links.can_view = true
    )
  );

-- Allow caregivers to view family member heart scores
CREATE POLICY "Caregivers can view family member heart scores"
  ON public.heart_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_links
      WHERE family_links.member_id = heart_scores.user_id
      AND family_links.caregiver_id = auth.uid()
      AND family_links.can_view = true
    )
  );

-- Allow caregivers to view family member behavior logs
CREATE POLICY "Caregivers can view family member behavior logs"
  ON public.behavior_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_links
      WHERE family_links.member_id = behavior_logs.user_id
      AND family_links.caregiver_id = auth.uid()
      AND family_links.can_view = true
    )
  );

-- Allow caregivers to view family member streaks
CREATE POLICY "Caregivers can view family member streaks"
  ON public.streaks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_links
      WHERE family_links.member_id = streaks.user_id
      AND family_links.caregiver_id = auth.uid()
      AND family_links.can_view = true
    )
  );

-- Add UPDATE policy for heart_scores (minor issue fix)
CREATE POLICY "Users can update their own heart scores"
  ON public.heart_scores FOR UPDATE
  USING (auth.uid() = user_id);