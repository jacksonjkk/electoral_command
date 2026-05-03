
-- Create ec_admins table to track administrators in the public schema
CREATE TABLE IF NOT EXISTS ec_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ec_admins ENABLE ROW LEVEL SECURITY;

-- Policies for ec_admins
CREATE POLICY "Admins can view the admin list"
  ON ec_admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- Function to handle new admin registration
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.raw_user_meta_data->>'role' = 'ec_admin') THEN
    INSERT INTO public.ec_admins (user_id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a user is created
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();

-- Backfill existing admins from auth.users
INSERT INTO public.ec_admins (user_id, email)
SELECT id, email
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'ec_admin'
ON CONFLICT (user_id) DO NOTHING;
