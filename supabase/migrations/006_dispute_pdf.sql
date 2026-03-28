-- ============================================================
-- Migration 006: Dispute PDF & Responses
-- Adds PDF hash and agree/disagree tracking to disputes
-- ============================================================

ALTER TABLE disputes ADD COLUMN IF NOT EXISTS dispute_pdf_ipfs TEXT;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS client_response TEXT CHECK (client_response IN ('AGREE', 'DISAGREE'));
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS freelancer_response TEXT CHECK (freelancer_response IN ('AGREE', 'DISAGREE'));
