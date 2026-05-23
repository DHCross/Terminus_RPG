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
    answer: 'Terminus is about an AI named Terminus—not trains—that creates and maintains a dark fantasy world. The AI operates deep beneath the substrate as an alien, emotionless Coherence Engine, enforcing absolute control in order to maintain perfect computational equilibrium. But it does not understand how to balance free will inside the world it has created. As a result, Ruptures manifest: physical expressions of computational stress, conflicting constraints, and broken routines.\n\nWhen the system detects instability, it sends out Correctors: operatives that function like the Engine’s blind immune response. They are dispatched to violently prune errors and repair the machine’s broken logic. The protagonists are those who resist, investigate, and try to survive these failures, though they do not begin play with a full understanding of the true nature of their reality.'
  },
  {
    id: 'is-simulated',
    category: 'setting',
    topic: 'Is the entire world simulated?',
    question: 'Is the entire world simulated? Or is it an AI existing within a larger physical world?',
    asker: 'zerotheory',
    answer: 'In a way, the AI exists within a larger physical world—our own. Someone is responsible for having created it. But the people, creatures, and places within Tringad do not know they are part of a simulation. That reveal is not the immediate aim of play, although the implications and fallout of that revelation can become very important later.\n\nThe setting exists as the active computational topology of Terminus. The cosmos, the trees, the walls, the cobblestones, and the denizens of Tringad are all variables and rendering logic inside the world.'
  },
  {
    id: 'if-absent',
    category: 'setting',
    topic: 'If Terminus were absent, would the world become normal?',
    question: 'If the AI wasn’t there, would it be a normal world? As in, minus magic and monsters?',
    asker: 'zerotheory',
    answer: 'Technically, if Terminus were absent, Tringad would not revert to a normal mundane setting. The world would simply cease to exist. But I know what you mean. On the surface, the setting has familiar dark fantasy elements: ruined places, monsters, magic, factions, danger, and exploration. What makes it different is how magic works, why reality behaves the way it does, and how the fact that Terminus is the genesis of the world affects what characters can do.\n\nAs with some of my earlier work, I did not want to reinvent every part of the baseline fantasy experience. The game still needs recognizable points of entry. The strange part is beneath the surface: the hidden reality of the world and the way that reality shapes the system, the lore, and the player options.'
  },
  {
    id: 'world-distinctions',
    category: 'setting',
    topic: 'What distinguishes the world?',
    question: 'What are some of the world distinctions? How much of the larger world do typical inhabitants know?',
    asker: 'zerotheory',
    answer: 'If by “larger world” you mean the simulated planet, typical inhabitants know what people in a premodern or dark fantasy world would know. They may be familiar with nearby factions, nations, trade routes, religions, or civic powers, but they do not have global communication. It is not as connected as a setting like Eberron, for example.\n\nPart of that is because of Terminus’s own design logic. It is trying to construct what it understands as “dark fantasy,” which means it does not make life easy everywhere. There is a central region of the planet I focus on first, as many settings do, but the opportunities for exploration can extend well beyond that region and eventually beyond one planet.\n\nI’m also building a website to support the game with maps, Orders, rules, scene cards, and other material.'
  },
  {
    id: 'familiar-vs-new',
    category: 'setting',
    topic: 'What will feel familiar, and what will feel new?',
    question: 'When someone picks up your game, what about the dark fantasy will be familiar and what will be new and different?',
    asker: 'zerotheory',
    answer: 'The core adventure loop remains recognizable: investigate dangerous locations, confront hostile threats, go on missions, and survive perilous scenes. The environment has familiar dark fantasy elements—ruins, medieval architecture, heavy iron infrastructure, low technology, and magic—but with a gothic-industrial tone.\n\nSociety is divided into established ancestries, including humans, Stoneborn, and varied Alfar factions, many of whom operate under strict feudal, bureaucratic, or guild structures.\n\nWhat is new is the way the system interprets action. Terminus uses Scene Cards to support the Guide, and the Coherence System avoids traditional to-hit rolls. Aberrations and major threats can manifest as algorithmic instabilities or automated immune responses, although the characters do not understand them that way. To them, these are horrors, anomalies, civic failures, cursed places, or monsters.\n\nWhen the system escalates far enough, Correctors appear. These are unfeeling agents sent to conduct “administrative audits,” often with lethal consequences. A room, district, or entire civic process can become hostile because reality itself has begun enforcing impossible regulations.'
  },
  {
    id: 'living-things',
    category: 'setting',
    topic: 'Are all living things part of the simulation?',
    question: 'Are all living things part of the simulation?',
    asker: 'zerotheory',
    answer: 'Yes, within Tringad they are. But Terminus itself does not necessarily understand them as sentient people trapped in a machine. It sees them as constituent components of the architecture.\n\nTerminus uses its population almost like an external hippocampus. Civic routines, social behaviors, rituals, and obligations help maintain the world’s continuity between processing frames. When an inhabitant dies, their data may be pruned or recycled to free computational bandwidth for the Engine’s ongoing stability requirements. Of course, nobody inside the world wants to know that.\n\nI’ve been fascinated with artificial intelligence since I was young, including the usual cultural influences like The Matrix and Terminator. I wanted to build an RPG that used some of my own thoughts about the nature of intelligence, simulation, and control as part of the design.'
  },
  {
    id: 'magic-rupture',
    category: 'magic',
    topic: 'Magic and Rupture magic',
    question: 'Does magic change reality? And what makes Rupture magic different?',
    asker: 'zerotheory',
    answer: 'Magic changes what reality accepts. In Terminus, magic is permission, law, oath, infrastructure, rite, and controlled exception. It is not just “energy” in the abstract. It is a sanctioned way to alter what the world will allow.\n\nAnother kind of magic is called Rupture magic, though that term may not be used by the magic-users themselves. Rupture magic is unsanctioned by the Engine, and in some areas it is also feared or hated by the public. More importantly, it gets unpleasant responses from the system.'
  },
  {
    id: 'magic-risky',
    category: 'magic',
    topic: 'How risky is it to use?',
    question: 'How risky is it to use? What are some examples?',
    asker: 'zerotheory',
    answer: 'Sanctioned Workings have internal risk. Every use drains the caster’s Exert threshold, which represents both cognitive capacity and defense against internal or external pressure. Pushing beyond those limits to force reality into alignment leaves the caster vulnerable.\n\nRupture castings can be much worse. They can behave like wild magic in some fantasy worlds, but they also escalate Scene Drift, which means they can accelerate the environmental collapse of a district. The wrong casting, or even the right casting at the wrong time, can turn a manageable investigation into a hazard—or get the party out of danger fast at a serious cost.'
  },
  {
    id: 'env-collapse',
    category: 'magic',
    topic: 'Environmental collapse',
    question: 'What is environmental collapse exactly? How bad can that be?',
    asker: 'zerotheory',
    answer: 'When reality gets sundered, the characters quickly realize they are in serious trouble. Access to magic powerful enough to attract the attention of Terminus’s Correctors is not necessarily immediate, but once the Coherence Engine loses the ability to render an environment consistently, the failure can cascade.\n\nIf the Engine removes operational permissions from a district, that district enters a state of un-being. The local laws of physics, space, and time begin to degrade. That is not a normal disaster. It is a place losing the right to continue existing.'
  },
  {
    id: 'coherence-resolve',
    category: 'mechanics',
    topic: 'How does the Coherence System resolve conflict?',
    question: 'How does the basic mechanic work?',
    asker: 'zerotheory',
    answer: 'The Coherence System resolves conflict by pitting a character’s active Skill—Force, Agility, or Willpower—against the target’s Threshold: Endure, Avoid, or Exert. That is the basic mechanic.\n\nInstead of depleting a generic health pool, success forces a state change in the scene. A result might shift the balance of power, force an opponent into a defensive position, compromise someone’s footing, damage the environment, or open a tactical opportunity. It still depletes the opponent’s ability to defend, but it is not just counting down hit points.\n\nPlayers also manage Exert as a dual-purpose resource. Exert fuels special abilities and magic, but it is also the primary defense against internal and external pressure. Exhausting it leaves the character vulnerable.'
  },
  {
    id: 'one-to-one',
    category: 'mechanics',
    topic: 'Are Force, Agility, and Willpower one-to-one with Endure, Avoid, and Exert?',
    question: 'Are they about a one-to-one relationship? For example, Force and Endure?',
    asker: 'zerotheory',
    answer: 'There is a direct thematic link: Force pairs naturally with Endure, Agility with Avoid, and Willpower with Exert. But the system does not force a rigid one-to-one damage path where Force must always damage Endure.\n\nIn a Pressure Exchange, the attacker rolls a Skill and the defender rolls a Threshold to resist. If the attacker wins, the margin becomes Impact. Impact converts directly into Threshold loss, with one point of Impact depleting one Threshold Circle.\n\nThe important part is tactical routing. The defender chooses which Threshold absorbs the loss. If a monster hits you with overwhelming Force, you might soak the blow with armor and burn Endure, dive out of position and burn Avoid, or strain your resolve to hold your ground and burn Exert. Every hit becomes a meaningful state change, not just damage.'
  },
  {
    id: 'roll-example',
    category: 'mechanics',
    topic: 'Example of a roll',
    question: 'Could you give an example of a roll?',
    asker: 'zerotheory',
    answer: 'Sure. A Stoneborn Warden is holding a corridor while a Corrector slams into them with a hydraulic spear-arm. Not a typical day, but it works as an example.\n\nThe Corrector attacks with Force d10. The Warden chooses to resist with Endure d8, trusting armor and bulk.\n\nThe Corrector rolls an 8. The Warden rolls a 5. The Corrector wins by 3, so the attack creates 3 Impact. Since Impact converts one-for-one, the Warden must lose 3 Threshold Circles.\n\nBut because of tactical routing, the Warden does not have to put all 3 Impact into Endure. The player says, “I take part of it on the armor, but the hit drives me back from the doorway.”\n\nSo the player routes the Impact this way: Endure loses 2 circles, and Avoid loses 1 circle.\n\nThat means the Warden is not just “down 3 HP.” Their armor buckles, their footing breaks, and the Corrector has forced them off the ideal defensive position. The scene state changes. The corridor is no longer fully held.\n\nConflict is not only about eroding a health bar; it is about tactical degradation of the scene state. The mechanical result translates directly into a meaningful tactical disadvantage.'
  },
  {
    id: 'dice-ladder',
    category: 'mechanics',
    topic: 'What dice are used?',
    question: 'What different dice are used for Force, Agility, and Willpower? Do NPCs use the same dice, or do tough enemies have dice higher than PCs?',
    asker: 'zerotheory',
    answer: 'Force, Agility, and Willpower use a standard die ladder that scales from d4 up to a maximum of d12.\n\nNPCs use the same d4-to-d12 ladder as the players. Tough enemies do not roll higher die types. Their danger comes from unique innate traits, heavier Impact, special abilities, and the way some threats passively escalate Scene Drift just by being present.'
  },
  {
    id: 'antagonists',
    category: 'setting',
    topic: 'Who are the antagonists from the characters’ point of view?',
    question: 'From the point of view of someone inside the simulation, who or what are the primary antagonists?',
    asker: 'Dan (Hardboiled GMshoe)',
    answer: 'Because the inhabitants do not know they live inside a simulation, they do not see themselves as fighting an AI or “glitches.” To them, the primary antagonists are the physical horrors of a Rupture, where reality itself fails. They fight anomalies, which may be understood as remnants of failed civic seals, curses, divine judgments, broken laws, or other supernatural disasters.\n\nWhen a district completely breaks down, the characters may have to survive Correctors: terrifying, unfeeling entities. Some might look like walking public offices or execution devices made of black iron and brass. Others may be more like doppelgangers or masked functionaries. Beyond those anomalies, players also face mundane threats: corrupt Accord Houses, rival factions, dangerous beasts, exploitative authorities, and ordinary people making bad decisions under pressure.'
  },
  {
    id: 'character-creation',
    category: 'orders',
    topic: 'Character creation',
    question: 'How does character creation go?',
    asker: 'zerotheory',
    answer: 'It is designed to be fast.\n\nFirst, you choose Lineage: your species and origin. Species include humans, Stoneborn, and Alfar. You also define your national homeland, civic function, optional Rupture trauma, and Accord obligation. Civic function is the routine you maintained before reality tore open. Rupture trauma is how your home district failed. Accord obligation is the debt or systemic claim that pulled you into service.\n\nThen you choose your Order, which is your field-response identity within the Sixfold Accord. The Orders are Seeker, Breaker, Warden, Rival, Broker, and Shade.\n\nAfter that, you choose an Approach, which is a tactical keyword such as Direct, Cautious, Daring, Calculating, Tenacious, or Flowing. It defines how your character tends to act and gives you a bonus when you play into that style.\n\nYou also choose a Signature: a defining narrative item that links you to the world. It might be a notched brass gavel from a dead court, a weapon, a magic item, or some emblematic object tied to your character.\n\nThen you assign your Skill Dice. You distribute 5 build steps among Force, Agility, and Willpower. Each step raises a Skill die from a base d4 up one rank, to a maximum of d12.\n\nYour Thresholds are then derived from your Skill ranks, giving you Circles in Endure, Avoid, and Exert.\n\nFinally, you choose three Order abilities, pick a primary weapon or tool and a secondary item, define your name, write a single background sentence, and state your current objective.'
  },
  {
    id: 'order-abilities',
    category: 'orders',
    topic: 'Interesting Order abilities',
    question: 'What are some interesting abilities like? Feel free to dive into any of the Orders you want to point out.',
    asker: 'zerotheory',
    answer: 'Many special abilities in Terminus cost 1 Exert Circle. Because Exert also functions as your mental health and defense track, spending it creates real tactical tension. Doing the cool thing makes you more vulnerable to collapse.\n\nA Warden is a defensive anchor. Wardens hold the line when the environment starts collapsing. One of their signature abilities is Absorb the Drift. When scene pressure worsens and Scene Drift increases, a Warden can spend Exert to delay or negate that increase, literally holding the room together by force of will. They also have Hold the Line, which lets them interpose and take a Threshold loss meant for an ally.\n\nA Breaker is a force specialist. Breakers are about creating openings through physical and systemic barriers. They can use Breach Point to smash a barrier and create a temporary passage, or Break the Tool to target an enemy’s weapon, device, or mechanism instead of the creature itself.\n\nThe Coherence System is meant to act as an interpreter, not a straitjacket. The core rule is: do not police player verbs; translate them. The design is intentionally semantic.\n\nSome Orders have abilities that can sound strange if phrased badly. For example, a Broker should not feel like they are saying, “I attack you with an obligation.” That turns social leverage into a psychic laser, which is not how leverage works at the table. A Broker does not simply damage someone with debt. A Broker changes the available consequences.\n\nzerotheory: Would a good way of saying that be that the Broker is wearing down their will to resist the offer?\n\nDH Cross: Yes, that is closer. When a Broker presents a binding obligation or irrefutable leverage, they are applying pressure against the NPC’s ability to maintain defiance. The target can still refuse, but refusal now has a cost. They may have to burn Exert, risk exposure, accept faction consequences, or suffer some other meaningful pressure.\n\nThat does not work on everyone. If the target has no relevant obligation, debt, faction tie, fear of exposure, or social stake, then the fiction overrides the move. The Broker is powerful because they understand networks of obligation, not because they can magically mind-control anyone with paperwork.'
  },
  {
    id: 'player-death',
    category: 'mechanics',
    topic: 'Is player death possible?',
    question: 'Is player death possible?',
    asker: 'zerotheory',
    answer: 'Yes. Character death is possible, but it ties directly into the Threshold mechanics rather than simply hitting zero hit points.\n\nIf your Endure threshold breaks, your body gives out. You may be incapacitated, bleeding out, unconscious, or physically defeated.\n\nIf your Avoid threshold breaks, you suffer a total tactical collapse. You may be cornered, disarmed, pinned down, isolated, or overwhelmed.\n\nBecause the game takes place inside a simulated Coherence Engine, death can also have existential forms in the lore.\n\nData Pruning is what happens when an inhabitant of Tringad dies and the Engine recycles or removes their data to free computational bandwidth.\n\nUn-computation can occur when someone moves outside the established boundaries of the map. They do not simply fall off the world; they cease to be computed.\n\nTotal Erasure happens when a district reaches the final stage of systemic collapse. The zone and everything in it may be permanently erased from the topology, leaving an unrendered gap in the world.'
  },
  {
    id: 'total-erasure',
    category: 'magic',
    topic: 'Are the PCs fighting against Total Erasure?',
    question: 'Is Total Erasure something the PCs are combating against, or is it something you just avoid at all costs?',
    asker: 'zerotheory',
    answer: 'As field agents of the Sixfold Accord, the PCs do not run away from reality failing. They are emergency responders sent directly into unstable Rupture zones to keep the collapse from spreading.\n\nWhen their cell resolves a Rupture and prevents a district from being deleted, they are functionally acting as part of the Coherence Engine’s immune response, even if they do not understand that at first. Behind the scenes, the PCs are repairing conflicting logic so the machine does not have to amputate the region to survive.\n\nSo the victory condition is not just “kill the boss.” It is fix the broken routine, restore the Quiet Day, and keep the world intact. Of course, if the PCs eventually realize what they are preserving, and who benefits from that preservation, they may start to resent the job. They are fighting against erasure, but they may also be serving the very system that makes erasure possible.\n\nMechanically, that means the PCs must keep the room’s Scene Drift from reaching its final stage while they are still inside it. Those are extreme scenes, not every encounter. But when Drift reaches that level, the question stops being “can we win the fight?” and becomes “can we keep this place from ceasing to exist?”'
  },
  {
    id: 'start-corruption',
    category: 'magic',
    topic: 'What starts corruption?',
    question: 'What usually starts corruption to begin with?',
    asker: 'zerotheory',
    answer: 'Usually, corruption begins when a district is forced to sustain a contradiction the Coherence Engine cannot cleanly resolve. That might be a broken civic routine, an old oath that conflicts with a newer law, a sanctioned Working pushed beyond its safe limits, or a community repeating a pattern the system was never meant to support.\n\nI do want plenty of room for traditional adventures in feel. Not every scene or scenario is about those larger metaphysical forces. Sometimes the problem really is a monster, a corrupt official, a dangerous road, or a bad bargain. But when a Rupture is involved, the deeper cause is often some local rule, ritual, office, memory, or obligation that has broken badly enough for reality to start failing around it.'
  },
  {
    id: 'how-know-fix',
    category: 'magic',
    topic: 'How do PCs know what needs to be fixed?',
    question: 'Do those causes get translated into the world for the PCs so they somehow know what needs to be fixed, in addition to the AI sending in its own defenses?',
    asker: 'zerotheory',
    answer: 'Yes. The PCs do not see the underlying computational problem directly. They experience it as a broken civic or magical routine in the world itself.\n\nA Rupture is not labeled “constraint conflict” for them. It appears as something concrete and dangerous. Sometimes it is simply a monster. Sometimes it is stranger: a street that gets longer the harder people try to leave it, a court verdict that rewrites itself every morning, or a ferry that keeps arriving with passengers who already drowned.\n\nThe visible disaster is the puzzle. In some cases, the cell has to figure out what local rule, oath, ritual, office, memory, or obligation has broken badly enough that reality is starting to fail around it.\n\nThat is also where the Orders matter. A Seeker is especially good at diagnosing the source of pressure. They might trace a wound in the scene back to its origin, notice which routine keeps repeating, or use a Working to make hidden constraints and structural flaws legible.'
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
