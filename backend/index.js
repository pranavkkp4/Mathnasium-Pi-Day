const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.sqlite');

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      game_type TEXT NOT NULL CHECK(game_type IN ('facts', 'pi')),
      score INTEGER NOT NULL,
      detail TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(normalized_name, game_type)
    )
  `);
});

app.use(cors());
app.use(express.json());

function normalizeName(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/attempts/check', (req, res) => {
  const { name = '', gameType = '' } = req.query;
  const normalized = normalizeName(name);

  if (!normalized || !['facts', 'pi'].includes(gameType)) {
    return res.status(400).json({ error: 'name and valid gameType are required' });
  }

  db.get(
    'SELECT id FROM scores WHERE normalized_name = ? AND game_type = ?',
    [normalized, gameType],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ exists: Boolean(row) });
    }
  );
});

app.get('/scores', (req, res) => {
  const { gameType } = req.query;
  let sql = 'SELECT id, name, game_type, score, detail, timestamp FROM scores';
  const params = [];

  if (gameType) {
    if (!['facts', 'pi'].includes(gameType)) {
      return res.status(400).json({ error: 'Invalid gameType' });
    }
    sql += ' WHERE game_type = ?';
    params.push(gameType);
  }

  sql += ' ORDER BY score DESC, timestamp ASC LIMIT 100';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.post('/scores', (req, res) => {
  const { name, gameType, score, detail = null } = req.body || {};
  const normalized = normalizeName(name);

  if (!normalized) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!['facts', 'pi'].includes(gameType)) {
    return res.status(400).json({ error: 'Invalid gameType' });
  }

  if (!Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: 'Score must be a non-negative integer' });
  }

  const safeDisplayName = String(name).trim().slice(0, 60);
  const safeDetail = detail == null ? null : String(detail).slice(0, 500);

  db.run(
    `INSERT INTO scores (name, normalized_name, game_type, score, detail)
     VALUES (?, ?, ?, ?, ?)`,
    [safeDisplayName, normalized, gameType, score, safeDetail],
    function onInsert(err) {
      if (err) {
        if (String(err.message || '').includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'This name has already used its attempt for that game.' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        id: this.lastID,
        name: safeDisplayName,
        gameType,
        score
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Mathnasium Pi Day API running on port ${PORT}`);
});
