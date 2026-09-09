# 15 — Configuration and Decision Log

## 1. Các giá trị baseline cần config

### CEFR cumulative hours
- A1 90–100
- A2 180–200
- B1 350–400
- B2 500–600
- C1 700–800
- C2 1000–1200

### Efficiency baseline
- <=1h: 1.00
- 1–2h: 0.95
- 2–4h: 0.90
- 4–6h: 0.82
- 6–8h: 0.72
- 8–10h: 0.62
- >10h: 0.55

Đây là product heuristic, cần calibrate; không ghi là scientific CEFR standard.

### Default adherence
- 0.85 trước khi có actual data.

### Feasibility
- Comfortable >=130%
- Realistic 105–130%
- Aggressive 90–105%
- Very aggressive 70–90%
- Unlikely <70%

Cần config.

### Chat
- room code 8–12 chars.
- signaling polling 1–2s during discovery, backoff.
- join TTL 60–120s.
- SDP/ICE TTL 2–5m.
- soft room limit 8 users.
- message size giới hạn cần quyết định qua test.

## 2. Decision log

### D-001 Static/local-first
Accepted.
Không backend application DB.

### D-002 AI external bridge
Accepted.
No secret AI API key in client.

### D-003 Deterministic planner
Accepted.
AI không tính lại facts.

### D-004 IndexedDB
Accepted cho history/data lớn.

### D-005 P2P chat
Accepted.
Actual chat WebRTC.

### D-006 Google signaling
Accepted initial provider:
Google Apps Script + Google Sheet temporary events.

### D-007 No server chat history
Accepted.

### D-008 Avataaars
Accepted user avatar implementation, qua adapter.

### D-009 Chibi
Accepted anime-style chibi companion, local assets/state.

### D-010 Gamification
Accepted XP/Coin/Bond, quests, achievements, soft streak.

### D-011 Sharing
Accepted card/caption/link/Web Share/Facebook flow.

### D-012 No MVP cut
Accepted.
Implementation phases chỉ là dependency ordering.

## 3. Decisions còn mở cần agent không tự phán nếu ảnh hưởng lớn

- final visual design/theme;
- chibi asset ownership/source;
- Rive vs Lottie vs sprites;
- exact STUN/TURN provider;
- exact Google Sheet deployment/account;
- public resource catalog content;
- exact SRS algorithm (simple intervals → FSRS có thể quyết định sau);
- whether public room registry is enabled;
- whether recent-history peer sync is enabled;
- whether encrypted backup is required;
- public hosted share-page layer.

Nếu chưa quyết định, implement abstraction/fallback, không khóa architecture.

## 4. Quyết định tổng hợp tài liệu

### D-013 CEFR spec chính, Bootcamp phụ
Accepted theo yêu cầu tổng hợp tài liệu. Bootcamp là curriculum template có sẵn, không thay đổi kiến trúc hay planner facts. Xem [module 18](18_BOOTCAMP_CURRICULUM_INTEGRATION.md).

### D-014 Chuẩn hóa preset Bootcamp
Mẫu nguồn có 750 phút; bản tích hợp dùng 720 phút bằng cách giảm immersion còn 60 phút. Đây là cấu hình template trước sessionization, không phải giờ hiệu quả hoặc mặc định áp cho mọi người dùng.
