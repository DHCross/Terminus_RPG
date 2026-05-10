import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div
        className="hero-banner"
        style={{ backgroundImage: 'url(/recovered-art/terminus_hero_no_text_1778300537719.png)' }}
      >
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

      <div className="art-section">
        <h2>Field Archive Art</h2>
        <div className="art-grid">
          <figure className="art-card">
            <img
              src="/recovered-art/media__1778316491654.jpg"
              alt="Field dossier concept art"
              className="art-image"
            />
            <figcaption>Terminus Civic Record</figcaption>
          </figure>
          <figure className="art-card">
            <img
              src="/recovered-art/media__1778316064933.jpg"
              alt="Character record sheet concept art"
              className="art-image"
            />
            <figcaption>Seeker dossier plate</figcaption>
          </figure>
          <figure className="art-card">
            <img
              src="/recovered-art/terminus_sealed_instrument_ui_1778367791057.png"
              alt="Sealed instrument interface concept art"
              className="art-image"
            />
            <figcaption>Sealed instrument interface</figcaption>
          </figure>
        </div>
      </div>

      <div className="map-section">
        <h2>The World of Tringad</h2>
        <img
          src="/tringad_political_map.png"
          alt="Political map of Tringad"
          className="world-map"
        />
      </div>
    </div>
  );
}

export default App
