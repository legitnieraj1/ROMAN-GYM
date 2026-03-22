-- ============================================================
--  ROMAN GYM  –  Complete Database Setup (Supabase / PostgreSQL)
--  Run this ONCE on a fresh Supabase project via the SQL editor.
--  Idempotent: uses IF NOT EXISTS / CREATE OR REPLACE everywhere.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0.  EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ─────────────────────────────────────────────────────────────
-- 1.  PUBLIC.USERS  (admin account — manages everything)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id                  UUID        PRIMARY KEY
                                    REFERENCES auth.users(id) ON DELETE CASCADE,
    email               TEXT        UNIQUE,
    name                TEXT,
    phone               TEXT        UNIQUE,
    age                 INT,
    weight              FLOAT,
    height              FLOAT,
    address             TEXT,
    photo               TEXT,
    role                TEXT        NOT NULL DEFAULT 'MEMBER'
                                    CHECK (role IN ('ADMIN', 'MEMBER', 'DALUXEADMIN')),
    body_goal           TEXT        CHECK (body_goal IN ('CUT', 'BULK', 'MAINTAIN')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile"   ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles"       ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users"   ON public.users;
DROP POLICY IF EXISTS "Allow public read access to users"  ON public.users;
DROP POLICY IF EXISTS "Allow read access to all"           ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles"     ON public.users;

-- ① Anyone may read (avoids recursive RLS on admin checks)
CREATE POLICY "Allow read access to all"
    ON public.users FOR SELECT
    USING (true);

-- ② Owner updates their own row
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- ③ Admins can update any row
CREATE POLICY "Admins can update all profiles"
    ON public.users FOR UPDATE
    USING ((SELECT role FROM public.users WHERE id = auth.uid())
           IN ('ADMIN', 'DALUXEADMIN'));


-- ─────────────────────────────────────────────────────────────
-- 2.  MEMBERS  (gym members — PIN-based login)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.members (
    id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    enroll_no        TEXT,
    name             TEXT    NOT NULL,
    age              INT,
    weight           FLOAT,
    height           FLOAT,
    dob              DATE,
    photo_url        TEXT,
    mobile           TEXT    NOT NULL UNIQUE,  -- 10-digit normalised
    pin_hash         TEXT    NOT NULL,
    membership_start DATE,
    membership_end   DATE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_mobile    ON public.members(mobile);
CREATE INDEX IF NOT EXISTS idx_members_enroll_no ON public.members(enroll_no);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for auth check"      ON public.members;
DROP POLICY IF EXISTS "Allow server-side insert/update"       ON public.members;
DROP POLICY IF EXISTS "Allow server-side insert/update/delete" ON public.members;

CREATE POLICY "Allow public read for auth check"
    ON public.members FOR SELECT
    USING (true);

-- Backend (service-role key) handles all writes
CREATE POLICY "Allow server-side writes"
    ON public.members FOR ALL
    USING (true);


-- ─────────────────────────────────────────────────────────────
-- 3.  MEMBER_PAYMENTS  (Razorpay payments by PIN-auth members)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.member_payments (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id           UUID    NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    plan                TEXT    NOT NULL,          -- 'BASIC', 'PRO', 'ELITE'
    amount              FLOAT   NOT NULL,
    razorpay_order_id   TEXT,
    razorpay_payment_id TEXT,
    status              TEXT    CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_payments_member_id ON public.member_payments(member_id);

ALTER TABLE public.member_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to member_payments" ON public.member_payments;

CREATE POLICY "Allow all access to member_payments"
    ON public.member_payments FOR ALL
    USING (true);


-- ─────────────────────────────────────────────────────────────
-- 4.  ATTENDANCE  (check-in / check-out log)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance (
    id             UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id      UUID    NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    check_in_time  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    date           DATE    NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON public.attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date      ON public.attendance(date);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to attendance" ON public.attendance;

-- Backend handles all attendance writes; admin reads via service-role
CREATE POLICY "Allow all access to attendance"
    ON public.attendance FOR ALL
    USING (true);


-- ─────────────────────────────────────────────────────────────
-- 5.  DIET_PLANS  (AI-generated diet plans per member)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id    UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    weekly_plan  TEXT,      -- markdown weekly plan from AI
    calories     INT,
    protein      INT,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diet_plans_member_id ON public.diet_plans(member_id);

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own diet plan"  ON public.diet_plans;
DROP POLICY IF EXISTS "Admins can view all diet plans"      ON public.diet_plans;
DROP POLICY IF EXISTS "Admins can manage diet plans"        ON public.diet_plans;
DROP POLICY IF EXISTS "Allow all access to diet_plans"      ON public.diet_plans;

CREATE POLICY "Allow all access to diet_plans"
    ON public.diet_plans FOR ALL
    USING (true);


-- ─────────────────────────────────────────────────────────────
-- 6.  TRAINERS  (trainer profiles shown on the public site)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trainers (
    id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT    NOT NULL,
    specialty    TEXT    NOT NULL,
    experience   TEXT    NOT NULL,
    image_url    TEXT,
    social_links JSONB   NOT NULL DEFAULT '{}'::JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view trainers"   ON public.trainers;
DROP POLICY IF EXISTS "Admins can manage trainers" ON public.trainers;

CREATE POLICY "Public can view trainers"
    ON public.trainers FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage trainers"
    ON public.trainers FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users
                   WHERE id = auth.uid()
                   AND role IN ('ADMIN', 'DALUXEADMIN')));


-- ─────────────────────────────────────────────────────────────
-- 7.  PLANS  (membership plan catalogue)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.plans (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT    NOT NULL UNIQUE,   -- 'BASIC', 'PRO', 'ELITE'
    name            TEXT    NOT NULL,
    price_inr       INT     NOT NULL,
    duration_months INT     NOT NULL,
    features        TEXT[],
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view plans"   ON public.plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON public.plans;

CREATE POLICY "Anyone can view plans"
    ON public.plans FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage plans"
    ON public.plans FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users
                   WHERE id = auth.uid()
                   AND role IN ('ADMIN', 'DALUXEADMIN')));

-- Seed default plans (safe to re-run)
INSERT INTO public.plans (code, name, price_inr, duration_months, features)
VALUES
    ('BASIC', 'Basic Plan', 3099, 3,
     ARRAY['Gym Access', 'Locker', 'Diet Guidance']),
    ('PRO',   'Pro Plan',   4699, 6,
     ARRAY['Gym Access', 'Locker', 'Diet Guidance', 'Personal Trainer (2/month)', 'Progress Tracking']),
    ('ELITE', 'Elite Plan', 6699, 12,
     ARRAY['Unlimited Gym Access', 'Dedicated Locker', 'AI Diet Plan', 'Personal Trainer (weekly)', 'Progress Tracking', 'Nutrition Consultation'])
ON CONFLICT (code) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 8.  TRIGGERS  – auto-update updated_at on public.users
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 9.  HELPER VIEWS  (admin dashboard convenience)
-- ─────────────────────────────────────────────────────────────

-- All members with live membership status and current plan
CREATE OR REPLACE VIEW public.active_members AS
WITH latest_payment AS (
    SELECT DISTINCT ON (member_id)
        member_id, plan
    FROM public.member_payments
    WHERE status = 'SUCCESS'
    ORDER BY member_id, created_at DESC
)
SELECT
    m.id,
    m.enroll_no,
    m.name,
    m.mobile,
    m.age,
    m.membership_start,
    m.membership_end,
    CASE
        WHEN m.membership_end IS NULL             THEN 'NO_PLAN'
        WHEN m.membership_end >= CURRENT_DATE     THEN 'ACTIVE'
        ELSE                                           'EXPIRED'
    END AS membership_status,
    (m.membership_end - CURRENT_DATE) AS days_remaining,
    lp.plan AS current_plan
FROM public.members m
LEFT JOIN latest_payment lp ON lp.member_id = m.id;

-- Payment totals per member
CREATE OR REPLACE VIEW public.member_payment_summary AS
SELECT
    m.id            AS member_id,
    m.name,
    m.mobile,
    COUNT(mp.id)    AS total_payments,
    SUM(mp.amount) FILTER (WHERE mp.status = 'SUCCESS') AS total_paid,
    MAX(mp.created_at) AS last_payment_at
FROM public.members m
LEFT JOIN public.member_payments mp ON mp.member_id = m.id
GROUP BY m.id, m.name, m.mobile;


-- ─────────────────────────────────────────────────────────────
-- 10. STORAGE BUCKETS  (create via Supabase Dashboard → Storage)
-- ─────────────────────────────────────────────────────────────
-- Cannot be created with SQL. Create these two public buckets manually:
--   • member-photos   – member profile pictures
--   • trainer-images  – trainer profile pictures

-- ─────────────────────────────────────────────────────────────
-- END OF SCHEMA
-- ─────────────────────────────────────────────────────────────
