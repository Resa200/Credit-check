-- ============================================================================
-- CreditCheck — Subscriptions, Payment Cards, Payment Transactions
-- ============================================================================

-- ─── Subscriptions ──────────────────────────────────────────────────────────

CREATE TABLE public.subscriptions (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  paystack_customer_code      text,
  paystack_subscription_code  text,
  paystack_plan_code          text,
  status                      text        NOT NULL DEFAULT 'none'
                              CHECK (status IN ('active','cancelled','past_due','expired','none')),
  current_period_start        timestamptz,
  current_period_end          timestamptz,
  cancelled_at                timestamptz,
  meta                        jsonb       DEFAULT '{}',
  created_on                  timestamptz NOT NULL DEFAULT now(),
  created_by                  uuid,
  modified_on                 timestamptz NOT NULL DEFAULT now(),
  modified_by                 uuid,
  deleted_on                  timestamptz,
  deleted_by                  uuid,
  deleted_flag                boolean     NOT NULL DEFAULT false
);

CREATE INDEX idx_sub_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_sub_status ON public.subscriptions(status);

-- ─── Payment Cards ──────────────────────────────────────────────────────────

CREATE TABLE public.payment_cards (
  id                            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  paystack_authorization_code   text        NOT NULL,
  card_bin                      text,
  card_last4                    text,
  card_exp_month                text,
  card_exp_year                 text,
  card_type                     text,
  bank                          text,
  is_default                    boolean     NOT NULL DEFAULT false,
  meta                          jsonb       DEFAULT '{}',
  created_on                    timestamptz NOT NULL DEFAULT now(),
  created_by                    uuid,
  modified_on                   timestamptz NOT NULL DEFAULT now(),
  modified_by                   uuid,
  deleted_on                    timestamptz,
  deleted_by                    uuid,
  deleted_flag                  boolean     NOT NULL DEFAULT false
);

CREATE INDEX idx_pc_user_id ON public.payment_cards(user_id);

-- ─── Payment Transactions ───────────────────────────────────────────────────

CREATE TABLE public.payment_transactions (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id     uuid        REFERENCES public.subscriptions(id),
  paystack_reference  text        UNIQUE,
  amount              integer     NOT NULL,
  currency            text        NOT NULL DEFAULT 'NGN',
  status              text        NOT NULL
                      CHECK (status IN ('success','failed','abandoned','reversed')),
  payment_type        text        NOT NULL DEFAULT 'subscription'
                      CHECK (payment_type IN ('subscription','one_time')),
  meta                jsonb       DEFAULT '{}',
  created_on          timestamptz NOT NULL DEFAULT now(),
  created_by          uuid,
  modified_on         timestamptz NOT NULL DEFAULT now(),
  modified_by         uuid,
  deleted_on          timestamptz,
  deleted_by          uuid,
  deleted_flag        boolean     NOT NULL DEFAULT false
);

CREATE INDEX idx_pt_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_pt_reference ON public.payment_transactions(paystack_reference);

-- ─── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Subscriptions
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Payment Cards
CREATE POLICY "Users can view own cards"
  ON public.payment_cards FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own cards"
  ON public.payment_cards FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own cards"
  ON public.payment_cards FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Payment Transactions
CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own transactions"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ─── Auto-update modified_on ────────────────────────────────────────────────

CREATE TRIGGER trg_subscriptions_modified
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_on();

CREATE TRIGGER trg_payment_cards_modified
  BEFORE UPDATE ON public.payment_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_on();

CREATE TRIGGER trg_payment_transactions_modified
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_on();
