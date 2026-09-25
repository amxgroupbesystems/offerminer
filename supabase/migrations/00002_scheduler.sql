-- Ajusta os constraints criados pela migration inicial para permitir o estado
-- running e as frequências usadas pela interface do OfferMiner.
ALTER TABLE public.monitored_searches DROP CONSTRAINT IF EXISTS monitored_searches_status_check;
ALTER TABLE public.monitored_searches ADD CONSTRAINT monitored_searches_status_check CHECK (status IN ('active', 'paused', 'running'));
ALTER TABLE public.monitored_searches DROP CONSTRAINT IF EXISTS monitored_searches_frequency_check;
ALTER TABLE public.monitored_searches ADD CONSTRAINT monitored_searches_frequency_check CHECK (frequency IN ('daily', 'twice_daily', 'hourly', 'weekly', 'biweekly'));

CREATE INDEX IF NOT EXISTS idx_monitored_searches_due
  ON public.monitored_searches (next_execution_at)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_search_runs_pending
  ON public.search_runs (created_at)
  WHERE status IN ('queued', 'running');
