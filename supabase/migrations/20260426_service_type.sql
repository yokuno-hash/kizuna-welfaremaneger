-- facilities テーブルに事業種別カラムを追加
ALTER TABLE facilities
ADD COLUMN IF NOT EXISTS service_type TEXT NOT NULL DEFAULT 'b_type';
