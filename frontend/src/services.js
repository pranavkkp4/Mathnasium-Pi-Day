import { supabase } from './lib/supabase.js';

const GAME_TYPES = ['facts', 'pi'];

function normalizeName(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function mapRow(row) {
  return {
    ...row,
    game_type: row.game_type,
    timestamp: row.created_at
  };
}

function requireConfiguredClient() {
  if (!supabase) {
    throw new Error('Leaderboard is not configured yet.');
  }
  return supabase;
}

function validateGameType(gameType) {
  if (gameType && !GAME_TYPES.includes(gameType)) {
    throw new Error('Invalid game type.');
  }
}

function normalizeError(error) {
  if (error && error.code === '23505') {
    return new Error('This name has already used its attempt for that game.');
  }
  return new Error(error?.message || 'Request failed');
}

export async function fetchScores(gameType) {
  validateGameType(gameType);
  const client = requireConfiguredClient();

  let query = client
    .from('scores')
    .select('id, name, game_type, score, detail, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(100);

  if (gameType) {
    query = query.eq('game_type', gameType);
  }

  const { data, error } = await query;
  if (error) {
    throw normalizeError(error);
  }

  return (data || []).map(mapRow);
}

export async function checkAttempt(name, gameType) {
  validateGameType(gameType);
  const client = requireConfiguredClient();
  const normalized = normalizeName(name);

  if (!normalized) {
    throw new Error('Name is required.');
  }

  const { count, error } = await client
    .from('scores')
    .select('id', { count: 'exact', head: true })
    .eq('normalized_name', normalized)
    .eq('game_type', gameType);

  if (error) {
    throw normalizeError(error);
  }

  return { exists: (count || 0) > 0 };
}

export async function submitScore(payload) {
  const client = requireConfiguredClient();
  const { name, gameType, score, detail = null } = payload || {};

  validateGameType(gameType);

  const safeDisplayName = String(name || '').trim().slice(0, 60);
  if (!safeDisplayName) {
    throw new Error('Name is required.');
  }

  if (!Number.isInteger(score) || score < 0) {
    throw new Error('Score must be a non-negative integer.');
  }

  const safeDetail = detail == null ? null : String(detail).slice(0, 500);

  const { data, error } = await client
    .from('scores')
    .insert([
      {
        name: safeDisplayName,
        game_type: gameType,
        score,
        detail: safeDetail
      }
    ])
    .select('id, name, game_type, score')
    .single();

  if (error) {
    throw normalizeError(error);
  }

  return {
    id: data.id,
    name: data.name,
    gameType: data.game_type,
    score: data.score
  };
}
