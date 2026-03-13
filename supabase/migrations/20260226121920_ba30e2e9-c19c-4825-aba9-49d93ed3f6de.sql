CREATE TABLE public.dashboard_cache (
  id TEXT PRIMARY KEY DEFAULT 'stats',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dashboard_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access dashboard_cache"
  ON public.dashboard_cache
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
