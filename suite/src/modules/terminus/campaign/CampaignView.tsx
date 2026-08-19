import { useState, useMemo } from 'react';
import { Search, Flame, Shield, Dices, Sparkles, BookOpen, Layers, ExternalLink, HelpCircle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface QAItem {
  id: string;
  category: 'setting' | 'mechanics' | 'orders' | 'magic' | 'campaign';
  topic: string;
  question: string;
  asker: string;
  answer: string;
}

const QA_DATA: QAItem[] = [
  {
    id: 'intro',
    category: 'setting',
    topic: 'Introduction',
    question: 'Welcome, @DHCross! Please introduce yourself and your work.',
    asker: 'Host',
    answer: 'I’m DH Cross. I’m a game designer, musician, and longtime fan of tabletop roleplaying games. I’m the original creator of Eldritch RPG 2nd Edition and have worked on Gygaxian Fantasy Worlds material, including development and adaptation work for titles like World Builder and related fantasy reference projects. I recently launched a Kickstarter for my newest project, Terminus RPG: The Coherence System. I’ve also worked on titles for Black Void Games and W.R.K.S. Games, including Jordenheim.'
  },
  {
    id: 'what-is-terminus',
    category: 'setting',
    topic: 'What is Terminus about?',
    question: 'What is Terminus about?',
    asker: 'zerotheory',
    answer: 'Terminus is a dark fantasy roleplaying game about characters trained, licensed, or forced to respond when stable reality begins to fail.\n\nTringad is a rain-slicked city of cold brass, oxblood ink, and bone paper, and its paperwork is load-bearing. The Arch-Sumner’s bells sounding on rhythm, tollgates closing on the exact second, conscript-court scribes turning ledger pages in unison: no single one of them holds physical law in place. Together, repeated, they do. A missed bell is nothing. Enough of them over seasons, and the pattern stops resolving—and you get a Rupture: a street-porter caught in a repeating loop, a tollgate demanding a coin that hasn’t been minted yet, or a street that remembers a different city.\n\nYou play field responders from the licensed Orders—Seekers, Breakers, Wardens, Rivals, Brokers, and Shades—dispatched in mixed cells to pull the anomaly back inside tolerance. A Quiet Day isn’t a perfect day. It’s one the city can absorb.'
  },
  {
    id: 'is-simulated',
    category: 'setting',
    topic: 'How does the world hold itself together?',
    question: 'How does reality hold itself together in Tringad?',
    asker: 'zerotheory',
    answer: 'Reality in Tringad wants stability. Routine is cheap, predictability is efficient, and repetition keeps the world quiet.\n\nCivic habits—toll sequences, market awning schedules, and ledger entries—form stabilizing patterns. When healthy, the city absorbs thousands of small daily failures without cracking. A Rupture comes from accumulation: a ward where the bells have run wide for a winter, or a court whose records have drifted page by page. The pattern thins, and then it stops resolving.'
  },
  {
    id: 'if-absent',
    category: 'setting',
    topic: 'What is the role of the Orders?',
    question: 'Why do the Orders exist instead of ordinary town guards or soldiers?',
    asker: 'zerotheory',
    answer: 'The Orders are not formed to seek adventure. They exist because some failures cannot be handled by law, violence, money, prayer, or scholarship alone.\n\nWhen an anomaly cannot be stabilized by one method, multiple Orders are sent. A Seeker traces where the pattern broke; a Breaker forces an opening through a warded barrier; a Warden holds the collapsing crowd line; a Broker applies immediate social leverage to panic-stricken guilds. That is why player characters work together in mixed cells.'
  },
  {
    id: 'world-distinctions',
    category: 'setting',
    topic: 'What distinguishes the world?',
    question: 'What are some of the world distinctions? How much of the larger world do typical inhabitants know?',
    asker: 'zerotheory',
    answer: 'Tringad has the feel of a late-medieval, early-modern civic bureaucracy under severe metaphysical pressure. Typical inhabitants know their ward, their guild, their trade river, and the bells that mark their curfew. They are familiar with local factions, churches of the Old Offices, and the tollgates of the Sixfold Accord.\n\nIt is not steampunk or gaslamp—there are no trains, factories, or steam engines. It is cold brass, water-ferries, stone bridges, and hand-copied ledgers.'
  },
  {
    id: 'familiar-vs-new',
    category: 'setting',
    topic: 'What will feel familiar, and what will feel new?',
    question: 'When someone picks up your game, what about the dark fantasy will be familiar and what will be new and different?',
    asker: 'zerotheory',
    answer: 'The core adventure loop remains recognizable: investigate dangerous anomalies, confront hostile threats, negotiate with powerful factions, and survive perilous scenes. The environment has familiar dark fantasy weight—ruins, rain-soaked masonry, heavy iron gates, and ancient magic.\n\nWhat is new is the way the system interprets action. Terminus uses Scene Cards (Ground, Will, Shift, Drift) to support the Guide, and the Coherence System resolves conflict without to-hit rolls or hit point pools. When a situation breaks down, responders manage escalating Drift on the scene clock.'
  },
  {
    id: 'living-things',
    category: 'setting',
    topic: 'How do people live under this strain?',
    question: 'How do ordinary people live under this pressure?',
    asker: 'zerotheory',
    answer: 'When the world is healthy, people are allowed to be ordinary. They walk, eat, bargain, quarrel, read, sleep, and love without testing their thresholds. The air is light. The day proceeds.\n\nMost citizens trust the bells and pay their tolls without realizing that their collective routine is what holds physical law in place. Only when the bells desync and the streets begin repeating do ordinary citizens look to the licensed Orders to restore the quiet day.'
  },
  {
    id: 'magic-rupture',
    category: 'magic',
    topic: 'Magic and Rupture magic',
    question: 'Does magic change reality? And what makes Rupture casting different?',
    asker: 'zerotheory',
    answer: 'Magic in Terminus is built on Four Controlled Verbs: Seal, Expose, Bridge, and Nullify. It is permission, law, oath, and recognized authority.\n\nA Sanctioned Working costs Exert circles—the caster pays personal mental strain to keep the world quiet. Rupture Casting is a desperate override that costs 0 Exert, but takes its price out of the world instead, immediately escalating the scene’s Drift and triggering a secret Hostile Trace check from the Guide.'
  },
  {
    id: 'magic-risky',
    category: 'magic',
    topic: 'How risky is it to use?',
    question: 'How risky is it to use? What are some examples?',
    asker: 'zerotheory',
    answer: 'Sanctioned Workings have personal risk. Every use drains the caster’s Exert threshold, which represents inner reserve, concentration, and defense against strain. Exhausting Exert leaves the caster mentally defenseless.\n\nRupture castings are much more dangerous for the scene. They cost 0 Exert, but every cast pushes Scene Drift up by +1 or +2. At high Drift, reality fractures rapidly, and Hostile Trace rolls mean unexpected horrors or rival enforcers arrive.'
  },
  {
    id: 'env-collapse',
    category: 'magic',
    topic: 'Environmental collapse',
    question: 'What is a Rupture cascade exactly? How bad can that be?',
    asker: 'zerotheory',
    answer: 'When routine fails completely, a district enters a Rupture cascade. Time and geography become inconsistent: steps repeat in endless loops, doors open into different seasons, and tollgates demand unminted currency.\n\nIf responders cannot contain the anomaly, the district must be physically cordoned off by Wardens and closed from civic registers.'
  },
  {
    id: 'coherence-resolve',
    category: 'mechanics',
    topic: 'How does the Coherence System resolve conflict?',
    question: 'How does the basic mechanic work?',
    asker: 'zerotheory',
    answer: 'The Coherence System resolves conflict through the Core Exchange: the acting side rolls an Action Skill (Force, Agility, or Willpower) against the defender’s chosen Threshold (Endure, Avoid, or Exert).\n\nThere are no to-hit rolls and no passive armor class. Higher roll takes control of the exchange. The losing side routes the consequence through their chosen Threshold, marking off limited Threshold Circles based on the weapon\'s Impact and Vectors.'
  },
  {
    id: 'one-to-one',
    category: 'mechanics',
    topic: 'Are Force, Agility, and Willpower one-to-one with Endure, Avoid, and Exert?',
    question: 'Are they about a one-to-one relationship? For example, Force and Endure?',
    asker: 'zerotheory',
    answer: 'There is a natural link: Force pairs with Endure, Agility with Avoid, and Willpower with Exert. But the defender chooses how to answer based on the fiction.\n\nYou can answer a Force attack with Avoid (slipping away before impact) or Exert (bracing through sheer psychic resolve). If you lose control, you mark Threshold circles from the resisting stat you committed.'
  },
  {
    id: 'roll-example',
    category: 'mechanics',
    topic: 'Example of a roll',
    question: 'Could you give an example of a roll?',
    asker: 'zerotheory',
    answer: 'Sure. A Stoneborn Warden is holding a breach while an anomaly strikes with an iron flail.\n\nThe attacker rolls Force (d10) and gets an 8. The Warden chooses to resist with Endure (d8), trusting heavy plate and bulk, and rolls a 5.\n\nThe attacker takes control. The flail has Impact 3 and the "breaks protection" vector. The Warden marks off Endure circles to absorb the blow. Because Endure circles are limited (derived from Force), taking heavy hits forces the Warden to reposition or call for help before their Threshold breaks.'
  },
  {
    id: 'dice-ladder',
    category: 'mechanics',
    topic: 'What dice are used?',
    question: 'What different dice are used for Force, Agility, and Willpower? Do NPCs use the same dice, or do tough enemies have dice higher than PCs?',
    asker: 'zerotheory',
    answer: 'Force, Agility, and Willpower use the standard die ladder from d4 up to d12.\n\nThreshold Circles are derived directly from the die rank: d4 gives 1 circle, d6 gives 2, d8 gives 3, d10 gives 4, and d12 gives 5 circles.\n\nNPCs use the same die ladder. Tough monsters are dangerous because of heavy Impact, lethal Vectors, and abilities that escalate Scene Drift.'
  },
  {
    id: 'antagonists',
    category: 'setting',
    topic: 'Who are the antagonists from the characters’ point of view?',
    question: 'From the point of view of the characters, who or what are the primary antagonists?',
    asker: 'Dan (Hardboiled GMshoe)',
    answer: 'The primary antagonists are the physical horrors of a Rupture: looping anomalies, fractured beasts, rogue cults exploiting the desync, and corrupt guild masters who let routines slip for profit.\n\nBeyond anomalies, responders face rival cells, desperate factions, and the harsh realities of municipal politics in a rain-slicked city.'
  },
  {
    id: 'character-creation',
    category: 'orders',
    topic: 'Character creation',
    question: 'How does character creation go?',
    asker: 'zerotheory',
    answer: 'It is front-loaded and fast.\n\n1. Choose Species: Human, High Alfar, Deep Alfar, Wild Alfar, or Stoneborn.\n2. Choose Order: Seeker, Breaker, Warden, Rival, Broker, or Shade.\n3. Choose Approach: e.g. Reveal, Sever, Anchor, Bind, Slip, Challenge.\n4. Choose Signature: a defining item (lantern, seal, greatsword, contract case, mask).\n5. Assign Skill Dice: distribute 5 build steps among Force, Agility, and Willpower (starting at d4).\n6. Derive Thresholds: d4=1, d6=2, d8=3, d10=4, d12=5 circles.\n7. Choose 3 Order Abilities.\n8. Choose Equipment: primary weapon/tool (Impact & Vector), armor, and secondary gear.\n9. Name the character, add one sentence of background, and state one thing you will risk.'
  },
  {
    id: 'order-abilities',
    category: 'orders',
    topic: 'Interesting Order abilities',
    question: 'What are some interesting abilities like? Feel free to dive into any of the Orders you want to point out.',
    asker: 'zerotheory',
    answer: 'Order Abilities are permissions that bend the action grammar.\n\nA Warden has Hold the Line (interpose and take an ally’s Threshold loss) and Anchor Point (lock a doorway or boundary so nothing can cross).\n\nA Breaker has Breach Point (open a gap in any barrier) and Break the Tool (target enemy weapons and mechanisms instead of their body).\n\nA Seeker has Weak Point (name one way a target can be pressured) and Trace Source (discover the origin of any wound or anomaly).'
  },
  {
    id: 'player-death',
    category: 'mechanics',
    topic: 'Is player death possible?',
    question: 'Is player death possible?',
    asker: 'zerotheory',
    answer: 'Yes. When Threshold circles run out, characters suffer severe consequences:\n\n- If Endure breaks, your physical body gives out (incapacitated, bleeding out, crushed).\n- If Avoid breaks, you suffer total tactical collapse (cornered, pinned down, disarmed, cut off).\n- If Exert breaks, you suffer complete mental collapse (catatonic, panic-stricken, vulnerable to psychic trauma).\n\nConsequences are fiction-first and dangerous.'
  },
  {
    id: 'total-erasure',
    category: 'magic',
    topic: 'What is the victory condition for a cell?',
    question: 'What constitutes a victory for a responder cell?',
    asker: 'zerotheory',
    answer: 'Victory is restoring the Quiet Day: containing the Rupture, stabilizing the routine, bridging the gap, and keeping the district inside safe tolerance.\n\nResponders win not by grinding down generic HP pools, but by understanding what failed in the scene and applying the right Order leverage to set it true.'
  },
  {
    id: 'start-corruption',
    category: 'magic',
    topic: 'What starts a Rupture?',
    question: 'What usually starts a Rupture to begin with?',
    asker: 'zerotheory',
    answer: 'A Rupture begins when routine breaks down over time: a tollgate that has stuck every morning for months, bells that run a half-beat wide across a winter, or an ancient oath that has been ignored by three generations of magistrates.\n\nOne mistake is absorbed. Accumulated degradation is what causes the pattern to stop resolving.'
  },
  {
    id: 'how-know-fix',
    category: 'magic',
    topic: 'How do responders diagnose anomalies?',
    question: 'How do responders figure out what needs to be fixed?',
    asker: 'zerotheory',
    answer: 'They look for the broken pattern. A Seeker reads the repeated step; a Breaker tests the structural flaw; a Broker questions the ledger discrepancies; a Warden checks which boundary is leaking.\n\nThe anomaly is an active condition on the Scene Card (Ground, Will, Shift, Drift). The cell works together to shift the state back into balance.'
  },
  {
    id: 'outro',
    category: 'campaign',
    topic: 'Anything else before time runs out?',
    question: 'Time is almost up, and I feel like there is still a ton of untouched ground. Anything in particular you want to point out or discuss about the game that we did not get a chance to?',
    asker: 'zerotheory',
    answer: 'I launched the Terminus RPG campaign pretty quietly, without much fanfare or a long promotional runway. That means the campaign window is short, and I am doing more of the outreach in real time than I probably should have.\n\nBut the game is live now, the website is up, and I would genuinely appreciate people checking it out, reading through the material, and backing or sharing it if the premise grabs them.\n\nTerminus RPG: The Coherence System is a dark fantasy tabletop RPG of dice and cards, where a hidden fictional AI maintains reality through routine, law, and rupture.\n\nCampaign page: https://www.kickstarter.com/projects/terminusrpg/terminus-rpg-the-coherence-system'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: HelpCircle },
  { id: 'setting', label: 'Setting & Lore', icon: Sparkles },
  { id: 'mechanics', label: 'Conflict & Dice', icon: Dices },
  { id: 'orders', label: 'Character Orders', icon: Shield },
  { id: 'magic', label: 'Magic & Ruptures', icon: Flame },
  { id: 'campaign', label: 'Kickstarter Info', icon: BookOpen }
];

export function CampaignView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'what-is-terminus': true, // Keep main item open initially
    'outro': true // Keep campaign details open initially
  });

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredQA = useMemo(() => {
    return QA_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.topic.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="dashboard-page" style={{ padding: '2rem 1.5rem 4rem' }}>
      
      {/* ─── KICKSTARTER PROMOTIONAL BANNER ─── */}
      <section 
        className="panel" 
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          borderColor: 'rgba(251, 191, 36, 0.4)',
          borderWidth: '1px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
          padding: '2.5rem',
          borderRadius: '12px',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }} className="magic-bottom-grid">
          <div>
            <span className="eyebrow" style={{ color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} /> Active Crowdfunding Campaign
            </span>
            <h1 
              style={{ 
                fontFamily: 'EB Garamond, serif', 
                fontSize: '2.8rem', 
                margin: '0.5rem 0 1rem', 
                lineHeight: 1.1,
                fontWeight: 700
              }}
            >
              Terminus RPG: The Coherence System
            </h1>
            <p 
              style={{ 
                fontFamily: 'EB Garamond, serif', 
                fontSize: '1.2rem', 
                color: '#cbd5e1', 
                lineHeight: 1.6,
                maxWidth: '820px',
                margin: '0 0 1.5rem'
              }}
            >
              Back the alpha release on Kickstarter! Terminus is a premium dark fantasy tabletop roleplaying game where standard rules of reality fail as soon as civic routines break. Take the role of debt-bound, expert field operatives sent by the <strong>Sixfold Accord</strong> to restore physical and computational equilibrium before reality collapses completely.
            </p>
            
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', padding: '0.75rem 1.25rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rules Engine</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>Coherence System</div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', padding: '0.75rem 1.25rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interactive Platform</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>Playtest & Campaign Suite</div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', padding: '0.75rem 1.25rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Core</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>Skill vs Threshold ladder</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '240px' }}>
            <a 
              href="https://www.kickstarter.com/projects/terminusrpg/terminus-rpg-the-coherence-system" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary"
              style={{
                background: 'var(--color-accent)',
                color: '#0f172a',
                border: 'none',
                fontWeight: 700,
                fontSize: '1.05rem',
                padding: '1rem 1.75rem',
                borderRadius: '8px',
                textAlign: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(251, 191, 36, 0.25)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 25px rgba(251, 191, 36, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(251, 191, 36, 0.25)';
              }}
            >
              Back Campaign <ExternalLink size={16} />
            </a>
            
            <div 
              style={{ 
                fontSize: '0.78rem', 
                color: 'var(--color-text-muted)', 
                textAlign: 'center',
                fontFamily: 'JetBrains Mono, monospace',
                padding: '0.5rem',
                border: '1px dashed rgba(148, 163, 184, 0.2)',
                borderRadius: '6px'
              }}
            >
              Support DH Cross & back the Alpha release packet!
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE Q&A DISCORD TRANSCRIPT ─── */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h2>Discord Launch Q&A Explorer</h2>
        <p>Explore the complete launch transcript with game designer <strong>DH Cross</strong>, detailing the setting topology, paired skill ladders, rupture systems, and order permissions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }} className="reference-layout">
        
        {/* Left Side: Search and Category Tabs */}
        <div>
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--color-text-muted)' 
              }} 
            />
            <input 
              type="text" 
              placeholder="Search transcript..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {CATEGORIES.map(category => {
              const IconComponent = category.icon;
              const isActive = selectedCategory === category.id;
              const count = category.id === 'all' 
                ? QA_DATA.length 
                : QA_DATA.filter(item => item.category === category.id).length;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: `1px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : '#1e293b',
                    color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    fontWeight: isActive ? 600 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#1e293b';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <IconComponent size={16} style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                    {category.label}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '0.75rem', 
                      background: 'rgba(15, 23, 42, 0.5)', 
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '4px',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Q&A Accordion List */}
        <div>
          {filteredQA.length === 0 ? (
            <div className="empty-state" style={{ padding: '4rem 2rem' }}>
              <MessageSquare size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
              <h3>No Q&A entries match your criteria</h3>
              <p style={{ maxWidth: '400px', margin: '0.5rem auto 0' }}>Try searching for a different keyword or check under another category.</p>
              <button 
                className="btn btn-secondary" 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                style={{ marginTop: '1.25rem' }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  fontSize: '0.85rem', 
                  color: 'var(--color-text-muted)', 
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--color-border)' 
                }}
              >
                <span>Showing <strong>{filteredQA.length}</strong> items</span>
                <span>Select questions to expand structural details</span>
              </div>

              {filteredQA.map((item) => {
                const isOpen = !!expandedItems[item.id];
                return (
                  <div 
                    key={item.id}
                    className="panel"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      borderColor: isOpen ? 'rgba(59, 130, 246, 0.4)' : 'var(--color-border)',
                      backgroundColor: isOpen ? '#1e293b' : 'rgba(30, 41, 59, 0.4)',
                    }}
                  >
                    {/* Header: Question trigger */}
                    <button
                      onClick={() => toggleExpand(item.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '1.5rem',
                        padding: '1.25rem 1.5rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text)'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span 
                          style={{ 
                            fontSize: '0.68rem', 
                            color: 'var(--color-accent)', 
                            fontFamily: 'JetBrains Mono, monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            display: 'block',
                            marginBottom: '0.4rem'
                          }}
                        >
                          {item.topic}
                        </span>
                        <h3 style={{ fontSize: '1.1rem', margin: 0, fontFamily: 'EB Garamond, serif', fontWeight: 600, lineHeight: 1.35 }}>
                          {item.question}
                        </h3>
                      </div>
                      <span style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </button>

                    {/* Body: Answer block */}
                    {isOpen && (
                      <div 
                        style={{ 
                          padding: '0 1.5rem 1.5rem 1.5rem',
                          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                          animation: 'slideDown 0.2s ease-out'
                        }}
                      >
                        <div 
                          style={{ 
                            display: 'flex', 
                            gap: '0.75rem', 
                            alignItems: 'center', 
                            padding: '0.75rem 0',
                            fontSize: '0.78rem',
                            color: 'var(--color-text-muted)'
                          }}
                        >
                          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>Asked by:</span>
                          <span style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#cbd5e1' }}>@{item.asker}</span>
                          <span style={{ margin: '0 0.25rem' }}>•</span>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>Responder:</span>
                          <span style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--color-accent)', fontWeight: 600 }}>DH Cross (Creator)</span>
                        </div>

                        <div style={{ marginTop: '0.75rem' }}>
                          {item.answer.split('\n\n').map((paragraph, index) => (
                            <p 
                              key={index}
                              style={{ 
                                fontFamily: 'EB Garamond, serif',
                                fontSize: '1.08rem', 
                                color: '#cbd5e1', 
                                lineHeight: 1.6,
                                margin: index > 0 ? '1rem 0 0 0' : 0
                              }}
                            >
                              {/* Highlight key terms */}
                              {paragraph.split(/(Coherence Engine|Correctors|Rupture magic|Sixfold Accord|Scene Cards|Scene Drift|Exert|Endure|Avoid|Total Erasure|Data Pruning|Un-computation)/g).map((part, i) => {
                                const isHighlight = [
                                  'Coherence Engine', 'Correctors', 'Rupture magic', 'Sixfold Accord', 
                                  'Scene Cards', 'Scene Drift', 'Exert', 'Endure', 'Avoid', 
                                  'Total Erasure', 'Data Pruning', 'Un-computation'
                                ].includes(part);
                                return isHighlight ? (
                                  <strong key={i} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{part}</strong>
                                ) : part;
                              })}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
