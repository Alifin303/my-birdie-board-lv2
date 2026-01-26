-- Create activity log table for tracking user actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying by date and user
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow authenticated users to insert their own activity logs
CREATE POLICY "Users can insert their own activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (user_id, action, details)
  VALUES (p_user_id, p_action, p_details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create trigger to log round insertions
CREATE OR REPLACE FUNCTION public.log_round_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.log_user_activity(
    NEW.user_id,
    'round_added',
    jsonb_build_object('round_id', NEW.id, 'course_id', NEW.course_id, 'gross_score', NEW.gross_score)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_round_insert
AFTER INSERT ON public.rounds
FOR EACH ROW
EXECUTE FUNCTION public.log_round_insert();

-- Create trigger to log round deletions
CREATE OR REPLACE FUNCTION public.log_round_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.log_user_activity(
    OLD.user_id,
    'round_deleted',
    jsonb_build_object('round_id', OLD.id, 'course_id', OLD.course_id, 'gross_score', OLD.gross_score)
  );
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_round_delete
BEFORE DELETE ON public.rounds
FOR EACH ROW
EXECUTE FUNCTION public.log_round_delete();

-- Update the handle_user_sign_in function to also log activity
CREATE OR REPLACE FUNCTION public.handle_user_sign_in()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update last login
  UPDATE profiles 
  SET last_login = new.last_sign_in_at
  WHERE id = new.id;
  
  -- Log the sign in activity
  PERFORM public.log_user_activity(
    new.id,
    'user_login',
    jsonb_build_object('sign_in_at', new.last_sign_in_at)
  );
  
  RETURN new;
END;
$$;