-- diaries テーブルに role カラムを追加（職業指導員=work / 生活支援員=life）
ALTER TABLE diaries ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'work';

-- 既存データ: comments->>'role' が入っている場合はそちらを使う
UPDATE diaries
SET role = COALESCE(comments->>'role', 'work')
WHERE role IS NULL OR role = 'work';

-- インデックス（facility_id + client_name + role でのフィルタ用）
CREATE INDEX IF NOT EXISTS idx_diaries_facility_client_role
  ON diaries(facility_id, client_name, role, recorded_at DESC);
