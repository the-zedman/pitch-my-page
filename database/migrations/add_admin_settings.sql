-- Admin settings table for platform configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Settings
  email_alert_enabled BOOLEAN DEFAULT true, -- Enable/disable email alerts for new pitch submissions
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Store only one settings record
  -- We'll handle uniqueness via application logic
);

-- Insert default settings if none exist
INSERT INTO public.admin_settings (email_alert_enabled)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM public.admin_settings);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and update settings
CREATE POLICY "Admins can view admin settings"
  ON public.admin_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update admin settings"
  ON public.admin_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

