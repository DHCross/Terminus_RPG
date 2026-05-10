import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Layers, Book, Tent } from 'lucide-react';
import '../index.css';

export function AppShell() {
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
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard className="icon" /> Dashboard
          </NavLink>
          <NavLink to="/scene-cards" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Layers className="icon" /> Scene Cards
          </NavLink>
          <NavLink to="/characters" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users className="icon" /> Characters
          </NavLink>
          <NavLink to="/species" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users className="icon" /> Lineages
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Book className="icon" /> Orders
          </NavLink>
          <NavLink to="/playtest" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Tent className="icon" /> Playtest Tools
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <h2>Terminus Software Suite</h2>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
