-- ============================================================
-- FairWork Migration 003: Registration Fields
-- Run this in your Supabase SQL editor
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'freelancer' CHECK (role IN ('client', 'freelancer', 'both'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('entry', 'intermediate', 'expert'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_registered BOOLEAN DEFAULT FALSE;
