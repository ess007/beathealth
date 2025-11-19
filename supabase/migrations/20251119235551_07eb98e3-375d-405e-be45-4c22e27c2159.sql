-- Create a stored procedure to update or create streak
CREATE OR REPLACE FUNCTION update_or_create_streak(
  p_user_id UUID,
  p_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_streak RECORD;
  v_now TIMESTAMP WITH TIME ZONE;
  v_yesterday TIMESTAMP WITH TIME ZONE;
  v_new_count INTEGER;
BEGIN
  v_now := NOW();
  v_yesterday := v_now - INTERVAL '1 day';
  
  -- Get existing streak
  SELECT * INTO v_existing_streak
  FROM streaks
  WHERE user_id = p_user_id AND type = p_type;
  
  IF FOUND THEN
    -- Check if already logged today
    IF DATE(v_existing_streak.last_logged_at) = DATE(v_now) THEN
      -- Already logged today, no change needed
      RETURN;
    END IF;
    
    -- Check if was logged yesterday
    IF DATE(v_existing_streak.last_logged_at) = DATE(v_yesterday) THEN
      v_new_count := v_existing_streak.count + 1;
    ELSE
      -- Streak broken, restart at 1
      v_new_count := 1;
    END IF;
    
    -- Update existing streak
    UPDATE streaks
    SET count = v_new_count,
        last_logged_at = v_now
    WHERE id = v_existing_streak.id;
  ELSE
    -- Create new streak
    INSERT INTO streaks (user_id, type, count, last_logged_at)
    VALUES (p_user_id, p_type, 1, v_now);
  END IF;
END;
$$;