-- ============================================================
-- Migration 004: Legal Evidence Pipeline
-- Tables: meet_recordings, legal_reports
-- ============================================================

-- Meet recordings: stores JaaS recording metadata + IPFS CID + transcript
CREATE TABLE IF NOT EXISTS meet_recordings (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id           UUID REFERENCES jobs(id) ON DELETE CASCADE,
  room_name        TEXT NOT NULL,
  jaas_session_id  TEXT,
  ipfs_cid         TEXT,
  transcript       TEXT,
  duration_seconds INTEGER,
  recorded_by      TEXT NOT NULL,   -- wallet address
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Legal reports: formal arbitration report generated from all evidence
CREATE TABLE IF NOT EXISTS legal_reports (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id       UUID UNIQUE REFERENCES disputes(id) ON DELETE CASCADE,
  report_text      TEXT NOT NULL,
  report_ipfs      TEXT,
  evidence_summary JSONB DEFAULT '{}',
  recommendation   TEXT CHECK (recommendation IN ('CLIENT', 'FREELANCER', 'NEUTRAL')),
  confidence       INTEGER CHECK (confidence BETWEEN 0 AND 100),
  generated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS meet_recordings_job_id_idx ON meet_recordings (job_id);
CREATE INDEX IF NOT EXISTS meet_recordings_room_name_idx ON meet_recordings (room_name);
CREATE INDEX IF NOT EXISTS legal_reports_dispute_id_idx ON legal_reports (dispute_id);

-- Row Level Security
ALTER TABLE meet_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_reports   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read meet_recordings"
  ON meet_recordings FOR SELECT USING (true);
CREATE POLICY "Allow insert meet_recordings"
  ON meet_recordings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update meet_recordings"
  ON meet_recordings FOR UPDATE USING (true);

CREATE POLICY "Public read legal_reports"
  ON legal_reports FOR SELECT USING (true);
CREATE POLICY "Allow insert legal_reports"
  ON legal_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update legal_reports"
  ON legal_reports FOR UPDATE USING (true);
