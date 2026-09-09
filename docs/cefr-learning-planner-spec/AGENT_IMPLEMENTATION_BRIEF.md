# AI Agent Implementation Brief

Read all numbered specification files before implementation.

## Hard constraints

- Static/local-first application.
- No application backend database.
- No account requirement.
- Planner core deterministic and independent from AI.
- AI only enriches fixed schedule/curriculum through structured import.
- localStorage for small state; IndexedDB for histories.
- PWA/offline for local features.
- Gamification: XP + Coin + Bond + quests + achievements + soft streak.
- Chibi: anime chibi study companion with deterministic event/state system.
- Avatar: npm `avataaars`, random + manual selection, store config.
- Sharing: card/caption/page link/Web Share/Facebook flow; public data opt-in.
- Chat: WebRTC DataChannel; text + emoji; local history.
- Signaling/discovery: Google Apps Script + Google Sheet temporary events only.
- Do not store chat messages in Google Sheet.
- Small study rooms, mesh topology.
- Implement browser APIs through feature-detected adapters.
- Every persisted/AI/chat protocol schema versioned.
- Backup/restore required.
- No implementation phase is a cut-down MVP; complete all phases.

## Start order

1. architecture + domain + storage + events
2. planner engine/tests
3. planner UX
4. AI bridge
5. study execution/logs
6. adaptive engine
7. gamification
8. chibi
9. avatar/sharing
10. PWA/device features
11. P2P social
12. hardening/testing

## Stop conditions

If a requested change would:
- add persistent cloud backend;
- let AI override planner facts;
- upload chat history;
- expose private data by default;
- add an AI API secret to frontend;
agent must flag the architecture conflict rather than silently implement it.

## Existing bootcamp curriculum

Use this CEFR specification as the primary authority. Read [module 18](18_BOOTCAMP_CURRICULUM_INTEGRATION.md) before integrating the secondary `../c1-bootcamp-120-day/` materials. Reuse its 120-day curriculum and original starter content; let the local engine generate actual slots. Preserve source provenance, assessment evidence and existing user data. Do not inherit the legacy cloud-account proposal or the prompt that asks AI to invent a schedule.
