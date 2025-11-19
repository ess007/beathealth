-- Add tutorial_completed field to profiles table
ALTER TABLE public.profiles
ADD COLUMN tutorial_completed BOOLEAN DEFAULT false;

-- Add tutorial_step field to track current step
ALTER TABLE public.profiles
ADD COLUMN tutorial_step INTEGER DEFAULT 0;