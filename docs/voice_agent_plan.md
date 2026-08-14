# Terminus Voice Agent — Outbound Medical Scheduling Plugin

**Date:** August 5, 2026  
**Author:** Daniel Cross / Terminus  
**Status:** Skeleton Draft

---

## Purpose

Build an outbound voice agent plugin for Terminus that can call medical offices on behalf of Daniel Cross to schedule, confirm, or follow up on appointments for family members. The agent speaks with clinic staff, relays patient context (diagnoses, medications, allergies, DOB), and logs the full call transcript back to Terminus.

---

## Family Profiles (Loaded at Runtime)

### Elizabeth H. Cross
- **DOB:** November 2, 1944
- **Allergies:** Penicillin, Sulfa drugs
- **Advance Directives:** Full Code
- **Key Diagnoses:**
  - Acute compression fractures (L2-L5), chronic (T12-L1)
  - Bladder prolapse with retention and overflow incontinence
  - Peripheral Vascular Disease (PVD), bilateral lower extremity edema
  - Severe malnutrition, chronic dysphagia — **ALL pills must be crushed**
  - Idiopathic neuropathy (nerve pain)
  - History of cellulitis
- **Medications:**
  - Amlodipine 10 mg (daily, crushed)
  - Gabapentin 100 mg (TID/Q8H, crushed)
  - Famotidine 20 mg (daily/BID, crushed)
  - Nitrofurantoin macrocrystal 100 mg (BID)
  - Potassium chloride 10 mEq (daily)
  - Calcium Carbonate 1250 mg/5 mL suspension (daily)
  - HYDROcodone-acetaminophen 5 mg-325 mg (PRN)
- **Call Notes:** All oral medications must be crushed. Dysphagia — aspiration risk.

---

### Richard S. Cross
- **DOB:** September 12, 1944
- **Allergies:** Sulfa (Sulfonamide Antibiotics), possible Penicillin
- **Key Diagnoses:**
  - AFib with Rapid Ventricular Response
  - Systolic heart failure (EF 40-45%)
  - Hypertension
  - Nodular liver / potential liver disease
  - Pre-diabetes (A1c 5.7%)
  - Scheuermann's Disease, double scoliosis
  - History of gout and arthritis
  - Paranoid delusions re: food/drink contamination; severe resistance to medical care
- **Medications:**
  - Metoprolol Succinate XL 25 mg (daily)
  - Lisinopril 2.5 mg (daily)
  - Aspirin 325 mg delayed-release (daily; documented clinical compromise for AFib)
  - Losartan 25 mg (daily)
  - Folic Acid 1 mg (daily)
  - Thiamine 100 mg (daily OTC)
  - Multivitamin (daily)
- **Call Notes:** Paranoid ideation may complicate proxy scheduling. Do not mention food or drink contamination in call context.

---

### Abigail (Abby) Lisa Cross
- **DOB:** January 3, 2006
- **Allergies:** None on file
- **Key Diagnoses:**
  - Autism Spectrum Disorder (Level 2)
  - Borderline Personality Disorder (BPD)
  - Dissociative and Conversion Disorders (F44.89)
  - ADHD (combined type)
  - PTSD
  - Generalized Anxiety Disorder, Major Depressive Disorder
  - Hyperinsulinemia, hyperandrogenism, acquired hypothyroidism, Hashimoto's disease
  - Pre-diabetes (A1c 6.1)
  - Reactive Airway Disease, GERD (without esophagitis)
- **Medications:**
  - Methylphenidate ER (36 mg / 54 mg)
  - Sertraline HCl (50 mg / 100 mg)
  - Levothyroxine (Tirosint-Sol) 100 mcg / 112 mcg
  - Metformin HCl ER 500 mg
  - Blisovi Fe 1-20
  - Hydroxyzine HCl 50 mg (PRN)
  - Loratadine 10 mg (daily)

---

## Architecture

```
Terminus Core
    │
    ├── plugins/voice_agent/
    │       ├── __init__.py          — plugin registration
    │       ├── profiles.py          — FamilyMember dataclasses + FAMILY_PROFILES dict
    │       ├── session_store.py     — CallSession lifecycle, transcript logging
    │       ├── bridge.py            — FastAPI router: /voice/health, /voice/incoming-call, /voice/ws
    │       └── call_trigger.py      — initiates outbound call via ElevenLabs API
    │
    └── tests/
            └── test_voice_loopback.py  — local WS loopback without live calls
```

