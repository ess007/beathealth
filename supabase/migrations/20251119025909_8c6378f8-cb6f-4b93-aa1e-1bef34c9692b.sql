-- Fix handle_new_user trigger to include new profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name,
    language,
    onboarding_completed,
    text_size_preference,
    high_contrast_mode
  )
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name',
    'en',
    false,
    'medium',
    false
  );
  
  insert into public.user_roles (user_id, role)
  values (new.id, 'member');
  
  return new;
end;
$function$;