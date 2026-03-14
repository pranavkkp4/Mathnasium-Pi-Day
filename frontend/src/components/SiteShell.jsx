import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/history', label: 'History of π' },
  { to: '/play', label: 'Play' },
  { to: '/leaderboard', label: 'Leaderboards', prominent: true }
];

export default function SiteShell({ children }) {
  const logoSrc = `${import.meta.env.BASE_URL}mathnasium-logo.png`;

  return (
    <div className="site">
      <div className="bg-grid" />
      <header className="topbar">
        <div className="brand">
          <img src={logoSrc} alt="Mathnasium logo" className="brand-logo" />
          <div>
            <p className="eyebrow">Pi Day Event</p>
            <p className="brand-title">Mathnasium Pi Day Challenge</p>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link ${item.prominent ? 'nav-link-strong' : ''} ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="page-wrap">{children}</main>
    </div>
  );
}
