-- Migration: Add recent_submissions table
-- Run this in your Supabase SQL Editor to add the new table

-- Table: recent_submissions
-- Stores recent accepted submissions for each user
CREATE TABLE IF NOT EXISTS recent_submissions (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  problem_title TEXT NOT NULL,
  problem_number INTEGER NOT NULL,
  problem_slug TEXT,
  difficulty TEXT,
  submitted_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
