-- Add DELETE policies for health data tables to allow users to remove their own data

-- Streaks table
CREATE POLICY "Users can delete their own streaks"
  ON public.streaks FOR DELETE
  USING (auth.uid() = user_id);

-- AI nudges table
CREATE POLICY "Users can delete their own nudges"
  ON public.ai_nudges FOR DELETE
  USING (auth.uid() = user_id);

-- Behavior logs table
CREATE POLICY "Users can delete their own behavior logs"
  ON public.behavior_logs FOR DELETE
  USING (auth.uid() = user_id);

-- BP logs table
CREATE POLICY "Users can delete their own BP logs"
  ON public.bp_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Sugar logs table
CREATE POLICY "Users can delete their own sugar logs"
  ON public.sugar_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Heart scores table
CREATE POLICY "Users can delete their own heart scores"
  ON public.heart_scores FOR DELETE
  USING (auth.uid() = user_id);

-- Chat conversations table
CREATE POLICY "Users can delete their own conversations"
  ON public.chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Chat messages table
CREATE POLICY "Users can delete messages in their conversations"
  ON public.chat_messages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.user_id = auth.uid()
  ));

-- Profiles table
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Family links table - allow both members and caregivers to delete links
CREATE POLICY "Members and caregivers can delete family links"
  ON public.family_links FOR DELETE
  USING (auth.uid() = member_id OR auth.uid() = caregiver_id);

-- Family links table - allow members to update permissions
CREATE POLICY "Members can update their family links"
  ON public.family_links FOR UPDATE
  USING (auth.uid() = member_id);