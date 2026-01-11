-- Create fitness_imports table for tracking imported data
CREATE TABLE public.fitness_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('google_fit', 'fitbit', 'apple_health', 'samsung_health', 'csv', 'json')),
  file_name TEXT,
  records_imported INTEGER NOT NULL DEFAULT 0,
  data_types TEXT[] NOT NULL DEFAULT '{}',
  raw_data JSONB,
  import_status TEXT NOT NULL DEFAULT 'completed' CHECK (import_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fitness_imports ENABLE ROW LEVEL SECURITY;

-- Users can view their own imports
CREATE POLICY "Users can view own imports" ON public.fitness_imports
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own imports
CREATE POLICY "Users can create own imports" ON public.fitness_imports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_fitness_imports_user_id ON public.fitness_imports(user_id);
CREATE INDEX idx_fitness_imports_created_at ON public.fitness_imports(created_at DESC);