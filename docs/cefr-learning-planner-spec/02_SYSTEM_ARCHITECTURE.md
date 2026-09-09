# 02 — System Architecture

## 1. Kiến trúc tổng thể

Ứng dụng gồm 7 lớp logic:

1. **UI/Feature Layer**
2. **Core Planner Layer**
3. **Learning/Progress Layer**
4. **AI Bridge Layer**
5. **Gamification/Companion Layer**
6. **Social/P2P Layer**
7. **Persistence/Browser Capability Layer**

Core Planner không phụ thuộc AI, chat hay chibi.

## 2. Sơ đồ logic

User Input
→ Profile/Goal
→ Planner Engine
→ Feasibility + Scenarios
→ Scheduler
→ Fixed Slots
→ AI Prompt Generator
→ External AI
→ JSON Import/Validation
→ Curriculum Merge
→ Today/Study
→ Logs/Assessment
→ Replanner
→ Updated Future Plan

Song song:
- Study events → Gamification Engine → XP/quest/reward → Chibi reaction.
- Milestones → Sharing Engine → card/caption/link.
- Social tab → Signaling Provider → WebRTC peers → local chat history.

## 3. Module boundaries

### 3.1 Core
Chứa:
- CEFR model;
- hours model;
- feasibility;
- scenario optimizer;
- skill allocation;
- schedule generation;
- projection;
- replanning.

Không được import:
- React;
- browser APIs;
- AI vendor SDK;
- Google Apps Script;
- WebRTC;
- animation.

### 3.2 AI Bridge
Chứa:
- prompt builders;
- schema version;
- parser;
- validator;
- diff;
- merger;
- repair/replan context;
- provenance.

Không được tự tính lại planner facts.

### 3.3 Storage
Cung cấp repository abstraction:
- profile;
- goals;
- plans;
- logs;
- vocabulary;
- errors;
- chat;
- gamification;
- settings;
- prompt history.

Storage backend:
- localStorage;
- IndexedDB.

### 3.4 Browser capabilities
Mỗi API browser phải qua adapter:
- clipboard;
- share;
- notifications;
- wake lock;
- microphone;
- speech synthesis/recognition;
- file export/import;
- service worker;
- online/offline state.

UI phải hỏi capability trước khi render hành động.

### 3.5 Gamification
Nhận domain events:
- SESSION_COMPLETED;
- REVIEW_COMPLETED;
- ASSESSMENT_COMPLETED;
- WEEK_COMPLETED;
- MILESTONE_REACHED;
- COMEBACK;
- QUEST_COMPLETED.

Trả:
- XP delta;
- coin delta;
- bond delta;
- unlocks;
- notifications;
- chibi reaction event.

### 3.6 Chibi
Chỉ nhận high-level events; không đọc trực tiếp DB.
State:
- emotion;
- pose;
- outfit;
- dialogue;
- animation;
- audio setting.

### 3.7 Social
Tách:
- Room/Peer domain;
- SignalingProvider;
- WebRTCMesh;
- ChatProtocol;
- ChatRepository;
- Presence;
- LocalModeration.

Provider đầu tiên:
- GoogleAppsScriptSignaling.

## 4. Deployment architecture

Frontend:
- static build;
- HTTPS bắt buộc cho nhiều Web APIs;
- có thể host GitHub Pages/Cloudflare Pages/Netlify/Vercel/S3.

Signaling:
- Google Apps Script Web App.
- Google Sheet tạm làm event store/discovery registry.
- không phải application backend chính.

P2P:
- WebRTC DataChannel.
- STUN/TURN phải là cấu hình triển khai riêng.
- không hard-code phụ thuộc vào public STUN/TURN không được phép sử dụng.

## 5. Offline strategy

Offline được:
- profile;
- planner;
- schedule;
- roadmap đã import;
- Today;
- timer;
- logs;
- vocabulary;
- error notebook;
- gamification;
- chibi;
- history chat cũ;
- export dữ liệu;
- tài nguyên static/cache.

Cần online:
- mở tài nguyên web;
- external AI;
- signaling;
- P2P chat;
- resource verification;
- Facebook/share target internet.

## 6. Versioning

Phải version hóa:
- app data schema;
- backup schema;
- AI contract;
- chat protocol;
- signaling event schema;
- resource catalog;
- gamification balance config.

Mỗi version thay đổi breaking phải có migration hoặc fallback rõ.

## 7. Event-driven architecture nội bộ

Khuyến nghị dùng domain events để tránh coupling.

Event điển hình:
- PLAN_CREATED
- PLAN_IMPORTED
- DAY_STARTED
- SESSION_STARTED
- SESSION_PAUSED
- SESSION_COMPLETED
- SESSION_SKIPPED
- REVIEW_DUE
- REVIEW_COMPLETED
- ASSESSMENT_RECORDED
- WEEK_REVIEW_READY
- PLAN_RECALCULATED
- MILESTONE_REACHED
- ACHIEVEMENT_UNLOCKED
- ROOM_JOINED
- CHAT_MESSAGE_RECEIVED
- PEER_LEFT

Một event có thể kích hoạt:
- persistence;
- progress update;
- gamification;
- chibi;
- notification;
nhưng core feature không gọi trực tiếp nhau.

