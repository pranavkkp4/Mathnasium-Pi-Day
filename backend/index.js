require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

const GAME_TYPES = ['facts', 'pi'];
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Set it to your PostgreSQL connection string.');
}

function getSslConfig() {
  const sslMode = String(process.env.PGSSLMODE || '').toLowerCase();
  if (sslMode === 'disable') {
    return false;
  }
  if (sslMode === 'require' || process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false };
  }
  return false;
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: getSslConfig()
});

const schemaSql = `
  CREATE TABLE IF NOT EXISTS scores (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    game_type TEXT NOT NULL CHECK (game_type IN ('facts', 'pi')),
    score INTEGER NOT NULL CHECK (score >= 0),
    detail TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(normalized_name, game_type)
  );

  CREATE INDEX IF NOT EXISTS scores_game_type_score_created_idx
    ON scores (game_type, score DESC, created_at ASC);
`;

app.use(cors());
app.use(express.json());

function normalizeName(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

async function initDb() {
  await pool.query(schemaSql);
}

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ ok: false, error: 'Database unavailable' });
  }
});

app.get('/attempts/check', async (req, res) => {
  const { name = '', gameType = '' } = req.query;
  const normalized = normalizeName(name);

  if (!normalized || !GAME_TYPES.includes(gameType)) {
    return res.status(400).json({ error: 'name and valid gameType are required' });
  }

  try {
    const result = await pool.query(
      'SELECT id FROM scores WHERE normalized_name = $1 AND game_type = $2',
      [normalized, gameType]
    );
    return res.json({ exists: result.rowCount > 0 });
  } catch (error) {
    console.error('Attempt lookup failed:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/scores', async (req, res) => {
  const { gameType } = req.query;
  let sql = `
    SELECT id, name, game_type, score, detail, created_at AS timestamp
    FROM scores
  `;
  const params = [];

  if (gameType) {
    if (!GAME_TYPES.includes(gameType)) {
      return res.status(400).json({ error: 'Invalid gameType' });
    }
    sql += ' WHERE game_type = $1';
    params.push(gameType);
  }

  sql += ` ORDER BY score DESC, created_at ASC LIMIT 100`;

  try {
    const result = await pool.query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Score lookup failed:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/scores', async (req, res) => {
  const { name, gameType, score, detail = null } = req.body || {};
  const normalized = normalizeName(name);

  if (!normalized) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!GAME_TYPES.includes(gameType)) {
    return res.status(400).json({ error: 'Invalid gameType' });
  }

  if (!Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: 'Score must be a non-negative integer' });
  }

  const safeDisplayName = String(name).trim().slice(0, 60);
  const safeDetail = detail == null ? null : String(detail).slice(0, 500);

  try {
    const result = await pool.query(
      `INSERT INTO scores (name, normalized_name, game_type, score, detail)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [safeDisplayName, normalized, gameType, score, safeDetail]
    );

    return res.status(201).json({
      id: result.rows[0].id,
      name: safeDisplayName,
      gameType,
      score
    });
  } catch (error) {
    if (error && error.code === '23505') {
      return res.status(409).json({ error: 'This name has already used its attempt for that game.' });
    }
    console.error('Score insert failed:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Mathnasium Pi Day API running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
