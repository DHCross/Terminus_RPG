import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="title">Terminus RPG Suite</h1>
          <p className="subtitle">Alpha 0.1 — Dark Fantasy Tabletop Tools</p>
          <div className="cta-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/characters')}>
              Create Character
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/scene-cards')}>
              Scene Cards
            </button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Character Builder</h3>
            <p>Create and manage characters with paired Skill/Threshold dice mechanics, species traits, and Order abilities.</p>
          </div>
          <div className="feature-card">
            <h3>Scene Cards</h3>
            <p>Generate GWSD scene cards with narrative diagnostics and redundancy detection for live Guide use.</p>
          </div>
          <div className="feature-card">
            <h3>Orders Reference</h3>
            <p>Browse all Orders with their approaches, signatures, and abilities for quick reference during play.</p>
          </div>
          <div className="feature-card">
            <h3>Lineages</h3>
            <p>Explore species options with their unique traits and characteristics for character creation.</p>
          </div>
          <div className="feature-card">
            <h3>Playtest Tools</h3>
            <p>Utilities for playtesting the Terminus alpha rules and tracking feedback.</p>
          </div>
          <div className="feature-card">
            <h3>Persistent Storage</h3>
            <p>Your characters and data are saved locally, so you can pick up where you left off.</p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>About Terminus</h2>
        <p>
          Terminus is a dark fantasy tabletop roleplaying game with high fantasy overtones.
          Characters are trained, marked, licensed, or forced to respond when stable reality begins to fail.
          The game is built around three linked ideas: routine stabilizes reality, rupture is systemic failure,
          and Orders exist because ordinary institutions cannot respond fast enough.
        </p>
        <p className="alpha-notice">
          This is an alpha release for playtesting. Rules and features may change as the system evolves.
        </p>
      </div>
    </div>
  );
}

export default App
