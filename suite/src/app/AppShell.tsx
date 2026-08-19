import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useSettingPack, ALL_PACKS } from '../settings/SettingContext';
import '../index.css';

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [packMenuOpen, setPackMenuOpen] = useState(false);
  const { pack, packId, setPackId } = useSettingPack();
  const { branding, nav } = pack;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-lockup">
            {branding.crest && (
              <img
                className="brand-crest"
                src={branding.crest}
                alt={`${branding.title} crest`}
              />
            )}
            <div className="brand-copy">
              <h1>{branding.title}</h1>
              <p className="brand-subtitle">{branding.subtitle}</p>
              {branding.badge && <span className="badge">{branding.badge}</span>}
            </div>
          </div>
        </div>
        <nav className="nav-menu">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
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
          <h2>{branding.title} Software Suite</h2>

          <div className="pack-switcher">
            <button
              type="button"
              className="pack-switcher-button"
              onClick={() => setPackMenuOpen((open) => !open)}
              aria-expanded={packMenuOpen}
              aria-haspopup="menu"
              aria-label="Switch setting pack"
            >
              <span className="pack-switcher-genre">{pack.genre}</span>
              <ChevronDown size={16} />
            </button>
            {packMenuOpen && (
              <ul className="pack-switcher-menu" role="menu">
                {ALL_PACKS.map((candidate) => (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={candidate.id === packId}
                      className={
                        candidate.id === packId
                          ? 'pack-switcher-item active'
                          : 'pack-switcher-item'
                      }
                      onClick={() => {
                        setPackId(candidate.id);
                        setPackMenuOpen(false);
                      }}
                    >
                      <span className="pack-switcher-item-name">{candidate.name}</span>
                      <span className="pack-switcher-item-genre">{candidate.genre}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>
        <nav
          id="mobile-nav"
          className={mobileNavOpen ? 'mobile-nav open' : 'mobile-nav'}
          aria-label="Mobile navigation"
        >
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}
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
