# Terminus RPG

A modern TRPG system with an interactive AI-powered character and campaign system.

**Terminus RPG** combines a tabletop RPG game system with an interactive web application and AI backend to support character generation, advancement tracking, and dynamic gameplay.

## Project Structure

### `/suite` — Interactive Web Application
The frontend React + TypeScript application for character creation, advancement, and campaign management.

**Technology**: Vite, React 18, TypeScript, Tailwind CSS

**Key Features**:
- Character generator with advancement tracking
- Interactive workbench for character management
- Real-time UI for game mechanics

**Getting Started**:
```bash
cd suite
npm install
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Build for production
npm run preview  # Preview production build
```

**Deployment**: Automatically deployed to Vercel from main branch. The repository-root `vercel.json` routes builds into `suite/`, and `suite/vercel.json` keeps suite-root deployments aligned with the same build script.

---

### `/Terminus` — Backend & System Service
Python-based backend service with Claude AI integration and macOS native launcher.

**Technology**: Python 3.11+, FastAPI/Flask, Claude API, Sapphire framework

**Purpose**:
- AI-powered chat and reasoning system
- Character and campaign continuity tracking
- Session memory and RAG (Retrieval-Augmented Generation)
- Native macOS launcher for local deployment

**Getting Started**:
```bash
cd Terminus
cp .env.example .env     # Configure API keys and paths
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python backend/main.py   # Start backend service
```

**Configuration**:
- `sapphire-config/` — Configuration files and credentials
- `sapphire-data/` — Runtime data, session history, and continuity
- `scripts/` — Utility scripts for launching and managing the system

---

### `/docs` — Documentation
All project documentation organized by category.

- **`/docs/game-design`** — Core game system design, rules, lore, and world-building
- **`/docs/development`** — Development progress notes, phase completions, and enhancement logs
- **`/docs/system`** — System administration and general project information

See [docs/README.md](docs/README.md) for detailed documentation guide.

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/DHCross/Terminus.git
cd "Terminus RPG"
```

### 2. Frontend Setup
```bash
cd suite
npm install
npm run dev
```
Open http://localhost:5173

### 3. Backend Setup
```bash
cd ../Terminus
cp .env.example .env
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python backend/main.py
```
Backend runs on http://localhost:8000 (or configured port)

---

## Project Conventions

### File Organization
- Game design and lore docs: `/docs/game-design`
- Development notes and progress: `/docs/development`
- Configuration and credentials: `Terminus/sapphire-config/`
- Runtime data and continuity: `Terminus/sapphire-data/`

### Technology Decisions
- **Frontend**: React + TypeScript for type safety and component reusability
- **Backend**: Python with Claude API for extensible AI reasoning
- **Build System**: Vite for fast development, Task CLI for native orchestration
- **Deployment**: Vercel (frontend), Native macOS or server deployment (backend)

### Development Workflow
1. Create feature branch for new work
2. Make changes in `suite/` for frontend, `Terminus/` for backend
3. Test independently before integration
4. Commit to feature branch, then PR to main
5. Frontend auto-deploys to Vercel on merge; backend requires manual deployment

---

## Deployment

### Frontend (Vercel)
The frontend deploys to Vercel from the repository, with the root `vercel.json` installing and building the app from `suite/`. If the Vercel project root is set directly to `suite/`, `suite/vercel.json` uses the same build script.

This keeps deployments working whether Vercel points at the repository root or at `suite/`.

### Backend
Backend deployment depends on your target environment:
- **Local/macOS**: Use `Terminus/scripts/start-terminus.sh` or desktop launcher
- **Server**: Package the Python backend and deploy to your server
- **Docker**: Use the provided Docker configuration if available

---

## Environment Configuration

Both frontend and backend require `.env` files:

- **suite/.env** — Frontend environment variables (API endpoints, feature flags)
- **Terminus/.env** — Backend environment variables (API keys, paths, database config)

Copy the `.example` files and update with your configuration:
```bash
cp suite/.env.example suite/.env
cp Terminus/.env.example Terminus/.env
```

---

## Contributing

When working on the project:

1. **Game Design Changes**: Update docs in `/docs/game-design` and commit with game design changes
2. **Development Notes**: Log progress in `/docs/development`
3. **Frontend Changes**: Work in `suite/`, run tests with `npm test`, deploy via Vercel
4. **Backend Changes**: Work in `Terminus/`, test with Python test files, document in development notes
5. **Documentation**: Maintain structure in `/docs`; see [docs/README.md](docs/README.md)

---

## License & Attribution

Terminus is a derivative project built on the [Sapphire](https://github.com/ddxfish/sapphire) framework. This repo contains Terminus-specific configuration, enhancements, and the RPG game system design.

See `Terminus/LICENSE` and `Terminus/NOTICE` for licensing details.

---

## Support & Questions

- **Game Design Questions**: See `/docs/game-design/TerminusRPG.md`
- **Development Setup**: See the Quick Start section above or individual README files in `suite/` and `Terminus/`
- **Issues**: Report bugs or feature requests via GitHub Issues

---

## Related Projects

- [Sapphire](https://github.com/ddxfish/sapphire) — Upstream framework
- [Vercel](https://vercel.com) — Frontend deployment platform
- [OpenAI Claude API](https://console.anthropic.com) — AI backend service
