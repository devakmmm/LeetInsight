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

-- Email waitlist / capture
CREATE TABLE IF NOT EXISTS email_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  lc_username TEXT,
  source TEXT DEFAULT 'waitlist', -- 'waitlist', 'weekly_report', 'streak_reminder'
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Private Leaderboards
CREATE TABLE IF NOT EXISTS private_leaderboards (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS private_leaderboard_members (
  id BIGSERIAL PRIMARY KEY,
  leaderboard_id BIGINT NOT NULL REFERENCES private_leaderboards(id) ON DELETE CASCADE,
  lc_username TEXT NOT NULL,
  nickname TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(leaderboard_id, lc_username)
);

CREATE INDEX IF NOT EXISTS idx_private_lb_code ON private_leaderboards(invite_code);
CREATE INDEX IF NOT EXISTS idx_private_lb_members ON private_leaderboard_members(leaderboard_id);

-- User Goals
CREATE TABLE IF NOT EXISTS user_goals (
  id BIGSERIAL PRIMARY KEY,
  lc_username TEXT NOT NULL,
  goal_type TEXT NOT NULL, -- 'weekly_problems', 'weekly_hard', 'daily_streak', 'reach_tier'
  target_value INT NOT NULL,
  current_value INT DEFAULT 0,
  period TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly', 'total'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_goals_username ON user_goals(lc_username);
