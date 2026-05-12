import React, { useState } from 'react'
import sceneData from './data/scenes.json'

export default function App() {
  const [currentView, setCurrentView] = useState('scenarios') // 'dossier' or 'scenarios'
  const [printMode, setPrintMode] = useState(false)
  
  // Scenario State
  const [activeScenes, setActiveScenes] = useState(sceneData)
  const [selectedSceneId, setSelectedSceneId] = useState(sceneData[0]?.id || '')
  const [promptText, setPromptText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const activeScene = activeScenes.find(s => s.id === selectedSceneId)

  const togglePrintMode = () => setPrintMode(!printMode)
  const printSheet = () => window.print()

  // Mock AI Generation Logic using predefined templates for secondary sets
  const handleGenerateScene = () => {
    if (!promptText.trim()) return
    
    setIsGenerating(true)
    
    // Simulate AI processing time and deterministic rendering
    setTimeout(() => {
      // Pre-crafted high-quality options to extend the collection
      const expandedOptions = [
        {
          id: "records-05",
          title: "Hall of Quiet Records",
          location: "Tringad, Ministry Annex, Sublevel 3",
          ground: [
            "Endless shelves of magnetic spools coated in grey dust.",
            "Constant, unsettling click of failing drive units.",
            "Faint phosphorescent warnings in Old Tringad on the walls.",
            "A single archivist, head down, writing without pause."
          ],
          will: {
            NPCName: "Curator Mellis",
            Role": "Silent Archivist (Wild Card)",
            ActiveWill": "Wants to maintain the silence of the archive and protect coherence data from unauthorized viewing."
          },
          shift: [
            "IF a character speaks above a whisper → THEN automatic spheres activate and converge.",
            "IF a character presents a signed ministry seal → THEN Mellis blinks and unlocks the high-security aisle.",
            "IF a character steals a spool → THEN it emits a chime that corrupts all local data."
          ],
          drift: {
            rate": "Slow – records decay 1% per week, but actively speed up during interference.",
            consequence": "After 3 acts of theft/violence, a Null-Drag purge initiates, wiping all unsealed data."
          }
        },
        {
          id: "foundry-06",
          title: "The Fused Foundry",
          location: "Tringad, Sector 5 – Industrial Core",
          ground: [
            "Cauldrons of molten metal fed by organic, pulsing pipes.",
            "Twitching humanoid limbs embedded into mechanical housings.",
            "Intense heat tightening your skin; air tastes of copper.",
            "Rhythmic clang of a massive, automated forging hammer."
          ],
          will: {
            NPCName: "Master Kara",
            Role": "Chief Artificer (Patron)",
            ActiveWill": "Seeks raw biological tissue to stabilize a new hybrid engine and offers forge-access in return."
          },
          shift: [
            "IF a character offers living flesh → THEN Kara grants access to a fused weapon upgrade forge.",
            "IF a character sabotages the piping → THEN molten blood-metal sprays the room (2d6 fire damage).",
            "IF a character approaches the hammer → THEN a grafted slave screams a Pragma core warning."
          ],
          drift: {
            rate": "Rapid – heat increases 10°C per minute.",
            consequence": "If not vented in 15 minutes, all metal becomes red-hot, and a hybrid slave breaks free."
          }
        }
      ]

      // Try to pick one that isn't in active list yet
      const nextOption = expandedOptions.find(opt => !activeScenes.some(as => as.id === opt.id))
      
      if (nextOption) {
        const newScene = {
          ...nextOption,
          // Tweak slightly based on prompt to simulate interactivity
          title: promptText.length > 25 ? promptText.substring(0, 25) + " (Generated)" : nextOption.title
        }
        setActiveScenes([...activeScenes, newScene])
        setSelectedSceneId(newScene.id)
      } else {
        // Fallback if we exhaust our smart reservoir
        const fallbackScene = {
          id: `gen-${Date.now()}`,
          title: promptText || "Custom Sector Node",
          location: "Uncharted Tringad Quadrant",
          ground: [
            "Fragmented metallic debris scattered across cold flagstones.",
            "Low atmospheric hum vibrating in the floorboards.",
            "Shadows stretching away from an unknown luminescence."
          ],
          will: {
            NPCName: "Terminal Overseer",
            Role": "Construct (Hinderer)",
            ActiveWill": "Demands authorized clearing forms or immediate evacuation of the sector."
          },
          shift: [
            "IF a player hacks the terminal → THEN the static field drops for 1 minute.",
            "IF a weapon is unholstered → THEN red lighting activates and defenses arm."
          ],
          drift: {
            rate": "Steady Drift build.",
            consequence": "At state 4, the location triggers a containment field seal."
          }
        }
        setActiveScenes([...activeScenes, fallbackScene])
        setSelectedSceneId(fallbackScene.id)
      }

      setPromptText('')
      setIsGenerating(false)
    }, 1800)
  }

  return (
    <div className={printMode ? "print-mode" : ""}>
      {/* APP NAVIGATION */}
      <div className="nav-bar">
        <button 
          className={`nav-btn ${currentView === 'dossier' ? 'active' : ''}`}
          onClick={() => setCurrentView('dossier')}
        >
          Character Dossiers
        </button>
        <button 
          className={`nav-btn ${currentView === 'scenarios' ? 'active' : ''}`}
          onClick={() => setCurrentView('scenarios')}
        >
          Scenario Drafting Table
        </button>
      </div>

      {/* UTILITY CONTROLS */}
      <div className="controls">
        <button className="action-btn" onClick={togglePrintMode}>
          {printMode ? "View Digital" : "View Ink-Friendly"}
        </button>
        <button className="action-btn" onClick={printSheet}>
          Export PDF / Print
        </button>
      </div>

      <div className="view-container">
        {/* ----------------- DOSSIER VIEW ----------------- */}
        {currentView === 'dossier' && (
          <div className="dossier">
            <div className="header">
              {!printMode ? (
                <img 
                  src="/avatar.png" 
                  alt="Avatar" 
                  className="avatar" 
                />
              ) : (
                <div className="avatar-placeholder">PORTRAIT</div>
              )}
              <div className="title">
                <h1 contentEditable suppressContentEditableWarning>Elias Vance</h1>
                <h2 contentEditable suppressContentEditableWarning>Order: The Seekers</h2>
                <h2 contentEditable suppressContentEditableWarning>House: Third Transit</h2>
              </div>
            </div>

            <div className="thresholds">
              <div className="section-title">
                <span>Physical & Mental State</span>
                <span>STABLE</span>
              </div>
              
              <div className="threshold-row">
                <span className="threshold-name">ENDURE</span>
                <div className="circles">
                  <div className="circle filled"></div>
                  <div className="circle filled"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                </div>
              </div>

              <div className="threshold-row">
                <span className="threshold-name">AVOID</span>
                <div className="circles">
                  <div className="circle filled"></div>
                  <div className="circle filled"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                </div>
              </div>

              <div className="threshold-row">
                <span className="threshold-name" style={{color: printMode ? 'black' : '#ef4444'}}>EXERT (STRAIN)</span>
                <div className="circles">
                  <div className="circle exert filled"></div>
                  <div className="circle exert filled"></div>
                  <div className="circle exert filled"></div>
                  <div className="circle exert"></div>
                  <div className="circle exert"></div>
                </div>
              </div>
            </div>

            <div className="approaches">
              <div className="section-title">Action Approaches</div>
              
              <div className="approach-row">
                <span className="approach-name">Force</span>
                <span className="approach-die" contentEditable suppressContentEditableWarning>d6</span>
              </div>
              <div className="approach-row">
                <span className="approach-name">Precision</span>
                <span className="approach-die" contentEditable suppressContentEditableWarning>d8</span>
              </div>
              <div className="approach-row">
                <span className="approach-name">Willpower</span>
                <span className="approach-die" contentEditable suppressContentEditableWarning>d10</span>
              </div>
            </div>

            <div className="order-details">
              <div className="section-title">Authorizations & Signatures</div>
              <div className="tags">
                <span className="tag" contentEditable suppressContentEditableWarning>Expose (Sanctioned)</span>
                <span className="tag" contentEditable suppressContentEditableWarning>Structural Deduction</span>
                <span className="tag" style={{borderColor: '#ef4444'}} contentEditable suppressContentEditableWarning>Rupture Cast: Illegal</span>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- SCENARIOS VIEW ----------------- */}
        {currentView === 'scenarios' && (
          <div className="drafting-desk">
            
            {/* SIDEBAR GENERATOR */}
            <div className="desk-sidebar">
              <div className="generator-box">
                <h3>AI Scenario Generator</h3>
                <textarea 
                  className="prompt-input" 
                  placeholder="Describe a scene prompt... e.g., 'a dark archive', 'a corrupted foundry'"
                  rows="3"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  disabled={isGenerating}
                />
                <button 
                  className="action-btn" 
                  onClick={handleGenerateScene}
                  disabled={isGenerating || !promptText.trim()}
                >
                  {isGenerating ? "Analyzing..." : "GENERATE STATE"}
                </button>
              </div>

              <div className="generator-box">
                <h3>Active Matrix Nodes</h3>
                <div className="scene-list">
                  {activeScenes.map(scene => (
                    <button 
                      key={scene.id}
                      className={`scene-item ${selectedSceneId === scene.id ? 'active' : ''}`}
                      onClick={() => setSelectedSceneId(scene.id)}
                    >
                      {scene.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* GWSD RENDERING CARD */}
            <div style={{width: '100%', position: 'relative'}}>
              {isGenerating ? (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <div>INITIATING COHERENCE ENGINE...</div>
                  <div style={{fontSize: '0.7rem', opacity: 0.6}}>Constructing non-anathema structural parameters...</div>
                </div>
              ) : activeScene ? (
                <div className="gwsd-card">
                  <div className="gwsd-header">
                    <h1 contentEditable suppressContentEditableWarning>{activeScene.title}</h1>
                    <div className="gwsd-location" contentEditable suppressContentEditableWarning>{activeScene.location}</div>
                  </div>

                  {/* G - GROUND */}
                  <div className="gwsd-section">
                    <div className="gwsd-sec-title">
                      <span>[ G ] - GROUND</span>
                      <span>PHYSICAL STATE</span>
                    </div>
                    <div className="gwsd-sec-body">
                      <ul className="gwsd-list">
                        {activeScene.ground.map((g, idx) => (
                          <li key={idx} contentEditable suppressContentEditableWarning>{g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* W - WILL */}
                  <div className="gwsd-section">
                    <div className="gwsd-sec-title">
                      <span>[ W ] - WILL</span>
                      <span>NPC ANCHOR</span>
                    </div>
                    <div className="gwsd-sec-body">
                      <div>
                        <strong>Anchor:</strong> <span className="highlight-text" contentEditable suppressContentEditableWarning>{activeScene.will.NPCName} ({activeScene.will.Role})</span>
                      </div>
                      <div style={{marginTop: '8px'}}>
                        <strong>Active Intention:</strong> <span contentEditable suppressContentEditableWarning>{activeScene.will.ActiveWill}</span>
                      </div>
                    </div>
                  </div>

                  {/* S - SHIFT */}
                  <div className="gwsd-section">
                    <div className="gwsd-sec-title">
                      <span>[ S ] - SHIFT</span>
                      <span>IF/THEN DYNAMICS</span>
                    </div>
                    <div className="gwsd-sec-body">
                      {activeScene.shift.map((s, idx) => (
                        <div key={idx} className="shift-trigger" contentEditable suppressContentEditableWarning>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* D - DRIFT */}
                  <div className="gwsd-section" style={{borderColor: printMode ? 'black' : 'rgba(239, 68, 68, 0.4)'}}>
                    <div className="gwsd-sec-title" style={{background: printMode ? 'transparent' : 'rgba(239, 68, 68, 0.1)', color: printMode ? 'black' : '#ef4444', borderBottomColor: printMode ? 'black' : 'rgba(239, 68, 68, 0.4)'}}>
                      <span>[ D ] - DRIFT</span>
                      <span>ACCUMULATING PRESSURE</span>
                    </div>
                    <div className="gwsd-sec-body">
                      <div>
                        <strong>Rate of Decay:</strong> <span contentEditable suppressContentEditableWarning>{activeScene.drift.rate}</span>
                      </div>
                      <div style={{marginTop: '8px'}}>
                        <strong>Consequence:</strong> <span className="highlight-text" style={{color: printMode ? 'black' : '#ff6b6b'}} contentEditable suppressContentEditableWarning>{activeScene.drift.consequence}</span>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{textAlign: 'center', color: 'var(--text-dim)', padding: '40px'}}>
                  Select or Generate a Scene State Node to begin drafting.
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
