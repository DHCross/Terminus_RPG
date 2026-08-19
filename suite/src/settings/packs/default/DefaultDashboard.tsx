import { Sparkles } from 'lucide-react';
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
            here. Choose a Setting Pack from the switcher in the header to load a world.
          </p>
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
