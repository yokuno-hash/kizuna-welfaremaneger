-- LINE ID とスタッフの紐付けテーブル
CREATE TABLE IF NOT EXISTS line_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT UNIQUE NOT NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'work',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE line_users ENABLE ROW LEVEL SECURITY;

-- LINE連携登録用ワンタイムトークン
CREATE TABLE IF NOT EXISTS line_registration_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'work',
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 minutes'),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE line_registration_tokens ENABLE ROW LEVEL SECURITY;

-- LINE経由エントリのため staff_id を nullable に変更
ALTER TABLE diaries ALTER COLUMN staff_id DROP NOT NULL;
