import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import pg from "pg";
import cron from "node-cron";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";


const { Pool } = pg;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
const stripe = new Stripe(STRIPE_SECRET);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: true, // reflect request origin (good for dev)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const LEETCODE_GQL = "https://leetcode.com/graphql";

// ---------------- Simple in-memory cache ----------------
const cache = new Map(); // key -> { value, exp }
const CACHE_TTL_MS = 60_000;

function getCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function setCache(key, value) {
  cache.set(key, { value, exp: Date.now() + CACHE_TTL_MS });
}

// ---------------- Postgres ----------------
const DATABASE_URL = process.env.DATABASE_URL;
const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl:
        DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
    })
  : null;

async function dbQuery(text, params = []) {
  if (!pool) throw new Error("DATABASE_URL is not set; Postgres features disabled.");
  return pool.query(text, params);
}

// Auto-migrate: ensure all tables exist on startup
async function runMigrations() {
  if (!pool) return;
  try {
    await pool.query(`
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
    `);
    console.log("✅ Database migrations completed");
  } catch (err) {
    console.error("⚠️ Migration error (non-fatal):", err.message);
  }
}

// Run migrations on startup
runMigrations();

async function ensureUser(username) {
  const u = username.trim().toLowerCase();
  const ins = await dbQuery(
    `
    INSERT INTO lc_users (username)
    VALUES ($1)
    ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
    RETURNING id, username
    `,
    [u]
  );
  return ins.rows[0];
}

