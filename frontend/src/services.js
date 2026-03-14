const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function fetchScores(gameType) {
  const url = gameType ? `${API_BASE_URL}/scores?gameType=${encodeURIComponent(gameType)}` : `${API_BASE_URL}/scores`;
  return handle(await fetch(url));
}

export async function checkAttempt(name, gameType) {
  const params = new URLSearchParams({ name, gameType });
  return handle(await fetch(`${API_BASE_URL}/attempts/check?${params.toString()}`));
}

export async function submitScore(payload) {
  return handle(
    await fetch(`${API_BASE_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  );
}
