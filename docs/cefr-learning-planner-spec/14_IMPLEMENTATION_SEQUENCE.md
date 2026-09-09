# 14 — Implementation Sequence for AI Agent

## 1. Nguyên tắc

Đây không phải chia MVP.
Mỗi phase là thứ tự phụ thuộc để tiến dần tới mục tiêu hoàn chỉnh.
Không bỏ các module ở phần sau.

## 2. Phase A — Foundation

Agent triển khai:
- project shell;
- TypeScript strict;
- routing;
- design tokens;
- storage adapters;
- schema version;
- event bus/domain events;
- capability detection;
- backup baseline.

Exit:
- app static chạy;
- IndexedDB/localStorage ổn;
- migration framework;
- tests.

## 3. Phase B — Planner Core

- CEFR config;
- current-position;
- required range;
- availability;
- effective hours;
- feasibility;
- scenario optimizer;
- skill allocation;
- scheduler;
- phases;
- assessments;
- Minimum Viable Day;
- carry-over.

Exit:
- planner hoàn toàn dùng được offline không AI.

## 4. Phase C — Planner UX

- onboarding;
- goal editor;
- scenario comparison;
- roadmap;
- calendar;
- Today shell;
- settings.

Exit:
- user tạo plan và thấy lịch chi tiết.

## 5. Phase D — AI Bridge

- contract;
- canonical hash;
- prompt builder;
- prompt history;
- parser;
- validator;
- diff;
- import;
- partial import;
- repair;
- replan prompt.

Exit:
- AI bên ngoài có thể tạo nội dung và app import an toàn.

## 6. Phase E — Study Execution

- timer;
- wake lock;
- session steps;
- logs;
- ratings;
- vocabulary capture;
- error capture;
- assessment recording;
- daily brief.

## 7. Phase F — Adaptive Learning

- skill state;
- mastery;
- review debt;
- bottleneck;
- SRS;
- weekly review;
- projected proficiency evidence;
- adaptive replanning;
- updated AI future-plan flow.

## 8. Phase G — Gamification

- XP;
- coin;
- user level;
- bond;
- quests;
- streak;
- freeze;
- achievements;
- reward inventory;
- balance config.

Tất cả reward dùng domain events, không nhúng vào session UI logic.

## 9. Phase H — Chibi Companion

- state machine;
- dialogue;
- assets;
- reminders;
- reward presentation;
- cosmetics;
- bond unlock;
- audio optional;
- minimal/reduced-motion.

## 10. Phase I — Sharing and Avatar

- Avataaars adapter;
- random/customization;
- persistence;
- card renderer;
- privacy preview;
- copy links;
- captions;
- Web Share;
- Facebook flow.

## 11. Phase J — PWA and Device Integration

- service worker;
- offline resources;
- notifications;
- calendar export;
- mic;
- TTS;
- speech recognition optional;
- file import/export polish.

## 12. Phase K — Social P2P

- chat protocol;
- local repository;
- signaling provider abstraction;
- Google Apps Script/Sheet provider;
- room create/join;
- WebRTC DataChannel;
- peer profile/avatar;
- emoji;
- mesh;
- reconnect;
- mute/block;
- local history;
- errors/capability UI.

## 13. Phase L — Hardening

- migrations;
- large-data performance;
- security;
- cross-browser;
- multi-device;
- accessibility;
- restore;
- load test signaling;
- P2P NAT/TURN tests;
- docs/update.

## 14. Agent work style

Mỗi task:
1. đọc spec liên quan;
2. ghi assumptions nếu spec không quyết định;
3. không đổi invariant;
4. viết tests trước/sau core;
5. implement;
6. chạy acceptance subset;
7. cập nhật decision log nếu có thay đổi;
8. không tự mở rộng backend.

## 15. Ưu tiên khi có xung đột

Thứ tự:
1. user data safety/privacy;
2. planner determinism;
3. learning correctness;
4. reliability;
5. accessibility;
6. performance;
7. gamification polish;
8. visual effects.

## 16. Tích hợp giáo trình có sẵn

Bổ sung các đầu việc theo [module 18, mục 10–11](18_BOOTCAMP_CURRICULUM_INTEGRATION.md): curriculum schema, Day 0, template selector, mapping lịch, rubric/evidence và migration dữ liệu bootcamp. Giữ nguyên đầy đủ phase A–L.
