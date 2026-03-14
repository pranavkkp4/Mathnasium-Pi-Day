import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SiteShell from './components/SiteShell.jsx';
import HomePage from './pages/HomePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import PlayPage from './pages/PlayPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';

export default function App() {
  return (
    <SiteShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </SiteShell>
  );
}
