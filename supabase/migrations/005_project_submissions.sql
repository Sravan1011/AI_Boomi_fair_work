-- ============================================================
-- Migration 005: Project Submissions
-- Stores detailed project deliverables submitted by freelancers
-- ============================================================

CREATE TABLE IF NOT EXISTS project_submissions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id           UUID REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer       TEXT NOT NULL,        -- wallet address
  title            TEXT NOT NULL,        -- submission title
  description      TEXT NOT NULL,        -- detailed description of work done
  deliverable_ipfs TEXT,                 -- main deliverable file IPFS hash
  files            JSONB DEFAULT '[]',   -- array of { name, ipfsHash, type, size }
  demo_url         TEXT,                 -- live demo link
  repo_url         TEXT,                 -- source code / repository link
  notes            TEXT,                 -- additional notes for the client
  completion_pct   INTEGER DEFAULT 100 CHECK (completion_pct BETWEEN 0 AND 100),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_submissions_job_id ON project_submissions(job_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_freelancer ON project_submissions(freelancer);

-- RLS
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read project_submissions" ON project_submissions FOR SELECT USING (true);
CREATE POLICY "Allow insert project_submissions" ON project_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update project_submissions" ON project_submissions FOR UPDATE USING (true);
