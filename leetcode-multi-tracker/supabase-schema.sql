-- LeetCode Multi-User Tracker - Database Schema
-- Run this in your Supabase SQL Editor

-- Table: leetcode_snapshot
-- Stores the current state of each user's LeetCode progress
CREATE TABLE leetcode_snapshot (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  total_solved INTEGER DEFAULT 0,
  easy_solved INTEGER DEFAULT 0,
  medium_solved INTEGER DEFAULT 0,
  hard_solved INTEGER DEFAULT 0,
  total_easy INTEGER DEFAULT 0,
  total_medium INTEGER DEFAULT 0,
  total_hard INTEGER DEFAULT 0,
  acceptance_rate DECIMAL(5,2) DEFAULT 0,
  ranking INTEGER DEFAULT 0,
  contribution_points INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  last_delta INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_snapshot_username ON leetcode_snapshot(username);

-- Table: solve_history
-- Logs solve events when new problems are solved
CREATE TABLE solve_history (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  problems_solved INTEGER NOT NULL,
  total_at_time INTEGER NOT NULL,
  solved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_username ON solve_history(username);
CREATE INDEX idx_history_solved_at ON solve_history(solved_at DESC);

-- Table: sync_history
-- Stores a record of each sync with complete stats per user
CREATE TABLE sync_history (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  total_solved INTEGER DEFAULT 0,
  easy_solved INTEGER DEFAULT 0,
  medium_solved INTEGER DEFAULT 0,
  hard_solved INTEGER DEFAULT 0,
  acceptance_rate NUMERIC(5,2),
  ranking INTEGER DEFAULT 0,
  contribution_points INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_history_username_synced ON sync_history(username, synced_at DESC);

-- Row Level Security
ALTER TABLE leetcode_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE solve_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_history ENABLE ROW LEVEL SECURITY;

-- Read policies (public access)
CREATE POLICY "Allow public read" ON leetcode_snapshot FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON solve_history FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON sync_history FOR SELECT USING (true);

-- Write policies (for service role)
CREATE POLICY "Allow service write snapshot" ON leetcode_snapshot FOR ALL USING (true);
CREATE POLICY "Allow service write history" ON solve_history FOR ALL USING (true);
CREATE POLICY "Allow service write sync" ON sync_history FOR INSERT WITH CHECK (true);
