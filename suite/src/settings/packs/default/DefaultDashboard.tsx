import { Link } from 'react-router-dom';
import { Sparkles, Users } from 'lucide-react';
import '../../../App.css';

function DefaultDashboard() {
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <span className="eyebrow">Genre-agnostic baseline</span>
          <h1>Coherence System</h1>
          <p>
            The Coherence System is a fiction-first tabletop engine built on paired Skill and
            Threshold dice, Scene Cards, and pressure-driven play. No setting flavor is applied
            here. The fillable field document lives in the vault — click a line, type, and it saves.
          </p>
          <div className="dashboard-actions">
            <Link className="btn btn-primary" to="/characters">
              <Users size={18} /> Character Vault
            </Link>
            <Link className="btn btn-secondary" to="/npcs">
              <Users size={18} /> NPC Vault
            </Link>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <div className="stat-tile">
          <Sparkles className="stat-tile__icon" />
          <span className="stat-tile__value">Coherence</span>
          <span className="stat-tile__label">Rules Engine</span>
        </div>
      </section>
    </div>
  );
}

export default DefaultDashboard;
