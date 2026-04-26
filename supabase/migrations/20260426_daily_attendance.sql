-- daily_attendance テーブル作成
CREATE TABLE IF NOT EXISTS daily_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  recorded_date DATE NOT NULL,
  attendance TEXT NOT NULL DEFAULT '○',
  lunch TEXT DEFAULT '○',
  transport TEXT DEFAULT '○',
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(facility_id, client_name, recorded_date)
);

-- RLS 有効化
ALTER TABLE daily_attendance ENABLE ROW LEVEL SECURITY;

-- 同一施設ユーザーが参照・変更可能
CREATE POLICY "Users can read own facility attendance"
  ON daily_attendance FOR SELECT
  USING (facility_id IN (
    SELECT facility_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert own facility attendance"
  ON daily_attendance FOR INSERT
  WITH CHECK (facility_id IN (
    SELECT facility_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own facility attendance"
  ON daily_attendance FOR UPDATE
  USING (facility_id IN (
    SELECT facility_id FROM profiles WHERE id = auth.uid()
  ));