async function insertSnapshot(userId, profile, tagStats) {
  const { solved } = profile;

  const snap = await dbQuery(
    `
    INSERT INTO lc_snapshots (user_id, solved_all, solved_easy, solved_medium, solved_hard)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, captured_at
    `,
    [userId, solved.all, solved.easy, solved.medium, solved.hard]
  );

  const snapshotId = snap.rows[0].id;

  if (Array.isArray(tagStats) && tagStats.length > 0) {
    const values = [];
    const params = [];
    let idx = 1;

    for (const t of tagStats) {
      values.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++})`);
      params.push(snapshotId, t.tagSlug, t.tagName, t.solved);
    }

    await dbQuery(
      `
      INSERT INTO lc_snapshot_tags (snapshot_id, tag_slug, tag_name, solved)
      VALUES ${values.join(",")}
      ON CONFLICT (snapshot_id, tag_slug) DO UPDATE
        SET tag_name = EXCLUDED.tag_name,
            solved = EXCLUDED.solved
      `,
      params
    );
  }

  return { snapshotId, capturedAt: snap.rows[0].captured_at };
}

// ---------------- Helpers ----------------
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function daysBetween(a, b) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

async function gqlRequest(query, variables) {
  const res = await fetch(LEETCODE_GQL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "leetcode-analytics-dashboard/1.0",
      accept: "application/json",
      referer: "https://leetcode.com",
      origin: "https://leetcode.com",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LeetCode GraphQL failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`LeetCode GraphQL errors: ${JSON.stringify(json.errors).slice(0, 400)}`);
  }
  return json.data;
}

// ---------------- LeetCode Fetchers ----------------
async function fetchUserProfile(username) {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;
  const data = await gqlRequest(query, { username });
  const user = data?.matchedUser;
  if (!user) return null;

  const counts = user.submitStats?.acSubmissionNum || [];
  const byDifficulty = Object.fromEntries(
    counts.map((x) => [String(x.difficulty).toLowerCase(), x.count])
  );

  const totalSolved =
    byDifficulty.all ??
    (byDifficulty.easy || 0) + (byDifficulty.medium || 0) + (byDifficulty.hard || 0);

  return {
    username: user.username,
    solved: {
      all: totalSolved,
      easy: byDifficulty.easy ?? 0,
      medium: byDifficulty.medium ?? 0,
      hard: byDifficulty.hard ?? 0,
    },
  };
}

async function fetchRecentAcceptedSubmissions(username, limit = 20) {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;
  const data = await gqlRequest(query, { username, limit });
  const list = data?.recentSubmissionList || [];
  return list
    .filter((x) => (x?.statusDisplay || "").toLowerCase() === "accepted")
    .map((x) => ({
      title: x.title,
      slug: x.titleSlug,
      lang: x.lang,
      timestamp: Number(x.timestamp),
    }));
}

async function fetchTopicTagBreakdown(username) {
  const query = `
    query skillStats($username: String!) {
      matchedUser(username: $username) {
        tagProblemCounts {
          advanced { tagName tagSlug problemsSolved }
          intermediate { tagName tagSlug problemsSolved }
          fundamental { tagName tagSlug problemsSolved }
        }
      }
    }
  `;
  const data = await gqlRequest(query, { username });
  const tpc = data?.matchedUser?.tagProblemCounts;
  if (!tpc) return [];

  const all = []
    .concat(tpc.fundamental || [])
    .concat(tpc.intermediate || [])
    .concat(tpc.advanced || []);

  return all
    .filter((x) => x && typeof x.problemsSolved === "number")
    .map((x) => ({
      tagName: x.tagName,
      tagSlug: x.tagSlug,
      solved: x.problemsSolved,
    }))
    .sort((a, b) => b.solved - a.solved);
}

// ---------------- Step 4: “Why” analytics ----------------

// Interview-leverage weights (heuristic; adjustable). Higher = more interview-relevant.
const TAG_WEIGHTS = {
  "arrays": 1.0,
  "string": 0.9,
  "hash-table": 1.1,
  "two-pointers": 1.0,
  "sliding-window": 1.1,
  "binary-search": 1.2,
  "sorting": 0.9,
  "stack": 1.0,
  "queue": 0.8,
  "linked-list": 0.8,
  "tree": 1.2,
  "binary-tree": 1.2,
  "binary-search-tree": 1.1,
  "heap-priority-queue": 1.1,
  "graph": 1.3,
  "breadth-first-search": 1.2,
  "depth-first-search": 1.2,
  "dynamic-programming": 1.35,
  "greedy": 1.1,
  "backtracking": 1.0,
  "bit-manipulation": 0.9,
  "math": 0.7,
  "union-find": 1.0,
  "trie": 0.9,
  "intervals": 1.0,
};

// Convert solved count for a tag into “coverage” in [0..1].
// This saturates so that doing 30+ doesn’t overly dominate.
function coverageFromSolved(solved) {
  const k = 12; // slope. 12 solved ~63% coverage.
  return 1 - Math.exp(-Math.max(0, solved) / k);
}

// Recency decay factor for “readiness”: if no snapshots recently, score drops.
function recencyFactor(lastSnapshotAt) {
  if (!lastSnapshotAt) return 0.5;
  const daysAgo = daysBetween(lastSnapshotAt, new Date().toISOString());
  // After ~14 days inactivity, factor ~0.37; after ~30 days ~0.12
  return Math.exp(-daysAgo / 14);
}

async function getUserIdByUsername(username) {
  const u = username.trim().toLowerCase();
  const r = await dbQuery(`SELECT id, username FROM lc_users WHERE username = $1`, [u]);
  return r.rows[0] || null;
}

async function getSnapshots(userId, days = 30) {
  const r = await dbQuery(
    `
    SELECT id, captured_at, solved_all, solved_easy, solved_medium, solved_hard
    FROM lc_snapshots
    WHERE user_id = $1 AND captured_at >= NOW() - ($2 || ' days')::interval
    ORDER BY captured_at ASC
    `,
    [userId, days]
  );
  return r.rows.map((x) => ({
    id: x.id,
    capturedAt: x.captured_at,
    solved: {
      all: Number(x.solved_all),
      easy: Number(x.solved_easy),
      medium: Number(x.solved_medium),
      hard: Number(x.solved_hard),
    },
  }));
}

function velocityFromSnapshots(snaps) {
  if (!snaps || snaps.length < 2) return { delta: null, perDay: null, elapsedDays: null };

  const first = snaps[0];
  const last = snaps[snaps.length - 1];
  const delta = last.solved.all - first.solved.all;
  const elapsedDays = Math.max(daysBetween(first.capturedAt, last.capturedAt), 0.0001);
  const perDay = delta / elapsedDays;

  return {
    delta,
    perDay: Number(perDay.toFixed(2)),
    elapsedDays: Number(elapsedDays.toFixed(2)),
    firstAt: first.capturedAt,
    lastAt: last.capturedAt,
  };
}

function difficultyRamp(profileSolved) {
  const all = profileSolved?.all || 0;
  const hard = profileSolved?.hard || 0;
  if (all === 0) return { hardRatio: 0, score: 0 };

  const hardRatio = hard / all; // 0..1
  // Target: ~10-20% hard exposure for strong readiness (varies by role)
  const score = clamp(hardRatio / 0.18, 0, 1); // 0.18 => score 1
  return { hardRatio: Number(hardRatio.toFixed(3)), score: Number(score.toFixed(3)) };
}

function breadthScore(tagStats) {
  if (!tagStats || tagStats.length === 0) return { distinctTags: 0, score: 0 };

  // Count only meaningful tags (solved >= 3) for “real breadth”
  const distinct = tagStats.filter((t) => t.solved >= 3).length;

  // 12 meaningful tags is a strong baseline breadth
  const score = clamp(distinct / 12, 0, 1);

  return { distinctTags: distinct, score: Number(score.toFixed(3)) };
}

function weightedCoverage(tagStats) {
  if (!tagStats || tagStats.length === 0) return { score: 0, details: [] };

  const details = tagStats.map((t) => {
    const w = TAG_WEIGHTS[t.tagSlug] ?? 0.6; // default for less common tags
    const cov = coverageFromSolved(t.solved);
    return {
      tagSlug: t.tagSlug,
      tagName: t.tagName,
      solved: t.solved,
      weight: w,
      coverage: Number(cov.toFixed(3)),
      weighted: w * cov,
    };
  });

  // Normalize by sum of weights
  const sumW = details.reduce((a, x) => a + x.weight, 0) || 1;
  const sumWeighted = details.reduce((a, x) => a + x.weighted, 0);
  const score = clamp(sumWeighted / sumW, 0, 1);

  return { score: Number(score.toFixed(3)), details };
}

function buildOpportunityCostRecommendations(tagStats, topN = 7) {
  if (!tagStats || tagStats.length === 0) return [];

  const ranked = tagStats
    .map((t) => {
      const weight = TAG_WEIGHTS[t.tagSlug] ?? 0.6;
      const cov = coverageFromSolved(t.solved);
      const gap = 1 - cov; // higher => bigger missing coverage
      const opportunity = weight * gap; // prioritize high leverage + low coverage

      return {
        tagSlug: t.tagSlug,
        tagName: t.tagName,
        solved: t.solved,
        weight: Number(weight.toFixed(2)),
        coverage: Number(cov.toFixed(3)),
        opportunity: Number(opportunity.toFixed(3)),
      };
    })
    .sort((a, b) => b.opportunity - a.opportunity);

  // Only recommend tags that are actually leveraged or have meaningful gap
  const filtered = ranked.filter((x) => x.opportunity >= 0.25);

  return filtered.slice(0, topN).map((x) => ({
    ...x,
    why: [
      x.weight >= 1.2 ? "High interview-leverage topic" : "Common interview topic",
      x.coverage < 0.4 ? "Low coverage based on your solved count" : "Moderate gap remaining",
      "Improves breadth and readiness faster than grinding random problems",
    ],
    nextAction: "Solve 5 problems across Easy→Medium, then reassess",
  }));
}

function readinessScore({ velocityPerDay, breadth, ramp, weightedCov, recency }) {
  // Weighting: velocity + breadth + leverage coverage + difficulty ramp, then apply recency factor.
  const v = clamp((velocityPerDay ?? 0) / 2.0, 0, 1); // 2/day => max contribution
  const b = breadth; // already 0..1
  const c = weightedCov; // 0..1
  const r = ramp; // 0..1

  // Base score out of 100
  const base =
    100 *
    (0.30 * v + 0.25 * b + 0.30 * c + 0.15 * r);

  // Recency factor penalizes inactivity (not a brutal zero, but real)
  const final = base * clamp(recency, 0.15, 1.0);

  return {
    base: Number(base.toFixed(1)),
    final: Number(final.toFixed(1)),
    components: {
      velocity: Number((100 * v).toFixed(1)),
      breadth: Number((100 * b).toFixed(1)),
      leverageCoverage: Number((100 * c).toFixed(1)),
      difficultyRamp: Number((100 * r).toFixed(1)),
      recencyFactor: Number(recency.toFixed(3)),
    },
  };
}

// ============= AUTH MIDDLEWARE & HELPERS =============
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ ok: false, error: "Missing token" });
  
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ ok: false, error: "Invalid token" });
  }
}

// ============= AUTH ROUTES =============
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: "Email and password required" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await dbQuery(
      `INSERT INTO auth_users (email, password_hash, tier)
       VALUES ($1, $2, 'free')
       RETURNING id, email, tier`,
      [email.toLowerCase(), passwordHash]
    );

    if (!result.rows.length) throw new Error("Signup failed");

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, tier: user.tier }, JWT_SECRET, { expiresIn: "30d" });

    res.json({ ok: true, user, token });
  } catch (e) {
    const msg = e.message.includes("duplicate key") ? "Email already exists" : e.message;
    res.status(400).json({ ok: false, error: msg });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: "Email and password required" });

    // Find user
    const result = await dbQuery(
      `SELECT id, email, password_hash, tier FROM auth_users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (!result.rows.length) return res.status(401).json({ ok: false, error: "User not found" });

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) return res.status(401).json({ ok: false, error: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email, tier: user.tier }, JWT_SECRET, { expiresIn: "30d" });

    res.json({ ok: true, user: { id: user.id, email: user.email, tier: user.tier }, token });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/api/auth/me", verifyToken, async (req, res) => {
  try {
    const result = await dbQuery(
      `SELECT id, email, tier FROM auth_users WHERE id = $1`,
      [req.user.id]
    );

    if (!result.rows.length) return res.status(404).json({ ok: false, error: "User not found" });

    res.json({ ok: true, user: result.rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ============= STRIPE ROUTES ================
app.post("/api/stripe/checkout", verifyToken, async (req, res) => {
  try {
    const { priceId } = req.body;
    if (!priceId) return res.status(400).json({ ok: false, error: "priceId required" });

    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard?payment=cancelled`,
      metadata: { userId: String(req.user.id) },
    });

    res.json({ ok: true, sessionId: session.id, url: session.url });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(400).json({ ok: false, error: "Webhook secret not configured" });
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await dbQuery(
          `UPDATE auth_users SET tier = 'premium', updated_at = NOW() WHERE id = $1`,
          [userId]
        );
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await dbQuery(
          `UPDATE auth_users SET tier = 'free', updated_at = NOW() WHERE id = $1`,
          [userId]
        );
      }
    }

    res.json({ ok: true, received: true });
  } catch (e) {
    console.error("Webhook error:", e.message);
    res.status(400).json({ ok: false, error: e.message });
  }
});

// ============= LEETCODE ROUTES ================
app.get("/", (req, res) => res.send("OK - LeetCode Dashboard API"));
app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/api/leetcode/dashboard/:username", async (req, res) => {
  try {
    const username = (req.params.username || "").trim();
    if (!username) return res.status(400).json({ ok: false, error: "username required" });

    const key = `dashboard:${username.toLowerCase()}`;
    const cached = getCache(key);
    if (cached) return res.json({ ok: true, data: cached, cached: true });

    const [profile, recentAC, tagStats] = await Promise.all([
      fetchUserProfile(username),
      fetchRecentAcceptedSubmissions(username, 20),
      fetchTopicTagBreakdown(username),
    ]);

    if (!profile) return res.status(404).json({ ok: false, error: "user not found or private" });

    // Track user in leaderboard (non-blocking)
    if (pool) {
      upsertLeaderboardUser(username, profile).catch(() => {});
    }

    const data = {
      profile,
      recentAccepted: recentAC,
      tags: tagStats,
      meta: {
        generatedAt: new Date().toISOString(),
        cacheTtlSeconds: Math.floor(CACHE_TTL_MS / 1000),
      },
    };

    setCache(key, data);
    return res.json({ ok: true, data, cached: false });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err?.message || String(err) });
  }
});

// Step 3: snapshot now (manual trigger)
app.post("/api/leetcode/snapshot/:username", async (req, res) => {
  try {
    const username = (req.params.username || "").trim();
    if (!username) return res.status(400).json({ ok: false, error: "username required" });

    const [profile, tagStats] = await Promise.all([
      fetchUserProfile(username),
      fetchTopicTagBreakdown(username),
    ]);

    if (!profile) return res.status(404).json({ ok: false, error: "user not found or private" });

    const userRow = await ensureUser(profile.username);
    const inserted = await insertSnapshot(userRow.id, profile, tagStats);

    return res.json({
      ok: true,
      data: {
        username: userRow.username,
        snapshotId: inserted.snapshotId,
        capturedAt: inserted.capturedAt,
        solved: profile.solved,
        tagsCount: tagStats.length,
      },
    });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err?.message || String(err) });
  }
});

// Step 3: history for charts
app.get("/api/leetcode/history/:username", async (req, res) => {
  try {
    const username = (req.params.username || "").trim().toLowerCase();
    const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);

    if (!username) return res.status(400).json({ ok: false, error: "username required" });
    const user = await dbQuery(`SELECT id, username FROM lc_users WHERE username = $1`, [username]);
    if (user.rows.length === 0) return res.status(404).json({ ok: false, error: "no snapshots yet" });

    const userId = user.rows[0].id;
    const snaps = await getSnapshots(userId, days);

    return res.json({
      ok: true,
      data: {
        username: user.rows[0].username,
        days,
        snapshots: snaps,
      },
    });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err?.message || String(err) });
  }
});

// Step 4: INSIGHTS endpoint (Readiness + Opportunity Cost + Explainability)
app.get("/api/leetcode/insights/:username", async (req, res) => {
  try {
    const username = (req.params.username || "").trim().toLowerCase();
    const days = Math.min(Math.max(Number(req.query.days || 30), 7), 365);

    if (!username) return res.status(400).json({ ok: false, error: "username required" });

    const key = `insights:${username}:${days}`;
    const cached = getCache(key);
    if (cached) return res.json({ ok: true, data: cached, cached: true });

    // Live view (LeetCode) + historical view (DB)
    const [profile, tagStats] = await Promise.all([
      fetchUserProfile(username),
      fetchTopicTagBreakdown(username),
    ]);

    if (!profile) return res.status(404).json({ ok: false, error: "user not found or private" });

    const userRow = await getUserIdByUsername(profile.username);
    const userId = userRow?.id ?? null;

    // We can still return partial insights without snapshots, but score is limited.
    const snaps = userId ? await getSnapshots(userId, days) : [];
    const vel = velocityFromSnapshots(snaps);

    const ramp = difficultyRamp(profile.solved);
    const breadth = breadthScore(tagStats);
    const wc = weightedCoverage(tagStats);

    const lastSnapshotAt = snaps.length ? snaps[snaps.length - 1].capturedAt : null;
    const rec = recencyFactor(lastSnapshotAt);

    const readiness = readinessScore({
      velocityPerDay: vel.perDay,
      breadth: breadth.score,
      ramp: ramp.score,
      weightedCov: wc.score,
      recency: rec,
    });

    const nextTopics = buildOpportunityCostRecommendations(tagStats, 7);

    const data = {
      profile,
      history: {
        days,
        snapshotCount: snaps.length,
        velocity: vel,
        lastSnapshotAt,
      },
      readiness,
      diagnostics: {
        breadth,
        difficultyRamp: ramp,
        leverageCoverageScore: wc.score,
        note:
          snaps.length < 2
            ? "Velocity is limited because you need at least 2 snapshots. Take one snapshot per day."
            : "Velocity computed from your snapshots.",
      },
      recommendations: {
        nextTopics,
        principle:
          "Ranked by opportunity cost: high interview leverage topics where your coverage is still low.",
      },
      meta: {
        generatedAt: new Date().toISOString(),
        cacheTtlSeconds: Math.floor(CACHE_TTL_MS / 1000),
      },
    };

    setCache(key, data);
    return res.json({ ok: true, data, cached: false });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err?.message || String(err) });
  }
});

// ---------------- Cron: daily snapshot for tracked users ----------------
const SNAPSHOT_CRON = process.env.SNAPSHOT_CRON || "0 2 * * *";

if (pool) {
  cron.schedule(SNAPSHOT_CRON, async () => {
    try {
      const users = await dbQuery(`SELECT username FROM lc_users ORDER BY id ASC`);
      for (const row of users.rows) {
        const username = row.username;
        try {
          const [profile, tagStats] = await Promise.all([
            fetchUserProfile(username),
            fetchTopicTagBreakdown(username),
          ]);
          if (!profile) continue;

          const userRow = await ensureUser(profile.username);
          await insertSnapshot(userRow.id, profile, tagStats);
        } catch {
          // swallow per-user failures to keep the batch moving
        }
      }
    } catch {
      // swallow batch failures; add logging later
    }
  });
}

// ---------------- Server ----------------
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// ---------------- Leaderboard Functions ----------------
const TIERS = [
  { name: "Bronze", min: 0, max: 99 },
  { name: "Silver", min: 100, max: 299 },
  { name: "Gold", min: 300, max: 599 },
  { name: "Platinum", min: 600, max: 999 },
  { name: "Diamond", min: 1000, max: 1499 },
  { name: "Iridescent", min: 1500, max: Infinity }
];

function getTierName(totalSolved) {
  const count = totalSolved ?? 0;
  const tier = TIERS.find(t => count >= t.min && count <= t.max);
  return tier ? tier.name : "Bronze";
}

async function upsertLeaderboardUser(username, profile) {
  const tier = getTierName(profile.solved.all);
  await dbQuery(
    `
    INSERT INTO leaderboard_users (username, total_solved, solved_easy, solved_medium, solved_hard, tier, last_updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (username) DO UPDATE SET
      total_solved = EXCLUDED.total_solved,
      solved_easy = EXCLUDED.solved_easy,
      solved_medium = EXCLUDED.solved_medium,
      solved_hard = EXCLUDED.solved_hard,
      tier = EXCLUDED.tier,
      last_updated_at = NOW()
    `,
    [username.toLowerCase(), profile.solved.all, profile.solved.easy, profile.solved.medium, profile.solved.hard, tier]
  );
}

// Leaderboard endpoints
app.get("/api/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 250, 1), 500);
    
    // Get total count first
    const countResult = await dbQuery(`SELECT COUNT(*) as count FROM leaderboard_users`);
    const totalUsers = parseInt(countResult.rows[0].count);
    
    // Get top users
    const result = await dbQuery(
      `SELECT username, total_solved, solved_easy, solved_medium, solved_hard, tier, first_seen_at
       FROM leaderboard_users
       ORDER BY total_solved DESC
       LIMIT $1`,
      [limit]
    );
    
    res.json({
      ok: true,
      data: {
        totalUsers,
        minUsersForTop250: 300,
        top250Active: totalUsers >= 300,
        leaderboard: result.rows.map((row, idx) => ({
          rank: idx + 1,
          username: row.username,
          totalSolved: row.total_solved,
          easy: row.solved_easy,
          medium: row.solved_medium,
          hard: row.solved_hard,
          tier: row.tier,
          joinedAt: row.first_seen_at
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/leaderboard/stats", async (req, res) => {
  try {
    const countResult = await dbQuery(`SELECT COUNT(*) as count FROM leaderboard_users`);
    const totalUsers = parseInt(countResult.rows[0].count);
    
    const tierStats = await dbQuery(
      `SELECT tier, COUNT(*) as count FROM leaderboard_users GROUP BY tier ORDER BY 
       CASE tier 
         WHEN 'Iridescent' THEN 1 
         WHEN 'Diamond' THEN 2 
         WHEN 'Platinum' THEN 3 
         WHEN 'Gold' THEN 4 
         WHEN 'Silver' THEN 5 
         WHEN 'Bronze' THEN 6 
       END`
    );
    
    res.json({
      ok: true,
      data: {
        totalUsers,
        minUsersForTop250: 300,
        top250Active: totalUsers >= 300,
        usersNeeded: Math.max(0, 300 - totalUsers),
        tierDistribution: tierStats.rows.map(r => ({ tier: r.tier, count: parseInt(r.count) }))
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/leaderboard/rank/:username", async (req, res) => {
  try {
    const username = (req.params.username || "").trim().toLowerCase();
    if (!username) return res.status(400).json({ ok: false, error: "username required" });
    
    // Get user's rank
    const result = await dbQuery(
      `SELECT username, total_solved, tier,
              (SELECT COUNT(*) + 1 FROM leaderboard_users WHERE total_solved > lu.total_solved) as rank,
              (SELECT COUNT(*) FROM leaderboard_users) as total_users
       FROM leaderboard_users lu
       WHERE username = $1`,
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.json({ ok: true, data: { found: false } });
    }
    
    const row = result.rows[0];
    const rank = parseInt(row.rank);
    const totalUsers = parseInt(row.total_users);
    
    res.json({
      ok: true,
      data: {
        found: true,
        username: row.username,
        totalSolved: row.total_solved,
        tier: row.tier,
        rank,
        totalUsers,
        isTop250: totalUsers >= 300 && rank <= 250,
        isTop10: totalUsers >= 300 && rank <= 10,
        percentile: Math.round((1 - rank / totalUsers) * 100)
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
