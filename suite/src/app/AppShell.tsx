import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Book, Flame, LayoutDashboard, Layers, Menu, Tent, Users, X } from 'lucide-react';
import '../index.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/scene-cards', label: 'Scene Cards', icon: Layers },
  { to: '/characters', label: 'Characters', icon: Users },
  { to: '/magic', label: 'Magic', icon: Flame },
  { to: '/species', label: 'Lineages', icon: Users },
  { to: '/orders', label: 'Orders', icon: Book },
  { to: '/playtest', label: 'Playtest Tools', icon: Tent },
];

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-lockup">
            <img
              className="brand-crest"
              src="/terminus-logo.svg"
              alt="Terminus crest"
            />
            <div className="brand-copy">
              <h1>Terminus RPG</h1>
              <p className="brand-subtitle">Civic Archive Suite</p>
              <span className="badge">Alpha 0.1</span>
            </div>
          </div>
        </div>
        <nav className="nav-menu">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              <Icon className="icon" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h2>Terminus Software Suite</h2>
        </header>
        <nav
          id="mobile-nav"
          className={mobileNavOpen ? 'mobile-nav open' : 'mobile-nav'}
          aria-label="Mobile navigation"
        >
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}
            >
              <Icon className="icon" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
