-- ============================================================
-- 00_base_schema.sql
-- 実行順序: このファイルを最初に実行すること
-- ============================================================

-- ── facilities（事業所）────────────────────────────────────
CREATE TABLE IF NOT EXISTS facilities (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
-- ※ service_type カラムは 20260426_service_type.sql で追加される

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは自分の施設を参照できる
CREATE POLICY "Authenticated users can read facilities"
  ON facilities FOR SELECT
  USING (auth.role() = 'authenticated');

-- service_role（API）のみ INSERT 可能（create-facility ルート経由）
CREATE POLICY "Service role can insert facilities"
  ON facilities FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update facilities"
  ON facilities FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete facilities"
  ON facilities FOR DELETE
  USING (auth.role() = 'service_role');


-- ── profiles（ユーザーと施設の紐付け）──────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id  UUID REFERENCES facilities(id) ON DELETE SET NULL,
  role         TEXT NOT NULL DEFAULT 'facility',  -- 'facility' | 'admin'
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 自分のプロフィールのみ参照可能
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- service_role が INSERT（create-facility ルート経由）
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update profiles"
  ON profiles FOR UPDATE
  USING (auth.role() = 'service_role');

-- 新規ユーザー登録時に自動で profiles を作成するトリガー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── clients（利用者）────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id  UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own facility clients"
  ON clients FOR SELECT
  USING (facility_id IN (
    SELECT facility_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert own facility clients"
  ON clients FOR INSERT
  WITH CHECK (facility_id IN (
    SELECT facility_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete own facility clients"
  ON clients FOR DELETE
  USING (facility_id IN (
    SELECT facility_id FROM profiles WHERE id = auth.uid()
  ));


-- ── staff（指導員）──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id  UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'work',  -- 'work'=職業指導員 / 'life'=生活支援員
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own facility staff"
  ON staff FOR SELECT
  USING (facility_id IN (
    SELECT facility_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert own facility staff"
  ON staff FOR INSERT
  WITH CHECK (facility_id IN (
    SELECT facility_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete own facility staff"
  ON staff FOR DELETE
  USING (facility_id IN (
    SELECT facility_id FROM profiles WHERE id = auth.uid()
  ));


-- ── diaries（日報）──────────────────────────────────────────
-- ※ role カラムは 20260427_diary_role_column.sql で追加される
-- ※ staff_id の NOT NULL は 20260427_line_users.sql で解除される
CREATE TABLE IF NOT EXISTS diaries (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id     UUID NOT NULL REFERENCES auth.users(id),
  facility_id  UUID REFERENCES facilities(id) ON DELETE CASCADE,
  client_name  TEXT NOT NULL,
  staff_name   TEXT NOT NULL,
  attendance   TEXT NOT NULL DEFAULT '○',
  breakfast    TEXT DEFAULT '○',
  sleep        TEXT DEFAULT '○',
  ratings      JSONB DEFAULT '{}',
  comments     JSONB DEFAULT '{}',
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own facility diaries"
  ON diaries FOR SELECT
  USING (facility_id IN (
    SELECT facility_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert own facility diaries"
  ON diaries FOR INSERT
  WITH CHECK (
    staff_id = auth.uid()
    AND facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 検索用インデックス
CREATE INDEX IF NOT EXISTS idx_diaries_facility_client
  ON diaries(facility_id, client_name, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_diaries_facility_date
  ON diaries(facility_id, recorded_at DESC);