### Data Flow

```
Dan: "Call Elizabeth's cardiologist"
    │
    ▼
call_trigger.py
    ├── Loads profile (elizabeth)
    ├── Creates CallSession
    └── POST → ElevenLabs /v1/convai/calls
                │
                ├── ElevenLabs dials clinic
                ├── Fires call.started webhook → /voice/incoming-call
                └── Opens WebSocket → /voice/ws?session_id=...
                            │
                            ├── transcript.final frames → append_turn()
                            ├── generate_response() → Terminus LLM [STUB]
                            └── response frames → ElevenLabs TTS → spoken to clinic
                                        │
                                        ▼
                                call.ended webhook → close_session(outcome)
```

---

## File Descriptions

### `profiles.py`
Defines the `FamilyMember` dataclass and the `FAMILY_PROFILES` dict keyed by lowercase name (`"elizabeth"`, `"richard"`, `"abby"`). Includes `get_profile(name)` and `profile_summary(member)` — the latter generates a compact spoken briefing injected before the first call turn.

### `session_store.py`
In-memory `CallSession` store (upgradeable to SQLite or Terminus KV). Tracks session ID, patient key, purpose, transcript turns, outcome, and status. Functions: `create_session`, `get_session`, `append_turn`, `close_session`.

### `bridge.py`
FastAPI router mounted at `/voice`. Four endpoints:
- `GET /voice/health` — sanity check
- `POST /voice/incoming-call` — ElevenLabs call lifecycle webhook (start/end)
- `GET /voice/ws` — real-time WebSocket relay for transcript turns and agent responses
- `generate_response()` — **live wire stub** — replace with Terminus inference call

### `call_trigger.py`
Fires an outbound call via `POST https://api.elevenlabs.io/v1/convai/calls`. Injects patient context and purpose into the ElevenLabs agent prompt override. Passes `webhook_url` and `ws_url` pointing back to the local bridge (requires public ingress).

### `tests/test_voice_loopback.py`
Simulates ElevenLabs sending `transcript.final` frames over WebSocket. No external calls or API keys required. Validates turn-taking logic and session logging locally.

---

## Environment Variables

| Variable | Description |
|---|---|
| `ELEVENLABS_API_KEY` | ElevenLabs API key (`sk-...`) |
| `ELEVENLABS_AGENT_ID` | Conversational AI agent resource ID |
| `TERMINUS_PUBLIC_URL` | Public-facing URL for webhooks (ngrok or ingress) |

---

## Plugin Registration

In Terminus app entry point, wherever routers are mounted:

```python
from plugins.voice_agent.bridge import router as voice_router
app.include_router(voice_router)
```

---

## Open Wire: `generate_response()`

The stub in `bridge.py` is the one live wire. It receives:
- `session` — full `CallSession` (patient key, purpose, transcript history)
- `user_text` — latest utterance from the clinic

It must return a string that ElevenLabs will speak. This is where Terminus inference connects. Options:
1. Direct LLM call with session context injected as system prompt
2. Terminus plugin message bus if inference is already routed through a central handler
3. Tool-augmented call (e.g., look up next available dates before responding)

---

## Next Steps

- [ ] Wire `generate_response()` to Terminus inference pathway
- [ ] Add SQLite persistence to `session_store.py` (replace in-memory dict)
- [ ] Build Terminus command: `"Call [patient] [purpose] at [number]"` → `call_trigger.initiate_call()`
- [ ] Add post-call summary generation (structured outcome + transcript saved to knowledge base)
- [ ] Test loopback with real WS client before first live call
- [ ] Confirm ElevenLabs Conversational AI outbound call API endpoint and payload shape against current docs
- [ ] Evaluate whether ngrok or a persistent tunnel is the right ingress approach for the webhook/WS URLs

---

## Authorization

Daniel Cross is the authorized representative for all three patients.  
When clinics ask for authorization, the agent states:  
**"Daniel Cross, son, authorized representative."**
