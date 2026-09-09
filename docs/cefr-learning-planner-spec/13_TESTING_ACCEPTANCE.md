# 13 — Testing and Acceptance Criteria

## 1. Testing layers

- Unit tests: core algorithms.
- Property tests: scheduler invariants.
- Integration: storage/AI import.
- Browser capability tests.
- E2E user flows.
- Cross-browser PWA.
- P2P multi-device tests.
- Manual usability.
- Performance.
- Data migration.
- Security validation.

## 2. Planner acceptance

Phải chứng minh:
- target <= current xử lý hợp lệ;
- partial current-level interpolation;
- leap A0→C2;
- deadline short/long;
- 0 availability;
- >10h/day;
- irregular ranges;
- timezone/daylight edge cases;
- recovery day;
- scenario ranking;
- deterministic same input same calculation.

## 3. Scheduler invariants

- no overlap;
- slot within availability;
- no negative duration;
- locked slot immutable;
- activity capacity respected;
- assessments preserved;
- carry-over rules;
- past complete slot không bị replan.

## 4. AI import acceptance

Cases:
- valid JSON;
- markdown fences;
- invalid JSON;
- wrong schema;
- wrong planId;
- stale hash;
- unknown slot;
- duplicate slot;
- duration overflow;
- unknown resource;
- malicious HTML;
- huge payload;
- missing sessions;
- partial import;
- repair prompt.

## 5. Storage acceptance

- reload persists;
- migration;
- backup restore;
- corrupted record;
- quota failure;
- clear module;
- IndexedDB unavailable fallback strategy;
- privacy export option.

## 6. Gamification acceptance

- no double reward;
- XP idempotent per completion event;
- quest reset correct timezone;
- streak freeze;
- minimum-day reduced reward;
- achievement one-time;
- config version balance migration.

## 7. Chibi acceptance

- correct event priority;
- no notification spam;
- reduced-motion;
- audio opt-in;
- missing asset fallback;
- minimal mode.

## 8. Sharing acceptance

- copy current URL;
- privacy preview;
- card generation;
- nickname excluded when unchecked;
- Web Share feature detection;
- download fallback;
- long share state rejected;
- safe decode.

## 9. Avatar acceptance

- random always renders;
- saved config reloads;
- malformed peer config fallback;
- package failure fallback;
- compatibility snapshot tests.

## 10. Chat acceptance

Test:
- same LAN;
- different networks;
- mobile↔desktop;
- 2 peers;
- 5–8 peers;
- NAT scenarios;
- signaling expiry;
- duplicated events;
- reconnect;
- peer leaves;
- message ordering;
- duplicate IDs;
- oversized message;
- block/mute;
- Apps Script quota/error behavior;
- TURN unavailable.

## 11. PWA/browser acceptance

- offline reload;
- service worker update;
- install;
- wake lock;
- notification denied;
- mic denied;
- share unavailable;
- clipboard unavailable;
- browser refresh during timer.

## 12. Performance targets

Agent phải đo, không chỉ đoán:
- initial load;
- bundle size;
- IndexedDB query latency;
- 10k logs;
- 50k chat messages local;
- share card render;
- chibi asset memory;
- 8-peer text room.

## 13. Definition of done

Một module chỉ done khi:
- behavior documented;
- tests pass;
- failure states UI có;
- persistence migration có nếu cần;
- accessibility cơ bản;
- no invariant violation;
- feature flag/capability fallback nếu phụ thuộc browser;
- acceptance cases liên quan đã chạy.

