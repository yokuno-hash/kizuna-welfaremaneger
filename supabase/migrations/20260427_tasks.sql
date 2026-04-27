-- タスク管理テーブル（施設ダッシュボード用）
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'その他',
  due_date    DATE,
  completed   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own facility tasks"
  ON tasks FOR SELECT
  USING (facility_id IN (SELECT facility_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own facility tasks"
  ON tasks FOR INSERT
  WITH CHECK (facility_id IN (SELECT facility_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own facility tasks"
  ON tasks FOR UPDATE
  USING (facility_id IN (SELECT facility_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own facility tasks"
  ON tasks FOR DELETE
  USING (facility_id IN (SELECT facility_id FROM profiles WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_tasks_facility_due
  ON tasks(facility_id, due_date ASC NULLS LAST);
