import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchScores } from '../services.js';

function formatSubmittedAt(value) {
  if (!value) return '—';
  const normalized =
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2} /.test(value)
      ? `${value.replace(' ', 'T')}Z`
      : value;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
}

function LeaderboardTable({ title, rows, unit }) {
  return (
    <article className="glass leaderboard-card">
      <div className="leaderboard-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>Top Scores</h3>
        </div>
      </div>

      <div className="table-wrap">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="4">No scores yet.</td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${row.game_type}-${row.id}`}>
                  <td>{index + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.score} {unit}</td>
                  <td>{formatSubmittedAt(row.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default function LeaderboardPage() {
  const [factsScores, setFactsScores] = useState([]);
  const [piScores, setPiScores] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [facts, pi] = await Promise.all([fetchScores('facts'), fetchScores('pi')]);
        setFactsScores(facts);
        setPiScores(pi);
      } catch (err) {
        setError(err.message || 'Could not load leaderboard.');
      }
    }
    load();
  }, []);

  return (
    <section className="stack-lg">
      <div className="glass page-hero">
        <p className="eyebrow">Leaderboard</p>
        <h1>Global rankings for both Pi Day games.</h1>
        <p className="lead">
          Each name gets one official score per mode, so the leaderboard stays fair and event-ready.
        </p>
        <div className="button-row">
          <Link to="/play" className="button primary">
            Play Now
          </Link>
          <Link to="/" className="button secondary">
            Back to Home
          </Link>
        </div>
      </div>

      {error ? <p className="status-message">{error}</p> : null}

      <div className="leaderboard-grid">
        <LeaderboardTable title="Math Facts Sprint" rows={factsScores} unit="pts" />
        <LeaderboardTable title="Pi Memory Mode" rows={piScores} unit="digits" />
      </div>
    </section>
  );
}
