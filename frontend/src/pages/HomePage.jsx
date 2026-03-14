import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchScores } from '../services.js';

const highlights = [
  {
    title: 'Why Pi Matters',
    value: 'Real-world math',
    body: 'Pi links circles to measurement and shows up in engineering, architecture, data science, and physics.'
  },
  {
    title: 'Stronger Problem Solving',
    value: 'Reasoning skills',
    body: 'Pi Day activities turn abstract ideas into hands-on challenge, helping students build confidence and accuracy.'
  },
  {
    title: 'Community Challenge',
    value: 'One fair attempt',
    body: 'Students can compete in two modes and compare scores on the leaderboard with one official attempt per game.'
  }
];

function previewText(row, unit) {
  if (!row) {
    return {
      value: 'No scores yet',
      detail: 'Be the first entry.'
    };
  }
  return {
    value: `${row.score} ${unit}`,
    detail: row.name
  };
}

export default function HomePage() {
  const [factsTop, setFactsTop] = useState(null);
  const [piTop, setPiTop] = useState(null);
  const [loadingBoard, setLoadingBoard] = useState(true);

  useEffect(() => {
    async function loadLeaders() {
      try {
        const [facts, pi] = await Promise.all([fetchScores('facts'), fetchScores('pi')]);
        setFactsTop(facts[0] || null);
        setPiTop(pi[0] || null);
      } catch (_error) {
        setFactsTop(null);
        setPiTop(null);
      } finally {
        setLoadingBoard(false);
      }
    }
    loadLeaders();
  }, []);

  const factsPreview = previewText(factsTop, 'pts');
  const piPreview = previewText(piTop, 'digits');

  return (
    <section className="home-stack stack-lg">
      <div className="glass page-hero home-hero">
        <p className="eyebrow">Welcome to Pi Day</p>
        <h1>Welcome to Pi Day at Mathnasium.</h1>
        <p className="lead">
          Pi Day celebrates curiosity, precision, and creative problem solving. The number π
          connects circle geometry to real-world engineering, technology, and science.
        </p>

        <div className="button-row">
          <Link to="/play" className="button primary">
            Start the Challenges
          </Link>
          <Link to="/leaderboard" className="button secondary">
            Open Leaderboards
          </Link>
          <Link to="/history" className="button secondary">
            Why Pi Matters
          </Link>
        </div>
      </div>

      <div className="feature-grid clean-grid">
        {highlights.map((item) => (
          <article key={item.title} className="glass card">
            <p className="stat-value">{item.value}</p>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>

      <div className="glass home-leaderboard-access">
        <div>
          <p className="eyebrow">Quick Access</p>
          <h3>Jump to the latest leaderboard standings.</h3>
        </div>

        <div className="leaderboard-preview-grid">
          <article className="preview-tile">
            <p className="preview-label">Math Facts Sprint</p>
            <p className="preview-value">{loadingBoard ? 'Loading...' : factsPreview.value}</p>
            <p className="preview-name">{loadingBoard ? '' : factsPreview.detail}</p>
          </article>

          <article className="preview-tile">
            <p className="preview-label">Pi Memory Mode</p>
            <p className="preview-value">{loadingBoard ? 'Loading...' : piPreview.value}</p>
            <p className="preview-name">{loadingBoard ? '' : piPreview.detail}</p>
          </article>
        </div>

        <div className="button-row">
          <Link to="/leaderboard" className="button primary">
            View Full Leaderboards
          </Link>
        </div>
      </div>
    </section>
  );
}
