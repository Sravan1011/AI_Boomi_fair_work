-- ============================================================
-- FairWork Migration 002: New Features
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  wallet TEXT PRIMARY KEY,
  display_name TEXT,
  bio TEXT,
  title TEXT,
  skills TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  website TEXT,
  twitter TEXT,
  github TEXT,
  total_jobs_completed INTEGER DEFAULT 0,
  total_earned BIGINT DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add skills column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';

-- 3. Full-text search index on jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS fts TSVECTOR
  GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || description)) STORED;

CREATE INDEX IF NOT EXISTS idx_jobs_fts ON jobs USING GIN(fts);

-- 4. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  reviewer TEXT NOT NULL,       -- wallet address of reviewer
  reviewee TEXT NOT NULL,       -- wallet address of person being reviewed
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('client', 'freelancer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, reviewer)      -- one review per reviewer per job
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  type TEXT NOT NULL,           -- 'job_accepted', 'work_submitted', 'job_approved', 'dispute_raised', 'dispute_resolved'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON profiles(wallet);
CREATE INDEX IF NOT EXISTS idx_reviews_job_id ON reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee);
CREATE INDEX IF NOT EXISTS idx_notifications_wallet ON notifications(wallet);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(wallet, is_read);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);

-- RLS: enable
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read on profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow upsert on profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on profiles" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read on reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow insert reviews" ON reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read own notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update notifications" ON notifications FOR UPDATE USING (true);

-- Helper function: update avg_rating on profiles after new review
CREATE OR REPLACE FUNCTION update_profile_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET avg_rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM reviews
    WHERE reviewee = NEW.reviewee
  ),
  total_jobs_completed = (
    SELECT COUNT(DISTINCT job_id)
    FROM reviews
    WHERE reviewee = NEW.reviewee
      AND reviewer_role = 'client'
  )
  WHERE wallet = NEW.reviewee;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_profile_avg_rating();
