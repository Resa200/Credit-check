-- ============================================================================
-- CreditCheck — Initial Schema
-- Tables: users, data_lookup_requests, audit_logs
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ──────────────────────────────────────────────────────────────────

CREATE TABLE public.users (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text        NOT NULL,
  full_name     text        NOT NULL,
  phone         text,
  avatar_url    text,
  meta          jsonb       DEFAULT '{}',
  created_on    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  modified_on   timestamptz NOT NULL DEFAULT now(),
  modified_by   uuid,
  deleted_on    timestamptz,
  deleted_by    uuid,
  deleted_flag  boolean     NOT NULL DEFAULT false
);

CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_email ON public.users(email);

-- ─── Data Lookup Requests ───────────────────────────────────────────────────

CREATE TABLE public.data_lookup_requests (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_type      text        NOT NULL CHECK (service_type IN ('bvn', 'account', 'credit')),
  request_payload   jsonb       NOT NULL DEFAULT '{}',
  response_payload  jsonb,
  status            text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error')),
  adjutor_reference text,
  meta              jsonb       DEFAULT '{}',
  created_on        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid,
  modified_on       timestamptz NOT NULL DEFAULT now(),
  modified_by       uuid,
  deleted_on        timestamptz,
  deleted_by        uuid,
  deleted_flag      boolean     NOT NULL DEFAULT false
);

CREATE INDEX idx_dlr_user_id ON public.data_lookup_requests(user_id);
CREATE INDEX idx_dlr_service_type ON public.data_lookup_requests(service_type);
CREATE INDEX idx_dlr_created_on ON public.data_lookup_requests(created_on DESC);

-- ─── Audit Logs ─────────────────────────────────────────────────────────────

CREATE TABLE public.audit_logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action        text        NOT NULL,
  resource_type text,
  resource_id   uuid,
  details       jsonb,
  ip_address    text,
  meta          jsonb       DEFAULT '{}',
  created_on    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  modified_on   timestamptz NOT NULL DEFAULT now(),
  modified_by   uuid,
  deleted_on    timestamptz,
  deleted_by    uuid,
  deleted_flag  boolean     NOT NULL DEFAULT false
);

CREATE INDEX idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);
CREATE INDEX idx_audit_created_on ON public.audit_logs(created_on DESC);

-- ─── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_lookup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own row
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Users: insert own row (for signup trigger or client-side insert)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth_id = auth.uid());

-- Data Lookup Requests: users see/insert their own
CREATE POLICY "Users can view own lookups"
  ON public.data_lookup_requests FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own lookups"
  ON public.data_lookup_requests FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own lookups"
  ON public.data_lookup_requests FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Audit Logs: users can read their own, insert their own
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ─── Auto-create user profile on signup ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name, created_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    (SELECT id FROM public.users WHERE auth_id = NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Auto-update modified_on timestamps ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_modified_on()
RETURNS trigger AS $$
BEGIN
  NEW.modified_on = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_modified
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_on();

CREATE TRIGGER trg_dlr_modified
  BEFORE UPDATE ON public.data_lookup_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_on();

CREATE TRIGGER trg_audit_modified
  BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_on();
