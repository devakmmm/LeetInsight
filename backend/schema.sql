-- Auth users table
CREATE TABLE IF NOT EXISTS auth_users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  tier TEXT DEFAULT 'free', -- 'free' or 'premium'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LeetCode profile tracking
CREATE TABLE IF NOT EXISTS lc_users (
  id BIGSERIAL PRIMARY KEY,
  auth_user_id BIGINT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lc_snapshots (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES lc_users(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  solved_all INT NOT NULL,
  solved_easy INT NOT NULL,
  solved_medium INT NOT NULL,
  solved_hard INT NOT NULL
);

CREATE TABLE IF NOT EXISTS lc_snapshot_tags (
  snapshot_id BIGINT NOT NULL REFERENCES lc_snapshots(id) ON DELETE CASCADE,
  tag_slug TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  solved INT NOT NULL,
  PRIMARY KEY (snapshot_id, tag_slug)
);

CREATE INDEX IF NOT EXISTS idx_lc_users_auth_id ON lc_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_lc_snapshots_user_time ON lc_snapshots(user_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_lc_snapshot_tags_tag ON lc_snapshot_tags(tag_slug);

-- Leaderboard tracking (tracks all searched users)
CREATE TABLE IF NOT EXISTS leaderboard_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  total_solved INT NOT NULL DEFAULT 0,
  solved_easy INT NOT NULL DEFAULT 0,
  solved_medium INT NOT NULL DEFAULT 0,
  solved_hard INT NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'Bronze',
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_solved ON leaderboard_users(total_solved DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_tier ON leaderboard_users(tier);
