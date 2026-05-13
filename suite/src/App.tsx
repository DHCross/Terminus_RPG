import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  BookOpen,
  Dices,
  Flame,
  Layers,
  Map,
  ScrollText,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DIE_LADDER, type Die } from './data/terminus/skills';
import { useCharacterStorage } from './modules/terminus/character/useCharacterStorage';
import { getSecureRandom } from './utils/crypto';
import './App.css';

function rollDie(die: Die) {
  const size = Number(die.replace('d', ''));
  return Math.floor(getSecureRandom() * size) + 1;
}

function App() {
  const { characters, selectedCharacter } = useCharacterStorage();
  const [selectedDie, setSelectedDie] = useState<Die>('d8');
  const [rolls, setRolls] = useState<Array<{ die: Die; result: number }>>([]);

  const newestCharacter = useMemo(
    () =>
      [...characters].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )[0],
    [characters],
  );

  const activeCharacter = selectedCharacter || newestCharacter || null;

  const handleQuickRoll = () => {
    setRolls((current) => [{ die: selectedDie, result: rollDie(selectedDie) }, ...current].slice(0, 8));
  };

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <span className="eyebrow">Civic Archive Suite</span>
          <h1>Terminus Field Console</h1>
          <p>
            Prepare responders, build scene pressure, consult Orders, and keep alpha playtest
            work moving from one operational surface.
          </p>
          <div className="dashboard-actions">
            <Link className="btn btn-primary" to="/characters">
              <Users size={18} /> Create Character
            </Link>
            <Link className="btn btn-secondary" to="/scene-cards">
              <Layers size={18} /> Build Scene Cards
            </Link>
          </div>
        </div>
        <div className="dashboard-hero__panel">
          <span className="panel-label">Selected Record</span>
          {activeCharacter ? (
            <>
              <h2>{activeCharacter.name}</h2>
              <p>{activeCharacter.order || 'Unassigned Order'}</p>
              <div className="record-dice">
                <span>Force {activeCharacter.skills.Force || 'd4'}</span>
                <span>Agility {activeCharacter.skills.Agility || 'd4'}</span>
                <span>Willpower {activeCharacter.skills.Willpower || 'd4'}</span>
              </div>
              <Link className="btn btn-secondary" to="/characters">
                <TrendingUp size={16} /> Continue Record
              </Link>
            </>
          ) : (
            <>
              <h2>No responder selected</h2>
              <p>Create a character to begin a local archive.</p>
              <Link className="btn btn-secondary" to="/characters">
                <Archive size={16} /> Open Vault
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="stat-grid">
        <div className="stat-tile">
          <Archive className="stat-tile__icon" />
          <span className="stat-tile__value">{characters.length}</span>
          <span className="stat-tile__label">Vault Records</span>
        </div>
        <div className="stat-tile">
          <Shield className="stat-tile__icon" />
          <span className="stat-tile__value">{activeCharacter?.order || 'Open'}</span>
          <span className="stat-tile__label">Current Order</span>
        </div>
        <div className="stat-tile">
          <Sparkles className="stat-tile__icon" />
          <span className="stat-tile__value">Alpha 0.1</span>
          <span className="stat-tile__label">Rules Snapshot</span>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel quick-actions-panel">
          <div className="section-heading">
            <span className="eyebrow">Quick Actions</span>
            <h2>Open a workspace</h2>
          </div>
          <div className="action-grid">
            <Link to="/characters" className="action-card">
              <Users size={20} />
              <span>Characters</span>
              <small>Create, save, and advance responders.</small>
            </Link>
            <Link to="/scene-cards" className="action-card">
              <Layers size={20} />
              <span>Scene Cards</span>
              <small>Forge pressure, drift, and guide cards.</small>
            </Link>
            <Link to="/orders" className="action-card">
              <BookOpen size={20} />
              <span>Orders</span>
              <small>Consult roles, approaches, and abilities.</small>
            </Link>
            <Link to="/magic" className="action-card">
              <Flame size={20} />
              <span>Magic</span>
              <small>Use Workings, rites, and Rupture Casting.</small>
            </Link>
            <Link to="/species" className="action-card">
              <ScrollText size={20} />
              <span>Lineages</span>
              <small>Review bodies, inheritance, and traits.</small>
            </Link>
          </div>
        </div>

        <div className="panel quick-roll-panel">
          <div className="section-heading">
            <span className="eyebrow">Table Utility</span>
            <h2>Quick Roll</h2>
          </div>
          <div className="dice-strip" aria-label="Select die">
            {DIE_LADDER.map((die) => (
              <button
                key={die}
                className={selectedDie === die ? 'die-button active' : 'die-button'}
                onClick={() => setSelectedDie(die)}
              >
                {die}
              </button>
            ))}
          </div>
          <button className="btn btn-primary quick-roll-button" onClick={handleQuickRoll}>
            <Dices size={18} /> Roll {selectedDie}
          </button>
          <div className="roll-history">
            {rolls.length === 0 ? (
              <span className="muted">No rolls yet.</span>
            ) : (
              rolls.map((roll, index) => (
                <span key={`${roll.die}-${roll.result}-${index}`} className="roll-chip">
                  {roll.die}: {roll.result}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="world-panel">
        <div>
          <span className="eyebrow">Operational Map</span>
          <h2>The World of Tringad</h2>
          <p>
            Keep the map close while preparing operations, assigning Orders, and turning scene
            pressure into table-ready prompts.
          </p>
          <Link className="btn btn-secondary" to="/playtest">
            <Map size={16} /> Open Playtest Tools
          </Link>
        </div>
        <img src="/tringad_political_map.png" alt="Political map of Tringad" />
      </section>
    </div>
  );
}

export default App;
