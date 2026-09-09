# MASTER SPEC — Local-first CEFR Learning Planner

> Bản hợp nhất gồm CEFR spec chính và quy tắc tích hợp giáo trình Bootcamp 120 ngày ở module 18. Nguồn chuẩn để duy trì là các file module riêng.


---

<!-- SOURCE: 00_README.md -->

# Local-first CEFR Learning Planner — Implementation Specification

## 1. Mục đích tài liệu

Bộ tài liệu này là đặc tả chức năng và kỹ thuật để một AI coding agent có thể triển khai ứng dụng học tiếng Anh theo CEFR từ đầu đến hoàn thiện mà không cần tự suy đoán lại kiến trúc.

Ứng dụng được định vị là:

> **Local-first Adaptive Language Learning Planner with AI-assisted curriculum, gamification, anime study companion, social sharing, and peer-to-peer study chat.**

Ứng dụng phải ưu tiên:
- chạy static;
- không cần tài khoản;
- không cần backend ứng dụng truyền thống;
- dữ liệu cá nhân nằm trên thiết bị người dùng;
- phần kế hoạch cốt lõi phải deterministic;
- AI là công cụ bổ sung nội dung, không phải nguồn sự thật cho toán học/lịch;
- chat thực tế đi ngang hàng qua WebRTC;
- Google Apps Script + Google Sheet chỉ đóng vai trò rendezvous/signaling cho chat;
- mọi feature cần hoạt động theo hướng progressive enhancement khi browser không hỗ trợ API tương ứng.

Bộ spec này là nguồn chính của dự án. Giáo trình `c1-bootcamp-120-day` là nguồn phụ, tích hợp thành mẫu học có sẵn theo [18 — Bootcamp Curriculum Integration](18_BOOTCAMP_CURRICULUM_INTEGRATION.md). Lịch 120 ngày là template có thể điều chỉnh, không thay thế local planner.

## 2. Công nghệ định hướng

Khuyến nghị:
- React + TypeScript.
- Vite hoặc công cụ build static tương đương.
- PWA + Service Worker.
- localStorage cho settings/profile/state nhỏ.
- IndexedDB cho dữ liệu lớn và lịch sử.
- Web Crypto API cho hash/encryption local.
- Clipboard API.
- Web Share API khi có.
- Canvas/SVG cho share card.
- Screen Wake Lock.
- Notifications khi khả dụng.
- MediaDevices/getUserMedia cho speaking recorder.
- Web Speech API nếu browser hỗ trợ; luôn có fallback.
- WebRTC `RTCDataChannel` cho chat P2P.
- Google Apps Script Web App + Google Sheet làm signaling/discovery.
- npm package `avataaars` cho avatar người dùng; bọc qua adapter để dễ thay package nếu cần.
- Chibi companion dùng sprite/PNG/WebP + state machine; có thể dùng Rive/Lottie cho animation nhưng không được khóa logic vào engine animation.

## 3. Những invariant không được phá

1. **Planner core chạy được hoàn toàn khi không có AI.**
2. **AI không được sửa required hours, deadline, slot ID, slot date/time, feasibility do local engine tính.**
3. **AI response phải được validate trước khi import.**
4. **Không nhúng API key bí mật vào static frontend.**
5. **Không gửi chat message lên Google Sheet.**
6. **Google signaling chỉ lưu event tạm thời, có TTL và cleanup.**
7. **Chat history lưu trên thiết bị từng người; user offline không nhận được message quá khứ nếu không có peer nào lưu/chuyển lại.**
8. **Không gọi chat là asynchronous cloud messenger.**
9. **Không giả định học đủ số giờ đồng nghĩa đạt CEFR; giờ chỉ là planning estimate.**
10. **Assessment/proficiency evidence phải tách khỏi study-hours progress.**
11. **Dữ liệu public/share phải do người dùng chủ động chọn.**
12. **Gamification không được khuyến khích gian lận timer hoặc học quá sức; reward phải gắn với completion, review và evidence.**
13. **Chibi companion không được dùng guilt/shame để ép học.**
14. **Mọi dữ liệu phải export/import được để backup.**
15. **Storage schema và AI schema đều phải version hóa.**

## 4. Cấu trúc tài liệu

- `01_PRODUCT_REQUIREMENTS.md`: mục tiêu sản phẩm, use cases và phạm vi hoàn chỉnh.
- `02_SYSTEM_ARCHITECTURE.md`: kiến trúc tổng thể và module boundaries.
- `03_DOMAIN_AND_STORAGE.md`: domain model, localStorage/IndexedDB, migrations.
- `04_PLANNER_ENGINE.md`: thuật toán CEFR, giờ học, feasibility, scheduling, replanning.
- `05_AI_BRIDGE_CONTRACT.md`: prompt generation, AI JSON contract, validation, repair/replan.
- `06_GAMIFICATION.md`: XP, coin, bond, quest, achievement, streak và anti-burnout.
- `07_CHIBI_COMPANION.md`: state machine, trigger, dialogue, cosmetics và reminder.
- `08_P2P_CHAT_SIGNALING.md`: WebRTC chat, room discovery, Google Apps Script/Sheet signaling.
- `09_SHARING_AND_AVATAR.md`: share link/card/Facebook, privacy và Avataaars.
- `10_RESOURCE_AND_BROWSER_FEATURES.md`: resource catalog, PWA, notification, mic, TTS, wake lock.
- `11_SECURITY_PRIVACY_RELIABILITY.md`: threat model, privacy, validation, abuse control.
- `12_UX_FLOWS_AND_STATES.md`: screens, flows, app states và empty/error states.
- `13_TESTING_ACCEPTANCE.md`: test matrix và acceptance criteria.
- `14_IMPLEMENTATION_SEQUENCE.md`: thứ tự agent triển khai đến bản hoàn chỉnh.
- `15_CONFIG_AND_DECISIONS.md`: cấu hình mặc định, decision log và điểm cần calibrate.
- `16_REFERENCES.md`: nguồn kỹ thuật và dữ liệu nền.
- `17_TECH_STACK.md`: stack, dependency policy và ranh giới kỹ thuật.
- `18_BOOTCAMP_CURRICULUM_INTEGRATION.md`: tổng hợp học liệu, lịch 120 ngày, quy tắc tích hợp và xử lý xung đột nguồn phụ.

## 5. Nguyên tắc làm việc của AI coding agent

Agent phải:
- đọc toàn bộ tài liệu trước khi thay đổi kiến trúc;
- coi invariant ở trên là bắt buộc;
- không tự thêm backend persistent nếu chưa có quyết định kiến trúc mới;
- giữ core planner và AI module độc lập;
- ưu tiên pure functions cho planner/gamification/replanning;
- tách browser capability qua adapter;
- tách signaling provider qua interface;
- tách avatar renderer qua interface;
- thiết kế schema migration ngay từ đầu;
- viết test cho thuật toán trước UI;
- dùng feature detection cho Web APIs;
- không hard-code tài nguyên online vào component UI;
- không dựa vào một vendor AI cụ thể.

## 6. Định nghĩa “hoàn thiện”

Ứng dụng được xem là hoàn thiện khi người dùng có thể:
1. khai báo trình độ, mục tiêu, deadline và quỹ thời gian;
2. nhận feasibility + scenario comparison;
3. sinh lịch local chi tiết;
4. tạo prompt để AI viết roadmap/curriculum rồi import JSON;
5. học theo Today/session timer;
6. theo dõi actual progress;
7. tự động điều chỉnh kế hoạch;
8. dùng vocabulary/error notebook/SRS;
9. nhận weekly review;
10. nhận XP/quest/reward/bond với chibi companion;
11. tùy biến avatar;
12. share progress/card/link;
13. tạo/join study room qua mã phòng và chat P2P;
14. lưu history local và backup/restore;
15. chạy PWA/offline cho phần không cần mạng;
16. degrade hợp lý khi browser thiếu capability.


---

<!-- SOURCE: 01_PRODUCT_REQUIREMENTS.md -->

# 01 — Product Requirements

## 1. Tầm nhìn sản phẩm

Ứng dụng giải quyết hai vấn đề:
1. người học không biết mục tiêu CEFR của mình có khả thi với thời gian thực tế hay không;
2. ngay cả khi có roadmap, họ thường không duy trì được việc học đủ lâu.

Sản phẩm kết hợp:
- planning khoa học;
- lịch học cụ thể;
- AI tạo curriculum;
- adaptive replanning;
- gamification;
- companion chibi;
- social sharing;
- study room P2P.

Không biến sản phẩm thành LMS nặng hoặc social network truyền thống.

## 2. Đối tượng người dùng

### 2.1 Người tự học
- biết sơ bộ level hiện tại;
- có deadline hoặc khoảng thời gian;
- muốn lịch cụ thể hàng ngày;
- có thể dùng ChatGPT/Claude/Gemini bên ngoài.

### 2.2 Người học cường độ cao
- muốn thử nhiều scenario;
- có thể học nhiều giờ/ngày;
- cần cảnh báo diminishing returns và burnout;
- muốn phân bổ theo thời gian rảnh thực tế.

### 2.3 Người học thiên về mục tiêu
- General English;
- Academic;
- Business;
- VSTEP-oriented;
- IELTS-oriented ở mức định hướng nội dung.
Core level model vẫn là CEFR trong phiên bản này.

## 3. Mục tiêu chức năng hoàn chỉnh

### 3.1 Onboarding/Profile
Người dùng có thể thiết lập:
- nickname;
- timezone;
- ngôn ngữ UI;
- avatar Avataaars;
- current CEFR;
- progress within current level;
- self-rated hoặc placement-based skill profile;
- preferred topics/domain;
- energy profile theo buổi;
- notification preference;
- chibi personality/style preference.

### 3.2 Goal setup
Người dùng chọn:
- current level;
- target level;
- target date hoặc duration;
- study days/week;
- total hours/day hoặc time ranges;
- priority/goal type;
- weak skills;
- intensity;
- preferred session length;
- recovery day;
- adherence expectation.

### 3.3 Planner
Ứng dụng hiển thị:
- required-hours range;
- expected required hours;
- scheduled hours;
- effective hours;
- coverage;
- feasibility class;
- projected level;
- recommended daily load;
- recommended deadline;
- scenario comparison;
- sensitivity/what-if view.

### 3.4 Schedule
Ứng dụng sinh:
- phases;
- weekly macro allocation;
- calendar days;
- fixed study slots;
- review slots;
- assessment slots;
- recovery/light slots;
- Minimum Viable Day plan.

### 3.5 AI Bridge
Ứng dụng:
- tạo Master Roadmap prompt;
- tạo weekly detail prompt;
- tạo repair prompt;
- tạo replan prompt;
- copy prompt;
- cho paste/file import AI JSON;
- validate;
- diff;
- partial import;
- lưu provenance và prompt history.

### 3.6 Learning execution
Today screen:
- daily brief;
- current priority;
- critical tasks;
- carry-over;
- minimum plan;
- session list;
- timer;
- wake lock;
- notes;
- completion rating.

### 3.7 Progress
Theo dõi:
- planned vs actual;
- adherence;
- effective hours;
- skill evidence;
- assessment score;
- bottlenecks;
- knowledge debt;
- error patterns;
- vocabulary review debt;
- weekly review.

### 3.8 Adaptive replanning
Khi người dùng:
- bỏ session;
- học ít hơn;
- học nhiều hơn;
- assessment thay đổi;
- skill yếu nổi lên;
- review debt cao;
engine phải có khả năng tạo lại phần còn lại mà không phá lịch đã hoàn thành.

### 3.9 Gamification
Có:
- XP;
- level;
- coin;
- bond;
- daily/weekly/milestone quests;
- achievements;
- cosmetics;
- share-card themes;
- soft streak;
- recovery quest;
- streak freeze;
- reward anti-cheat.

### 3.10 Chibi companion
Có:
- state machine;
- reminder;
- praise;
- milestone;
- comeback;
- worried/gentle alert;
- unlock cosmetics;
- optional TTS;
- user-selectable personality style.

### 3.11 Sharing
Có:
- copy current page link;
- copy shareable state link khi an toàn;
- copy caption;
- generate share image/card;
- Web Share khi khả dụng;
- open Facebook share flow;
- privacy selector.

### 3.12 P2P Study Room
Có:
- create room;
- join by room code;
- temporary discovery/signaling;
- P2P text messages;
- emoji reactions/basic emoji;
- presence;
- nickname/avatar exchange;
- local history;
- reconnect while room remains active;
- basic moderation controls ở phía local: mute/block/leave.

## 4. Các nguyên tắc UX

1. Planner không được “phán” người dùng thất bại; phải đưa lựa chọn điều chỉnh.
2. C1/C2 là level, không phải chứng chỉ cụ thể.
3. Feasibility luôn hiển thị uncertainty.
4. Không gây hiểu nhầm “500 giờ = B2 chắc chắn”.
5. AI-generated content phải có nhãn nguồn/provenance.
6. Những gì offline được phải dùng được offline.
7. Chibi và gamification có thể giảm/tắt nếu user thích giao diện nghiêm túc.
8. Chat là optional social module.
9. Không bắt user tạo account.
10. Backup phải nổi bật vì dữ liệu nằm local.

## 5. Non-goals

Không phải mục tiêu mặc định:
- cloud sync account;
- public social feed;
- public permanent chat history;
- backend chat archive;
- AI API tích hợp bằng khóa bí mật nằm client;
- voice/video call;
- large group chat hàng trăm người;
- full test certification;
- tuyên bố chính thức xác nhận CEFR;
- chống gian lận cấp thi cử.


---

<!-- SOURCE: 02_SYSTEM_ARCHITECTURE.md -->

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


---

<!-- SOURCE: 03_DOMAIN_AND_STORAGE.md -->

# 03 — Domain Model and Local Storage

## 1. Storage strategy

### localStorage
Chỉ lưu state nhỏ, đọc nhiều:
- app settings;
- active profile ID;
- profile nhỏ;
- active goal ID;
- UI preferences;
- chibi selection;
- avatar config;
- feature flags;
- storage schema version.

### IndexedDB
Lưu:
- goals/plans;
- study slots/sessions;
- study logs;
- assessments;
- vocabulary;
- error notebook;
- prompt/AI response history;
- achievements;
- chat rooms;
- chat messages;
- resource cache metadata;
- backups tạm.

Lý do:
- localStorage synchronous và giới hạn nhỏ;
- IndexedDB phù hợp object/data lớn và lịch sử.

## 2. Domain entities

### UserProfile
Các field khái niệm:
- profileId;
- nickname;
- timezone;
- locale;
- currentLevel;
- progressWithinLevel;
- skillProfile;
- preferredTopics;
- energyProfile;
- avatarConfig;
- chibiConfig;
- createdAt/updatedAt.

### LearningGoal
- goalId;
- currentLevel;
- targetLevel;
- targetDate;
- startDate;
- priority;
- intensity;
- adherenceTarget;
- availability;
- sessionPreference;
- weakSkills;
- status.

### Plan
- planId;
- goalId;
- inputHash;
- plannerVersion;
- AIContractVersion;
- createdAt;
- status;
- calculationSnapshot;
- phases;
- weeks;
- slots;
- importedAIArtifacts.

### ScheduleSlot
- slotId immutable;
- date;
- start/end;
- duration;
- slotClass;
- assignedSkill;
- locked flag;
- status.

Slot ID phải ổn định trong một plan version.

### SessionContent
- slotId;
- title;
- objectives;
- activities;
- resourceIds;
- expectedOutput;
- completionCriteria;
- AI provenance.

### StudyLog
- logId;
- slotId/sessionId;
- plannedMinutes;
- actualMinutes;
- completion;
- pauseCount;
- difficulty;
- confidence;
- focus;
- note;
- timestamps.

### Assessment
- assessmentId;
- type;
- date;
- skills;
- scores;
- evidence;
- source;
- confidence;
- notes.

### SkillState
Cho mỗi skill:
- planning level;
- evidence level;
- evidence confidence;
- trend;
- lastAssessment;
- bottleneckScore.

### TopicMastery
- topicId;
- skill;
- mastery value 0..1;
- exposure count;
- practice count;
- assessment evidence;
- nextReview.

### VocabularyItem
- itemId;
- term/phrase;
- meaning;
- examples;
- CEFR estimate;
- source;
- review state;
- tags;
- nextReviewAt.

### ErrorItem
- errorId;
- type;
- original;
- correction;
- explanation;
- count;
- firstSeen/lastSeen;
- reviewSchedule;
- status.

### GameProfile
- totalXP;
- userLevel;
- coins;
- bond;
- streakState;
- unlockedRewards;
- questProgress;
- achievementHistory.

### ChibiState
- companionId;
- personality;
- outfit;
- emotion;
- unlockedOutfits;
- unlockedDialogues;
- TTS setting.

### ChatRoomLocal
- roomId;
- roomCode;
- displayName/topic;
- createdAt;
- lastJoinedAt;
- localPeerId;
- knownPeers;
- mutedPeerIds;
- blockedPeerIds.

### ChatMessage
- messageId;
- roomId;
- senderPeerId;
- senderNicknameSnapshot;
- senderAvatarSnapshot/config;
- text;
- emoji/reaction;
- sentAt;
- receivedAt;
- status.
Không có server-delivered/read receipt bắt buộc.

## 3. Backup format

Backup phải chứa:
- schemaVersion;
- appVersion;
- exportedAt;
- profile;
- goals/plans;
- study data;
- vocab/errors;
- gamification;
- chibi/avatar;
- chat history nếu user chọn;
- settings.

Không mặc định export:
- transient signaling payload;
- temporary ICE/SDP;
- runtime WebRTC state.

## 4. Migration

Khi app mở:
1. đọc schemaVersion;
2. nếu thấp hơn current, chạy migration theo chuỗi;
3. mỗi migration idempotent hoặc transactional;
4. tạo backup snapshot trước migration lớn;
5. nếu fail, giữ dữ liệu gốc và hiển thị recovery.

Không được “clear local data” khi migration fail.

## 5. Data retention

Mặc định:
- study history: giữ vô hạn đến khi user xóa;
- chat history: giữ local, cho phép giới hạn theo room/size;
- signaling events: TTL vài phút;
- AI prompt history: có retention setting;
- microphone recording: không lưu mặc định trừ user chọn.

## 6. Hashing và identity

Plan input hash dùng để:
- phát hiện AI response cũ;
- detect stale imports;
- diff plan version.

Peer identity:
- local random ID;
- không dùng email/Google account;
- có thể rotate;
- nickname/avatar là self-declared.

## 7. Data export/import UX

Phải có:
- Export all;
- Export study only;
- Export chat optional;
- Import backup;
- Validate before import;
- Preview conflict;
- Replace/Merge policy;
- Clear data riêng từng module.


---

<!-- SOURCE: 04_PLANNER_ENGINE.md -->

# 04 — Planner Engine

## 1. Mục tiêu

Planner biến:
- current level;
- target;
- thời gian;
- availability;
- skill profile;
thành:
- required-hours estimate;
- feasibility;
- scenarios;
- phases;
- fixed study slots;
- weekly allocation;
- progress projection.

## 2. CEFR hours baseline

Dùng baseline cumulative guided-learning hours tham khảo từ Cambridge:
- A0: 0
- A1: 90–100
- A2: 180–200
- B1: 350–400
- B2: 500–600
- C1: 700–800
- C2: 1000–1200

Không coi đây là guarantee.
Trong engine nên lưu:
- min;
- midpoint;
- max;
- source metadata/version.

Expected midpoint:
- A1 95
- A2 190
- B1 375
- B2 550
- C1 750
- C2 1100

## 3. Current-position model

`progressWithinLevel` được định nghĩa là:
- 0 = vừa đạt level hiện tại;
- 1 = gần đạt level kế tiếp.

Current estimated cumulative hours:
- lấy midpoint level hiện tại;
- interpolate tới midpoint level kế tiếp;
- clamp 0..1.

Nếu có placement/assessment evidence đủ mạnh, có thể dùng evidence model để chỉnh current estimate, nhưng phải giữ trace nguồn.

## 4. Required-hours range

Không hiển thị một số duy nhất.

Tạo 3 estimate:
- optimistic;
- expected;
- conservative.

Expected = target midpoint - estimated current midpoint.

Optimistic/Conservative dùng min/max và/hoặc uncertainty factor.

UI phải nói rõ:
- “planning estimate”;
- không phải chứng nhận proficiency.

## 5. Availability model

Hỗ trợ hai input mode:

### Daily-total mode
- hours/day;
- days/week;
- optional preferred days.

### Time-range mode
Mỗi weekday có nhiều range:
- 06:00–08:00;
- 12:00–13:00;
- 20:00–22:00.

Time-range mode là nguồn tốt hơn cho scheduler.

## 6. Sessionization

Config:
- preferred session length;
- minimum session;
- break;
- max deep block.

Tạo 3 class:
- DEEP: 45–90m;
- NORMAL: 25–50m;
- LIGHT: 5–25m.

Không nhất thiết chia range cứng 50/10. Scheduler chọn theo activity class và energy profile.

## 7. Effective-hours model

Scheduled hour không bằng effective hour.

Cấu hình diminishing-return mặc định nên là calibration config, không hard-code khoa học chính thức.

Một baseline có thể bắt đầu:
- ≤1h/day: 1.00
- 1–2h: 0.95
- 2–4h: 0.90
- 4–6h: 0.82
- 6–8h: 0.72
- 8–10h: 0.62
- >10h: 0.55

Sau đó:
effective = scheduled × cognitiveEfficiency × adherenceFactor.

Hiển thị scheduled và effective riêng.

## 8. Adherence

Default ban đầu: khoảng 0.85 nếu user không chọn.

Sau khi có dữ liệu:
- rolling adherence 14/28 ngày;
- điều chỉnh forecast bằng actual adherence;
- không tự hạ target nếu user chưa đồng ý.

## 9. Feasibility

Coverage = effective available / required expected.

Baseline classification:
- >=1.30 Comfortable
- 1.05–1.30 Realistic
- 0.90–1.05 Aggressive
- 0.70–0.90 Very Aggressive
- <0.70 Unlikely

Các threshold phải config được.

UI luôn cung cấp ít nhất 3 hướng:
- giữ deadline, tăng giờ;
- giữ giờ, đổi deadline;
- giữ cả hai, giảm target/projected outcome.

## 10. Scenario optimizer

Engine thử grid khả thi:
- hours/day;
- days/week;
- session patterns;
- optional weekend boost;
- deadline shifts.

Mỗi scenario tính:
- effective hours;
- feasibility;
- intensity penalty;
- sustainability score;
- required adjustment.

Ranking objective:
1. tôn trọng constraint user;
2. đạt coverage mục tiêu;
3. minimize workload change;
4. minimize burnout risk;
5. giữ recovery day nếu có.

## 11. Skill allocation

Baseline weights theo goal type.
Sau đó điều chỉnh bởi:
- weak skill;
- assessment evidence;
- bottleneck;
- review debt;
- target exam orientation;
- recent progress.

Không để skill nào quan trọng về 0 trong thời gian dài.
Speaking và writing phải xuất hiện hàng tuần nếu target >= B1, trừ khi user chủ động tắt.

## 12. Bottleneck detection

Bottleneck score có thể dựa:
- CEFR/evidence gap;
- low assessment trend;
- low confidence;
- high error frequency;
- low mastery;
- missed sessions.

Primary bottleneck là skill có weighted deficit lớn nhất.

Planner tăng allocation có giới hạn để tránh over-correct.

## 13. Review debt

Mỗi vocab/error/topic có due state.
Knowledge debt:
- overdue review count hoặc weighted overdue score.

Nếu debt vượt threshold:
- giảm new material;
- tăng review slot;
- không thay assessment bắt buộc.

## 14. Minimum Viable Day

Mỗi ngày có 3 plan:
- Normal;
- Busy;
- Emergency.

Busy/Emergency giữ:
- review quan trọng;
- 1 core exposure;
- continuity.

Không award full XP như normal day.

## 15. Carry-over

Missed task phân loại:
- CRITICAL: assessment/milestone prerequisite → reschedule;
- REVIEW: merge vào review queue;
- CORE: reschedule nếu capacity;
- OPTIONAL/EXPOSURE: có thể drop;
- SOCIAL: không ảnh hưởng core.

Không cộng toàn bộ missed minutes vào ngày kế tiếp.

## 16. Phase generation

Phases dựa vào:
- CEFR boundaries;
- deadline;
- required effective hours;
- assessment checkpoints.

Ví dụ A2→C1:
- A2 consolidation/B1 transition;
- B1 development/B2 transition;
- B2 advanced/C1 transition;
- final consolidation/assessment.

Phase date local engine quyết định.

AI được điền learning goals và exit criteria nhưng không đổi date nếu date locked.

## 17. Assessment schedule

Local scheduler đặt:
- mini checkpoint mỗi 1–2 tuần tùy intensity;
- phase assessment;
- full checkpoint định kỳ.

Hours progress và proficiency evidence tách riêng.

## 18. Projection

Projected level không chỉ dựa hours sau khi đã có evidence.

Trước khi có evidence:
- hour-based projection với confidence thấp.

Sau khi có assessments:
- blend hours forecast + skill evidence.
- hiển thị confidence.

## 19. Adaptive replanning

Trigger:
- adherence lệch ngưỡng;
- >N missed sessions;
- assessment score change;
- bottleneck shift;
- review debt;
- availability changed;
- target changed.

Replanner:
1. khóa past/completed slots;
2. giữ immutable history;
3. lấy remaining required work;
4. recalibrate effective capacity;
5. regenerate future allocation;
6. preserve critical assessments nếu có;
7. tạo diff;
8. user apply;
9. nếu dùng AI curriculum, tạo replan prompt chỉ cho future slots.

## 20. Energy-aware scheduling

User tự chấm energy theo time segment.
Scheduler ưu tiên:
- high energy: writing, grammar, intensive listening;
- medium: reading, speaking;
- low: SRS, pronunciation, light exposure.

Đây là heuristic, user được override.

## 21. Giáo trình Bootcamp có sẵn

Áp dụng [module 18](18_BOOTCAMP_CURRICULUM_INTEGRATION.md) cho mẫu C1 Bootcamp: giữ thứ tự nội dung 120 ngày, tính lại lịch theo availability/evidence và phân biệt ngày nội dung với ngày lịch. Preset 12 giờ được chuẩn hóa tại module 18; mọi slot vẫn tuân thủ sessionization và feasibility của engine.


---

<!-- SOURCE: 05_AI_BRIDGE_CONTRACT.md -->

# 05 — AI Bridge and Contract

## 1. Triết lý

AI là external curriculum planner.
Ứng dụng không cần AI API key.
Flow:
- app tạo prompt;
- user copy sang ChatGPT/Claude/Gemini;
- AI trả JSON;
- user paste/import;
- app validate;
- app merge.

## 2. Những gì local engine gửi cho AI

Chỉ gửi dữ liệu cần:
- level/current progress;
- target;
- goal type;
- weak skills;
- preferred topics;
- feasibility snapshot;
- locked phases;
- fixed slots;
- verified resource catalog subset;
- recent learning summary;
- assessment summary;
- explicit output schema.

Không cần gửi:
- tên thật;
- email;
- toàn bộ chat;
- dữ liệu không liên quan.

## 3. Những gì AI được phép quyết định

- roadmap wording;
- learning objectives;
- topic sequencing trong bounds;
- activity composition;
- resource selection từ catalog;
- exercise instruction;
- weekly focus;
- milestone learning criteria;
- content cho fixed slots.

## 4. Những gì AI không được phép quyết định

- required hours;
- target date;
- feasibility;
- slot IDs;
- slot dates;
- slot times;
- duration locked;
- completed history;
- local assessment score;
- XP/reward;
- signaling/chat data.

## 5. AI contract package

Response package concept:
- schemaVersion;
- plannerVersion;
- planId;
- inputHash;
- generatedAt optional;
- provider/model optional user-entered;
- roadmap;
- weeks;
- sessions;
- assessments suggestions;
- resourceSuggestions optional;
- notes optional.

## 6. Input hash

App tạo SHA-256 của canonical planner input:
- goal;
- availability;
- slots;
- skill snapshot;
- relevant config version.

AI được yêu cầu echo `inputHash`.

Import:
- hash mismatch = stale response;
- user có thể xem nhưng không import trực tiếp;
- app sinh prompt mới hoặc explicit force import chỉ cho power-user, với warning.

## 7. Slot contract

Mỗi AI session phải reference một existing slotId.

Validator kiểm:
- slot tồn tại;
- không duplicate;
- activity total <= duration;
- skill hợp lệ;
- resource ID tồn tại hoặc đánh dấu unverified;
- required fields.

AI không được invent schedule.

## 8. Three-level prompt strategy

### Master Roadmap Prompt
Input:
- goal;
- phases;
- capacity;
- skill profile.
Output:
- goals;
- phase objectives;
- weekly strategy;
- assessment strategy.
Không cần hàng trăm session.

### Weekly Detail Prompt
Input:
- master roadmap summary;
- week context;
- tuần đó slots;
- relevant resources;
- current debt/error/vocab summary.
Output:
- session content cho fixed slots.

### Replan Prompt
Input:
- original plan summary;
- actual progress;
- remaining slots;
- changed bottleneck;
- fixed constraints.
Output:
- updated future curriculum only.

## 9. Repair prompt

Khi validation thấy:
- missing slot;
- unknown resource;
- duration overflow;
- invalid enum;
app tự tạo repair prompt chỉ chứa lỗi và phần cần sửa.

Không regenerate toàn bộ plan.

## 10. Partial import

Cho phép:
- import valid sessions;
- giữ invalid sessions pending;
- tạo repair queue.

Không để 1 lỗi phá 100 session tốt.

## 11. Diff before apply

Hiển thị:
- sessions added/changed/removed;
- skill weight delta;
- resource changes;
- assessment changes;
- missing critical activities;
- conflicts.

User apply toàn bộ hoặc selective nếu schema hỗ trợ.

## 12. Provenance

Mỗi AI artifact lưu:
- promptId;
- promptHash;
- inputHash;
- contractVersion;
- generatedAt;
- importedAt;
- provider/model nếu user chọn;
- source type: AI imported / local / user-edited.

## 13. Prompt history

Có thể:
- view;
- copy lại;
- compare;
- mark imported;
- archive;
- regenerate repair context.

## 14. AI resource policy

Resource catalog có trust:
- CURATED;
- USER;
- AI_SUGGESTED.

AI ưu tiên ID từ curated catalog.
Nếu đề xuất URL mới:
- import vào `AI_SUGGESTED`;
- không tự nâng trust;
- UI cảnh báo chưa verify.

## 15. Structured-output robustness

Parser nên chịu:
- code fences;
- leading/trailing text nhỏ;
- BOM;
- whitespace.
Nhưng không được silently “fix” semantic constraint.

Validation phải tách:
- syntax error;
- schema error;
- semantic error;
- planner constraint violation;
- warning.

## 16. Context compaction

Không gửi full history.
Tạo local summary:
- completion rate;
- trend;
- top errors;
- vocab debt;
- bottleneck;
- last assessments;
- next milestones.

Mục tiêu: prompt nhỏ, deterministic và privacy-preserving.


---

<!-- SOURCE: 06_GAMIFICATION.md -->

# 06 — Gamification System

## 1. Mục tiêu

Gamification phải:
- tăng initiation;
- tăng consistency;
- reward review và quality;
- tạo long-term progression;
- không biến timer thành mục tiêu giả;
- không phạt nặng khi user nghỉ;
- gắn tự nhiên với chibi companion.

## 2. Core loop

Session
→ Completion/Evidence
→ Reward
→ Quest progress
→ XP/Coin/Bond
→ Chibi reaction
→ Unlock/Share
→ Next study action

## 3. Ba tầng loop

### Short loop: session
Reward:
- base XP;
- duration;
- completion;
- review;
- assessment;
- quality.

### Mid loop: day/week
Daily quests:
- hoàn thành số session;
- review;
- listening/speaking;
- minimum target.

Weekly quests:
- adherence;
- hours;
- assessment;
- speaking frequency;
- review debt threshold.

### Long loop
- CEFR phase;
- hours milestone;
- skill benchmark;
- consistency;
- mastery;
- achievements.

## 4. Currencies

Chỉ 3 hệ:
- **XP**: progression user level.
- **Coin**: cosmetic/unlock currency.
- **Bond**: relationship với chibi.

Không thêm nhiều currency nếu không có gameplay purpose.

## 5. XP model

XP không dựa hoàn toàn time.

Components:
- base session XP;
- completion multiplier;
- review bonus;
- assessment bonus;
- difficulty modifier;
- focus/quality capped bonus;
- anti-idle cap.

Không dùng confidence cao để thưởng quá nhiều vì user có thể tự chấm.

Assessment/evidence có trọng số cao hơn self-rating.

## 6. Coin

Coin dùng:
- outfit;
- accessory;
- background;
- sticker;
- share-card theme;
- optional companion cosmetics.

Không mua functionality cốt lõi.

## 7. Bond

Tăng khi:
- học đều;
- hoàn thành review;
- comeback;
- milestone;
- weekly review.

Bond không giảm mạnh khi user nghỉ.
Có thể decay rất nhẹ hoặc không decay.

Unlock:
- dialogue lines;
- expressions;
- outfits;
- celebration animations;
- companion themes.

## 8. Quest engine

Quest định nghĩa data-driven:
- trigger;
- condition;
- target;
- period;
- reward;
- repeatability;
- prerequisite.

Các quest phải lấy từ actual plan.
Ví dụ không giao speaking quest nếu tuần đó user disabled speaking vì lý do rõ.

## 9. Streak

Dùng soft streak:
- daily qualified day;
- grace/freeze;
- Minimum Viable Day;
- recovery quest.

Hiển thị rolling consistency quan trọng hơn streak tuyệt đối.

## 10. Minimum Viable Day gaming

Emergency plan hoàn thành:
- giữ consistency;
- nhận reduced XP;
- không nhận full daily quest chest.

Tránh incentive học 20 phút thay vì normal 4h chỉ để farm.

## 11. Anti-cheat / anti-idle

Không cần anti-cheat cấp game online, nhưng reward engine nên:
- cap XP theo planned session;
- session cần explicit complete;
- timer background quá lâu có thể giảm quality bonus;
- không cấp full XP cho duplicate import/log;
- assessment reward theo recorded evidence;
- local user vẫn có thể sửa dữ liệu; chấp nhận vì app không phải competitive economy.

## 12. Achievement categories

- First Step;
- Hours;
- Consistency;
- Review;
- Skill;
- Assessment;
- Phase;
- Comeback;
- Social;
- Companion Bond.

Achievements có:
- hidden/visible;
- tier;
- reward;
- share-card style.

## 13. Level progression

XP curve nên:
- nhanh giai đoạn đầu;
- tăng dần;
- không quá grind.

User level là game progression, không phải CEFR.

Luôn đặt nhãn khác rõ:
- Player Level 18;
- English CEFR B1.

## 14. Burnout guard integration

Nếu workload risk cao:
- quest không ép exceed;
- chibi đề xuất light/recovery;
- reward recovery behavior hợp lý;
- không có mechanic “mất tất cả nếu nghỉ”.

## 15. Share integration

Achievement event có thể mở:
- share card;
- copy caption;
- chibi celebration quote;
- current cosmetic snapshot.

## 16. Balance config

Toàn bộ:
- XP values;
- thresholds;
- streak grace;
- coin cost;
- bond reward;
- quest frequency
phải nằm trong config versioned, không hard-code ở UI.


---

<!-- SOURCE: 07_CHIBI_COMPANION.md -->

# 07 — Chibi Anime Study Companion

## 1. Vai trò

Chibi là:
- visual companion;
- reminder;
- reward presenter;
- progress narrator;
- recovery coach.

Không phải chatbot AI bắt buộc.

## 2. Personality

Default:
- dễ thương;
- năng lượng tích cực;
- hơi tinh nghịch;
- không infantilize user;
- không guilt/shame;
- không toxic streak pressure.

Có thể cho user chọn preset:
- Friendly;
- Gentle Coach;
- Energetic;
- Light Tsundere;
- Serious Exam.

## 3. State machine

Core states:
- IDLE
- GREET
- REMIND
- FOCUS
- PRAISE
- CELEBRATE
- WORRIED
- RECOVERY
- COMEBACK
- SLEEPY
- PROUD

State transition dựa event + cooldown + priority.

Ví dụ:
- SESSION_DUE → REMIND;
- SESSION_COMPLETED → PRAISE;
- MILESTONE → CELEBRATE;
- HIGH_REVIEW_DEBT → WORRIED;
- RETURN_AFTER_GAP → COMEBACK;
- RECOVERY_DAY → RECOVERY.

## 4. Dialogue system

Dialogue không hard-code trong component.
Mỗi line có:
- id;
- personality tags;
- state;
- time-of-day;
- prerequisites;
- bond range;
- cooldown;
- text;
- optional voice key.

Không lặp line quá thường xuyên.

## 5. Reminder policy

Nhắc:
- upcoming session;
- overdue critical review;
- daily brief;
- weekly review;
- assessment.

Không spam.
Có:
- quiet hours;
- snooze;
- disable;
- notification permission.
Nếu notification không có, reminder hiện in-app.

## 6. Cosmetics

Unlock:
- outfit;
- accessory;
- background;
- expression pack;
- animation;
- sticker;
- share-card frame.

Cosmetics không ảnh hưởng learning algorithm.

## 7. Bond integration

Bond level unlock:
- dialogue;
- pose;
- outfit;
- special weekly review;
- celebration.

Không tạo romantic coercion.
Companion vẫn là motivational mascot.

## 8. Rendering technology

Ưu tiên architecture:
- renderer adapter;
- sprite/WebP/PNG base;
- CSS animation;
- optional Rive/Lottie.

Không khóa state machine vào animation engine.

Về sau có thể thay Live2D mà không sửa gamification logic.

## 9. Audio

Modes:
- Off;
- SFX only;
- Browser TTS;
- custom voice assets nếu có quyền.

Không phát âm thanh đột ngột nếu user chưa opt-in.

## 10. Performance

- lazy-load cosmetic assets;
- preload current outfit;
- respect reduced-motion;
- mobile memory budget;
- fallback static image.

## 11. Accessibility

- text bubble luôn có;
- aria label cho state quan trọng;
- disable animation;
- reduce motion;
- no critical info chỉ qua màu/animation.


---

<!-- SOURCE: 08_P2P_CHAT_SIGNALING.md -->

# 08 — P2P Study Chat and Signaling

## 1. Product definition

Tên nên là:
- Study Room;
- P2P Room;
không gọi “global persistent chat”.

Tính năng:
- room code;
- online peers;
- text;
- emoji;
- basic reactions;
- nickname/avatar;
- local history.

Không có:
- offline cloud inbox;
- permanent server archive;
- large-scale public moderation platform.

## 2. Transport

Actual messages:
- WebRTC `RTCDataChannel`.
- JSON application protocol.
- WebRTC data channel được mã hóa ở transport bởi DTLS theo WebRTC.

## 3. Signaling problem

WebRTC cần exchange:
- SDP offer;
- SDP answer;
- ICE candidates.

WebRTC không tự cung cấp room discovery/signaling.
Ứng dụng dùng:
- Google Apps Script Web App;
- Google Sheet event store tạm thời.

## 4. Signaling architecture

Static App
→ Apps Script HTTPS endpoint
→ Google Sheet temporary signaling events
→ peers find/exchange negotiation
→ WebRTC connected
→ stop signaling polling
→ chat P2P directly.

## 5. Google Apps Script role

Chỉ:
- register JOIN;
- list active room peers;
- post OFFER;
- post ANSWER;
- post ICE candidate;
- leave/expire;
- cleanup.

Không:
- store chat;
- store learning profile;
- store avatar image;
- store study history.

## 6. Sheet schema

Append-only event log concept:
- eventId;
- roomId;
- peerId;
- eventType;
- payload;
- createdAt;
- expiresAt;
- optional targetPeerId;
- protocolVersion.

Event types:
- JOIN;
- LEAVE;
- OFFER;
- ANSWER;
- ICE;
- HEARTBEAT optional, only during discovery;
- ROOM_META optional.

## 7. TTL

Gợi ý:
- JOIN presence: 60–120s hoặc refresh lúc waiting;
- OFFER/ANSWER/ICE: 2–5 phút;
- cleanup on request + scheduled cleanup.

Không để sheet phình vô hạn.

## 8. Polling

Chỉ khi:
- creating/joining;
- renegotiating.

Interval ban đầu khoảng 1–2 giây, có backoff.
Sau CONNECTED:
- stop signaling polling.

Không heartbeat Google mỗi vài giây trong suốt chat nếu WebRTC đã có presence.

## 9. Room code

Không dùng 4 digit đơn giản.
Dùng 8–12 ký tự entropy phù hợp, ví dụ nhóm ký tự không nhầm.

Có thể có:
- roomCode;
- optional roomPassword.

Room password không gửi raw.
Nếu dùng encryption signaling:
- derive symmetric key từ room secret;
- AES-GCM encrypt payload.

## 10. STUN/TURN

ICE cần STUN/TURN config.
Yêu cầu:
- deployment config, không nằm trong domain logic;
- dùng server có quyền sử dụng;
- TURN là fallback khi direct P2P không xuyên NAT/firewall.

Nếu không có TURN:
- chấp nhận một tỷ lệ peer không kết nối được;
- UI phải báo lý do/fallback.

## 11. Group topology

Small room dùng full mesh.

Số connection = n(n-1)/2.
Khuyến nghị soft limit:
- 2–8 peers;
- có thể 10 cho text tùy test.

Không target 100-user room.

## 12. Chat application protocol

Message envelope:
- protocolVersion;
- messageId;
- roomId;
- senderPeerId;
- type;
- timestamp;
- payload.

Types:
- HELLO;
- TEXT;
- REACTION;
- PRESENCE;
- TYPING optional;
- SYSTEM;
- PING/PONG;
- ROOM_STATE optional.

## 13. Peer profile exchange

HELLO payload:
- nickname;
- avatarConfig;
- appVersion;
- chatProtocolVersion.

Avatar là config, máy nhận tự render qua Avataaars.
Không truyền ảnh avatar lớn.

## 14. Message history

IndexedDB local.
Mỗi peer lưu message mình gửi/nhận.

Offline behavior:
- peer offline không nhận message.
- app không giả lập server queue.
- khi reconnect, có thể optional recent-history sync giữa peers nếu hai bên đồng ý, nhưng đây là feature riêng và cần conflict/dedup protocol.

## 15. Dedup

Message ID unique.
Repository bỏ duplicate messageId.
Clock không được coi là identity.

## 16. Emoji/reaction

Basic:
- native Unicode emoji;
- fixed reaction palette.
Không upload sticker/file ở scope hiện tại.

## 17. Local moderation

User có:
- mute peer;
- block peer;
- clear local history;
- leave room;
- report không khả dụng nếu không có server moderation, nên UI không được giả có report backend.

Block:
- drop incoming messages từ peer;
- optional close P2P connection.

## 18. Security/abuse

Apps Script anonymous endpoint cần:
- input validation;
- max payload size;
- TTL;
- rate guard best-effort;
- room entropy;
- no secrets in payload;
- no OAuth token exposed;
- sanitize text display;
- length limit;
- protocol version check.

## 19. Provider abstraction

Định nghĩa `SignalingProvider` concept:
- create/register room;
- announce peer;
- send signal;
- poll signals;
- leave;
- health.

Provider đầu:
- GoogleAppsScript.

Có thể thay:
- Nostr;
- Supabase;
- Firebase;
mà không sửa ChatProtocol/WebRTC layer.

## 20. Google quota awareness

Apps Script có quota/runtime/simultaneous limits.
Vì vậy:
- request ngắn;
- không long-poll;
- không dùng như realtime message bus;
- monitor failure;
- exponential backoff;
- UI báo signaling unavailable.


---

<!-- SOURCE: 09_SHARING_AND_AVATAR.md -->

# 09 — Sharing and User Avatar

## 1. Sharing goals

Ba loại:
1. Share app/page.
2. Share achievement/progress.
3. Share lightweight public snapshot.

Không mặc định public toàn bộ roadmap.

## 2. Copy current link

Nút:
- Copy Page Link.

Copy:
- current route;
- safe query params;
- không serialize local personal data mặc định.

## 3. Shareable state link

Optional:
- encode một snapshot nhỏ, explicit public fields:
  - target;
  - current level;
  - milestone;
  - hours;
  - achievement.
- không chứa notes/chat/history.

Trước khi tạo link:
- user preview dữ liệu sẽ public.

URL state phải:
- versioned;
- size-limited;
- checksum;
- reject unknown schema.

## 4. Share cards

Client generates SVG/Canvas/image.

Card types:
- weekly review;
- achievement;
- milestone;
- goal;
- streak/consistency;
- hours milestone.

Card elements:
- avatar hoặc chibi;
- current→target CEFR;
- progress;
- selected stats;
- quote;
- app branding;
- optional QR/link.

User chọn field nào xuất hiện.

## 5. Web Share

Nếu browser hỗ trợ:
- title;
- text;
- URL;
- file image khi `canShare` cho phép.

Nếu không:
- copy caption;
- save/download card;
- copy link.

## 6. Facebook

Static/local app có giới hạn:
- Facebook share URL có thể share app/public URL;
- localStorage không thể được Facebook crawler đọc;
- dynamic per-user Open Graph preview không thể dựa vào local data.

Do đó default flow:
1. generate share card;
2. copy caption;
3. share/open Facebook với public app URL;
4. user attach card nếu platform không nhận file share trực tiếp.

Nếu về sau muốn permanent public achievement URL + unique OG preview:
- cần public hosting/data layer riêng.
Không tự thêm vào architecture hiện tại.

## 7. Privacy

Mỗi share flow có Preview:
- data;
- image;
- caption;
- URL.

Checkbox:
- include nickname;
- include avatar;
- include CEFR;
- include hours;
- include streak;
- include chibi;
- include date.

Không include:
- assessment detail;
- error notebook;
- chat;
- private notes
trừ explicit user action.

## 8. Avatar: Avataaars

User avatar:
- npm package `avataaars`.
- random;
- reroll;
- choose parts/options;
- save only configuration.
- render as SVG/component.

Config nên adapter hóa:
- AvatarRenderer;
- AvatarConfigVersion;
để có thể migrate nếu package cũ không tương thích React mới.

## 9. Avataaars UX

Actions:
- Random;
- Randomize one part;
- customize:
  - top/hair;
  - accessories;
  - eyes;
  - eyebrows;
  - mouth;
  - skin;
  - clothes;
  - colors;
  - facial hair nếu option có.
- save;
- reset.

Có “safe random” để tránh combination invalid theo package.

## 10. Avatar in chat

HELLO chỉ gửi:
- nickname;
- avatar config/version.

Receiver:
- validate enum;
- fallback default nếu config unsupported.

## 11. Avatar in share card

Share renderer dùng cùng normalized avatar model.
Nếu package render fail:
- fallback initials/default silhouette.

## 12. Package maintenance note

`avataaars` là package lâu năm; cần:
- pin version đã test;
- compatibility test với React current;
- wrap trong adapter;
- tránh để type/package API lan khắp app.


---

<!-- SOURCE: 10_RESOURCE_AND_BROWSER_FEATURES.md -->

# 10 — Resource Catalog and Browser Features

## 1. Resource catalog

Static data files hoặc bundled data.
Resource fields:
- resourceId;
- provider;
- title;
- URL;
- type;
- skills;
- CEFR levels;
- activity types;
- estimated duration;
- free;
- requiresAccount;
- languages;
- trust;
- lastVerifiedAt;
- notes.

Trust:
- CURATED;
- USER;
- AI_SUGGESTED.

## 2. Resource selection

Local planner:
- filter level;
- skill;
- duration;
- free/account;
- trust.

AI:
- ưu tiên curated IDs;
- chỉ suggest external mới nếu cần.

## 3. Broken resources

Do CORS, client không thể health-check mọi URL đáng tin cậy.
Vì vậy:
- lastVerifiedAt;
- user “mark broken” local;
- curated catalog update qua app release;
- optional fetch check khi allowed.

## 4. PWA

Service Worker:
- cache app shell;
- cache static resource catalog;
- offline fallback;
- update strategy.

Không cache tùy tiện copyrighted external content.

## 5. Installability

Manifest:
- name;
- short name;
- icons;
- theme/background;
- start URL;
- display standalone.

UI có install hint khi browser cung cấp cơ chế phù hợp.

## 6. Notifications

Use cases:
- session due;
- daily brief;
- review due;
- weekly review.

Rules:
- ask permission sau user intent, không ngay first load;
- quiet hours;
- per-category toggles;
- fallback in-app.

Không cam kết alarm chính xác khi browser/app đóng.
Calendar export `.ics` nên là fallback đáng tin hơn.

## 7. Calendar export

Export:
- entire plan;
- current week;
- assessments only.

Event title không chứa sensitive data mặc định.
UID ổn định để tránh duplicate khi re-export nếu có thể.

## 8. Wake Lock

Session mode có:
- request wake lock sau user Start;
- release khi complete/leave;
- reacquire khi visibility trở lại nếu session đang active.

Fallback: không làm gì.

## 9. Timer

Timer dựa monotonic elapsed time, không chỉ setInterval count.
Handle:
- tab inactive;
- pause;
- resume;
- reload recovery nếu state persisted.

## 10. Microphone

Optional speaking:
- explicit permission;
- record local;
- playback;
- delete;
- save only if user chooses.

Không upload mặc định.

## 11. TTS

Speech synthesis:
- pronunciation demo;
- chibi optional voice;
- reading prompt.
Cho chọn voice/rate nếu browser có.

## 12. Speech recognition

Optional enhancement.
Không được làm core assessment bắt buộc vì support/quality khác nhau.
Fallback:
- manual transcript;
- self-check;
- external AI prompt.

## 13. Clipboard

Use:
- AI prompt;
- AI JSON;
- share caption;
- page link;
- room invite.

Fallback:
- selectable text area.

## 14. File import/export

Export:
- JSON backup;
- plan JSON;
- logs CSV optional;
- ICS;
- share images.

Import:
- backup;
- AI JSON;
- resource pack optional.

Validate MIME/extension không đủ; luôn parse/validate content.


---

<!-- SOURCE: 11_SECURITY_PRIVACY_RELIABILITY.md -->

# 11 — Security, Privacy and Reliability

## 1. Threat model

Các nguy cơ:
- corrupted local data;
- stale AI JSON;
- malicious AI response;
- XSS qua imported text/chat;
- signaling spam;
- guessed room code;
- oversized WebRTC payload;
- malicious peer;
- browser feature failure;
- local data loss;
- public sharing accidental disclosure.

## 2. Local-first privacy

Default:
- profile/study/chat local.
- không analytics chứa nội dung học/chat nếu sau này thêm telemetry.
- explicit export/share.

Privacy page phải giải thích:
- data nằm đâu;
- dữ liệu nào gửi AI qua copy prompt;
- signaling gửi gì;
- WebRTC peer thấy gì;
- backup trách nhiệm user.

## 3. Input sanitation

Mọi text từ:
- AI import;
- chat;
- resource suggestions;
- backup
phải render text-safe.
Không render raw HTML từ peer/AI.

Nếu Markdown được cho phép trong curriculum:
- dùng sanitizer;
- whitelist.

## 4. AI import security

- JSON size cap;
- schema validation;
- enum validation;
- URL validation;
- no executable code;
- no HTML injection;
- inputHash check;
- resource trust separation.

## 5. Chat security

- message length cap;
- rate limit local per peer;
- ignore unknown protocol type;
- reject oversized frame;
- sanitize display;
- dedup;
- block/mute;
- room entropy;
- optional encrypted signaling.

WebRTC transport encryption không thay thế việc kiểm soát peer identity; room participants vẫn là self-asserted identities.

## 6. Apps Script signaling

Endpoint anonymous nếu cấu hình như vậy.
Do đó:
- không lưu secret;
- validate action/event;
- size cap;
- TTL;
- rate guard;
- append-only log;
- cleanup;
- no spreadsheet IDs/secrets exposed unnecessarily;
- no OAuth token sent to client.

## 7. STUN/TURN privacy

ICE có thể làm lộ network metadata giữa peers/servers.
Privacy doc phải nói chat P2P có thể tiết lộ IP/network info theo WebRTC behavior.
TURN nếu dùng sẽ relay traffic, nhưng payload transport vẫn WebRTC encrypted.

## 8. Sharing privacy

Trước share:
- preview.
Default:
- minimal fields.
Never default include:
- full study history;
- assessment details;
- chat;
- notes.

## 9. Backup security

Backup JSON có thể chứa private data.
UI cảnh báo user giữ file an toàn.
Optional future:
- encrypted backup with passphrase.
Không tự upload.

## 10. Reliability

### Storage failure
- transaction;
- retries;
- error state;
- export rescue if possible.

### AI invalid
- partial import;
- repair prompt.

### Signaling down
- room feature báo unavailable;
- rest app unaffected.

### P2P fail
- retry ICE/renegotiate;
- explain possible NAT/TURN issue;
- allow manual signaling fallback optional.

### External resource dead
- mark unavailable;
- suggest alternative.

### Service worker update
- version prompt;
- don't wipe DB.

## 11. Capability matrix

App tạo runtime capability state:
- storage;
- indexedDB;
- clipboard;
- share;
- notifications;
- wakeLock;
- mic;
- speech;
- serviceWorker;
- WebRTC.

Feature UI dựa capability.


---

<!-- SOURCE: 12_UX_FLOWS_AND_STATES.md -->

# 12 — UX Flows and Application States

## 1. Navigation

Primary:
- Dashboard
- Planner
- Roadmap/Calendar
- Today
- Progress
- AI Planner
- Social
- Profile/Companion
- Settings

Mobile bottom nav có thể rút gọn, phần còn lại menu.

## 2. First-run flow

1. Welcome.
2. Nickname/avatar random.
3. Current CEFR.
4. Target.
5. Duration/deadline.
6. Availability.
7. Weak skills.
8. Goal type/topics.
9. Calculate.
10. Feasibility/scenarios.
11. Confirm plan.
12. Optional generate AI master prompt.
13. Today ready.

Không ép notification/chat/AI permission ngay.

## 3. Planner flow

Input panel
→ live calculation
→ scenario cards
→ risk/sustainability
→ choose plan
→ generate fixed slots
→ save.

Nếu target unrealistic:
- show adjusted choices;
- vẫn cho user giữ aggressive target.

## 4. AI flow

AI Planner page:
- Master Roadmap status;
- weekly plan coverage;
- prompt generation queue;
- Copy Prompt;
- provider quick links;
- paste response;
- validate;
- errors;
- diff;
- import;
- repair.

Không để user phải hiểu schema.

## 5. Dashboard

Hiển thị:
- target countdown;
- study progress;
- proficiency evidence;
- today summary;
- bottleneck;
- review debt;
- chibi;
- game progress;
- next milestone.

## 6. Today

Daily brief:
- normal/busy/emergency toggle;
- planned minutes;
- priority;
- carry-over;
- critical review;
- sessions.

Session card:
- type;
- duration;
- skill;
- resource;
- reward preview optional.

## 7. Session mode

- chibi compact;
- task;
- timer;
- progress steps;
- resource button;
- notes;
- pause/finish;
- wake lock;
- fullscreen/focus.

Finish:
- actual minutes;
- difficulty;
- confidence;
- focus;
- errors/vocab capture;
- XP/reward;
- chibi praise;
- next action.

## 8. Weekly review

- planned vs actual;
- adherence;
- assessment trend;
- skill delta;
- bottleneck;
- review debt;
- XP/quests;
- recommended changes;
- Generate Replan Prompt nếu cần;
- share card.

## 9. Gamification UI

Không che core.
Có:
- level/XP mini bar;
- quest drawer;
- achievements;
- reward inventory;
- companion cosmetics.

Có “Minimal UI” setting để ẩn game/chibi.

## 10. Companion page

- chibi full view;
- bond;
- outfit;
- personality;
- dialogue history optional;
- notification voice;
- cosmetics.

## 11. Social flow

### Create
Social
→ Create Room
→ topic/room name optional
→ room code
→ copy invite
→ waiting
→ peer joins
→ connected.

### Join
Enter code
→ signaling
→ connecting
→ room.

Room:
- peer list;
- messages;
- emoji;
- typing optional;
- mute/block;
- leave.

## 12. Chat states

- signaling unavailable;
- room not found/expired;
- peer waiting;
- negotiating;
- connected;
- reconnecting;
- TURN needed/unreachable;
- peer left;
- room empty.

## 13. Sharing flow

Achievement/weekly review
→ Share
→ choose card
→ privacy fields
→ preview
→ Web Share / Download / Copy Caption / Copy Link / Facebook.

## 14. Empty states

- no plan;
- no AI curriculum;
- no resources;
- no logs;
- no vocab;
- no errors;
- no achievements;
- no chat rooms.

Mỗi empty state có next action rõ.

## 15. Error states

Error message phải:
- nói ảnh hưởng;
- nói dữ liệu có mất không;
- có retry/fallback;
- không show stack trace mặc định.


---

<!-- SOURCE: 13_TESTING_ACCEPTANCE.md -->

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


---

<!-- SOURCE: 14_IMPLEMENTATION_SEQUENCE.md -->

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


---

<!-- SOURCE: 15_CONFIG_AND_DECISIONS.md -->

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


---

<!-- SOURCE: 16_REFERENCES.md -->

# 16 — References and Technical Notes

## 1. CEFR learning-hour baseline

Cambridge English — Guided learning hours:
- A1: 90–100 cumulative guided hours.
- A2: 180–200.
- B1: 350–400.
- B2: 500–600.
- C1: 700–800.
- C2: 1000–1200.
- Cambridge also notes roughly 200 guided hours between adjacent CEFR levels as a broad estimate and explicitly states actual time varies by background, intensity, age and exposure.

Source:
https://support.cambridgeenglish.org/hc/en-gb/articles/202838506-Guided-learning-hours

## 2. WebRTC DataChannel

MDN documents `RTCDataChannel` as bidirectional peer-to-peer arbitrary data transport and notes WebRTC data channels are encrypted using DTLS.

Sources:
https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel
https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels

## 3. WebRTC signaling / ICE

WebRTC applications still require signaling to exchange offer/answer/ICE information. ICE configuration may use STUN/TURN to establish a route through NAT/firewalls. The signaling transport itself is application-defined.

Source:
https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling

## 4. Google Apps Script Web Apps

Google Apps Script web apps can be deployed with access configuration including anonymous access in supported deployment configurations and can execute as the deploying user.

Sources:
https://developers.google.com/apps-script/guides/web
https://developers.google.com/apps-script/manifest/web-app-api-executable

## 5. Google Apps Script quotas

Google documents execution and simultaneous-execution limits and states quotas can change. This is why Apps Script must only be used for lightweight signaling, not as a realtime chat transport.

Source:
https://developers.google.com/apps-script/guides/services/quotas

## 6. Service Worker / IndexedDB

MDN notes Service Workers can cache resources for offline behavior and IndexedDB can be used from service workers, while localStorage is synchronous and not available inside service workers.

Source:
https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

## 7. Web Share API

Web Share can share text, URLs and supported files via the OS share mechanism, but it is not universally available and requires feature detection/secure context.

Source:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share

## 8. Avataaars npm package

The `avataaars` package is an SVG-based React component for Avataaars. The npm listing currently shows version 2.0.0 and indicates it is an older package, so compatibility should be isolated behind an adapter and tested with the chosen React version.

Source:
https://www.npmjs.com/package/avataaars

## 9. Reference policy

Agent should treat:
- official specifications/browser docs as technical source;
- CEFR hour values as planning guidance, not certification criteria;
- package ecosystem facts as time-sensitive and verify when implementation begins.


---

<!-- SOURCE: 17_TECH_STACK.md -->

# 17 — Recommended Technology Stack and Dependency Policy

## 1. Frontend

Recommended:
- React.
- TypeScript strict mode.
- Vite static build.
- CSS Modules/Tailwind/utility CSS đều được, nhưng chọn một strategy thống nhất.
- Responsive desktop/mobile.
- PWA manifest + service worker.

Không dùng SSR làm dependency bắt buộc vì mục tiêu là static/local-first.

## 2. Routing

Dùng client-side router hỗ trợ:
- static hosting;
- route params;
- shareable page URLs;
- fallback phù hợp GitHub Pages/static hosting nếu cần.

Route không được chứa private state mặc định.

## 3. State management

Phân biệt:
- persistent domain state → repository/storage layer;
- derived planner state → pure computation;
- ephemeral UI state → React/local store.

Không đổ toàn bộ IndexedDB data vào một global store.

Có thể dùng lightweight store nếu cần, nhưng domain engine không phụ thuộc store library.

## 4. Validation

Khuyến nghị dùng schema validator runtime như Zod hoặc tương đương cho:
- AI imports;
- backup imports;
- signaling payload;
- chat protocol;
- resource packs.

TypeScript type không đủ vì dữ liệu đến từ external/untrusted sources.

## 5. IndexedDB

Có thể dùng:
- Dexie;
- `idb`;
- hoặc wrapper tự viết tối thiểu.

Yêu cầu quan trọng hơn package:
- transactions;
- migrations/versioning;
- indexes;
- repository abstraction;
- bulk operations;
- error handling.

Không để UI gọi IndexedDB trực tiếp.

## 6. Date/time

Dùng thư viện nhỏ hoặc platform API ổn định để:
- timezone;
- calendar arithmetic;
- ISO dates;
- weekly boundaries;
- DST.

Không tự tính ngày tháng bằng string arithmetic.

Timezone của profile là nguồn cho:
- daily quest reset;
- weekly review;
- schedule;
- notification.

## 7. Testing

Recommended classes:
- Vitest hoặc equivalent cho unit.
- React Testing Library hoặc equivalent cho component.
- Playwright cho E2E/cross-browser.
- Browser/device matrix cho WebRTC/PWA.

Planner core phải có unit/property tests độc lập UI.

## 8. PWA

Có thể dùng plugin PWA cho Vite hoặc tự cấu hình service worker.
Nhưng phải kiểm soát:
- cache version;
- update;
- offline fallback;
- không cache sensitive third-party responses vô ý.

## 9. AI contract

Không cần AI SDK.
Chỉ cần:
- prompt text generation;
- Clipboard;
- text/file import;
- runtime schema validation;
- SHA-256 qua Web Crypto.

Không thêm OpenAI/Claude/Gemini SDK vào core.

## 10. Avatar

Dùng npm `avataaars` theo yêu cầu.
Policy:
- pin exact tested version;
- normalize config trong app-owned model;
- adapter chuyển app config → package props;
- không persist package-internal object nếu có thể;
- snapshot/visual tests;
- fallback avatar.

Lý do: package đã lâu không publish, nên dependency isolation là bắt buộc.

## 11. Chibi assets

Recommended:
- static PNG/WebP sprite/state assets;
- CSS transitions;
- optional Rive/Lottie adapter.

Asset license phải rõ.
Không lấy ngẫu nhiên anime art trên Internet nếu không có quyền.

## 12. Sharing

Use:
- Clipboard API;
- Canvas/SVG rendering;
- Web Share API;
- file download;
- standard URL navigation cho Facebook/public share.

Không phụ thuộc social SDK nặng chỉ để share link.

## 13. Chat

Use:
- native WebRTC RTCPeerConnection/RTCDataChannel;
- application JSON protocol;
- native Web Crypto nếu encrypt signaling.

Không cần socket.io cho actual chat.

Signaling endpoint:
- Google Apps Script Web App.
Store:
- Google Sheet temporary event rows.

## 14. Google Apps Script

Script phải rất nhỏ:
- GET/POLL events;
- POST event;
- cleanup;
- optional room metadata.

Không implement business logic planner/chat persistence ở đó.

## 15. STUN/TURN

Cấu hình qua environment/build config.
Không assume một public STUN/TURN miễn phí vĩnh viễn.
Production test phải xác định provider hợp lệ.

## 16. Dependency policy

Mỗi dependency mới phải trả lời:
1. Có cần không?
2. Có browser-native alternative không?
3. Bundle impact?
4. Maintenance status?
5. License?
6. Có làm core phụ thuộc vendor không?
7. Có adapter boundary không nếu time-sensitive?

Ưu tiên native browser APIs cho feature nhỏ.

## 17. Static hosting

Requirements:
- HTTPS;
- SPA routing/fallback;
- immutable hashed assets;
- cache headers;
- service worker scope đúng;
- optional custom domain.

## 18. Environment/config

Không có secret trong frontend.
Public config có thể gồm:
- app version;
- Apps Script signaling URL;
- STUN/TURN public configuration (không chứa secret dài hạn nếu provider yêu cầu secret);
- feature flags;
- resource catalog version.

Nếu TURN credentials cần secret/time-limited issuance, đây là xung đột với zero-backend và phải được đưa ra quyết định kiến trúc thay vì hard-code credential.


---

<!-- SOURCE: 18_BOOTCAMP_CURRICULUM_INTEGRATION.md -->

# 18 — Tổng hợp CEFR Planner và giáo trình Bootcamp 120 ngày

## 1. Vai trò và thứ tự ưu tiên

`cefr-learning-planner-spec` là đặc tả chính của sản phẩm. `c1-bootcamp-120-day` là giáo trình bổ sung, cung cấp một lộ trình có sẵn để người dùng bắt đầu học mà không cần đợi AI tạo nội dung.

Thứ tự áp dụng:

1. Invariant, kiến trúc, domain, planner và AI contract của bộ CEFR spec.
2. Quy tắc tích hợp trong tài liệu này đối với nội dung bootcamp.
3. Các file học liệu riêng của bootcamp. Bản ghép FULL cũ đã được loại bỏ vì trùng toàn bộ 13 file học liệu.

Tài liệu này bổ sung spec, chưa có nghĩa các tính năng đã được triển khai. Giữ nguyên phạm vi hoàn chỉnh: planner, AI bridge, học tập và SRS, adaptive replanning, gamification, chibi, avatar/sharing, PWA và P2P chat.

## 2. Sản phẩm sau khi tổng hợp

Ứng dụng là **Local-first CEFR Learning Planner**, có sẵn **mẫu giáo trình C1 Bootcamp 120 ngày**.

- Người dùng lập mục tiêu CEFR theo trình độ, deadline và thời gian thực tế.
- Có thể chọn giáo trình bootcamp hoặc kế hoạch tùy chỉnh.
- Bootcamp cung cấp thứ tự chủ đề, hoạt động, đầu ra và checkpoint; local engine quyết định ngày giờ và tính khả thi.
- AI tùy chọn bổ sung bài tập, phản hồi hoặc nội dung cho slot đã tạo.
- Mốc 120 ngày là lần đánh giá mục tiêu, không bảo đảm đạt C1 và không áp cho mọi người học.

## 3. Bản đồ học liệu bổ sung

Các đường dẫn dưới đây tính từ thư mục spec này.

| Học liệu nguồn | Dùng trong sản phẩm | Quy tắc tích hợp |
|---|---|---|
| [Day 0](../c1-bootcamp-120-day/00_Day0_Assessment.md) | Onboarding, Assessment, SkillState | Lưu baseline từng kỹ năng; tự đánh giá và AI chỉ là evidence có nguồn/confidence |
| [Lịch ngày](../c1-bootcamp-120-day/01_12H_Daily_Schedule.md) | Availability preset, activity templates | Chuẩn hóa tổng phút; không ép giờ cố định |
| [Roadmap 120 ngày](../c1-bootcamp-120-day/02_120_Day_Roadmap.md) | Curriculum, Roadmap, Calendar | Giữ đủ 120 đơn vị nội dung và 17 tuần; ngày mẫu khác ngày lịch thực tế |
| [Week 1 Starter Pack](../c1-bootcamp-120-day/03_Week1_Starter_Pack.md) | Bài đọc, script, câu hỏi, chunks, bài nói/viết | Học liệu gốc có sẵn; ghép theo mục tiêu/chủ đề, không chỉ theo số ngày |
| [Grammar](../c1-bootcamp-120-day/04_Grammar_Syllabus.md) | TopicMastery, checklist và bài ôn | Hoàn thành bài không tự đồng nghĩa mastery |
| [Vocabulary](../c1-bootcamp-120-day/05_Vocabulary_Collocation_System.md) | VocabularyItem, SRS | Học chunk + câu; khoảng ôn là gợi ý, không thay thuật toán SRS đang dùng |
| [Speaking](../c1-bootcamp-120-day/06_Speaking_Prompt_Bank.md) | SessionContent, bản ghi âm | Chọn đề theo level và thời lượng; lưu audio khi người dùng chọn |
| [Writing](../c1-bootcamp-120-day/07_Writing_Prompt_Bank.md) | Draft, feedback, rewrite, evidence | Giữ bài gốc và các phiên bản sửa |
| [Weekly rubric](../c1-bootcamp-120-day/08_Weekly_Test_Rubric.md) | Weekly Review, Assessment | Lưu từng tiêu chí; không quy đổi điểm nội bộ thành chứng nhận CEFR |
| [Resource Map](../c1-bootcamp-120-day/09_Resource_Map.md) | Resource catalog | Chuyển thành resource ID; giữ trạng thái xác minh thực tế |
| [Tutor prompts](../c1-bootcamp-120-day/10_ChatGPT_Tutor_Prompts.md) | Prompt templates | Sửa prompt lập lịch theo fixed-slot contract |
| [Progress log](../c1-bootcamp-120-day/11_Daily_Progress_Log.md) | StudyLog, Dashboard, Weekly Review | Tách giờ, đầu ra, điểm kỹ năng và ghi chú |
| [Pronunciation](../c1-bootcamp-120-day/12_Pronunciation_Plan.md) | Hoạt động phát âm trong speaking | 15 phút nằm trong block speaking, không cộng thêm |
| [Tailwind migration](../c1-bootcamp-120-day/TAILWIND_MIGRATION.md) | Tư liệu triển khai hiện có | Không thay thế kiến trúc mục tiêu trong spec |

## 4. Lộ trình nền được giữ lại

| Ngày nội dung mẫu | Trọng tâm | Đầu ra/checkpoint |
|---|---|---|
| 0 | Placement và baseline | Listening, reading, bài nói, bài viết, phát âm, hồ sơ lỗi |
| 1–14 | A1 nền tảng | Giới thiệu bản thân, câu hỏi cơ bản; gate A1 |
| 15–28 | A1 → A2 | Kể chuyện, kế hoạch, trải nghiệm; gate A2 |
| 29–56 | A2 → B1 | Văn bản liên kết, thảo luận, giải thích quan điểm; gate B1 |
| 57–84 | B1 → B2 | Lập luận, paraphrase, sắc thái và Use of English; gate B2 |
| 85–112 | B2 → C1 | Register, lexical precision, discourse, timed output; mock ngày 112 |
| 113–119 | Mock và sửa điểm yếu | Bài thi thử, sửa lỗi cá nhân, luyện lại kỹ năng yếu |
| 120 | Benchmark bốn kỹ năng | So sánh baseline; chọn bước tiếp theo |

Bảng chi tiết 120 ngày trong roadmap nguồn là nội dung chuẩn; không yêu cầu AI viết lại toàn bộ lịch. Listening/reading nhiều ngày mới chỉ mô tả loại học liệu cần chọn, chưa phải 120 bộ bài tập hoàn chỉnh. Khi chưa có tài nguyên phù hợp, hiển thị yêu cầu chọn học liệu hoặc dùng bài local tương thích; không giả vờ có bài kiểm tra/đáp án đã xác minh.

Điểm vào theo Day 0 là gợi ý: Pre-A1/A1 bắt đầu ngày 1; A2 có thể nén ngày 1–21 trong 10–14 ngày; B1 có thể bắt đầu phần ngày 36 sau routine phát âm/output tuần 1; B2 có thể dùng ngày 85–120. Engine vẫn phải xem kỹ năng yếu, prerequisite và evidence trước khi đề xuất bỏ/nén phần nền tảng.

## 5. Lịch ngày đã chuẩn hóa

Nguồn có tám block 90 phút và một block 30 phút: **750 phút = 12,5 giờ**, dù tên gọi là 12 giờ. Quyết định tích hợp: mẫu 12 giờ giảm immersion từ 90 xuống 60 phút; các protocol chính vẫn giữ nguyên. Đây là điều chỉnh của bản tích hợp, không sửa âm thầm học liệu nguồn.

| Khung giờ tham khảo | Hoạt động | Phút | Cường độ nguồn |
|---|---|---:|---|
| 07:00–08:30 | Grammar + sentence production | 90 | Deep |
| 09:00–10:30 | Intensive listening | 90 | Deep |
| 10:45–12:15 | Vocabulary/collocations/SRS | 90 | Deep |
| 13:15–14:45 | Reading | 90 | Medium |
| 15:00–16:30 | Speaking + pronunciation | 90 | Deep |
| 16:45–18:15 | Writing: draft → correction → rewrite | 90 | Deep |
| 19:15–20:45 | Extensive listening/conversation | 90 | Medium |
| 21:00–22:00 | Immersion | 60 | Light |
| 22:00–22:30 | SRS + error log | 30 | Light |
| **Tổng** | **Không gồm nghỉ/ăn** | **720** | **450 phút Deep** |

Đây là mẫu cường độ cao do người dùng chủ động chọn, không phải mặc định cho toàn ứng dụng. Khung giờ có thể đổi để phù hợp sinh hoạt và giấc ngủ; không chỉ tối ưu tổng giờ.

Block học liệu không đồng nhất với `ScheduleSlot`: Medium ánh xạ sang NORMAL, Light sang LIGHT; scheduler chia block theo giới hạn phiên ở module 04, chèn nghỉ và chỉ giữ số phút vừa availability. Nếu cần nghỉ trong range, giảm phút học hoặc đề xuất range khác; không tính nghỉ thành giờ học. Số phút thực tế sau sessionization có thể thấp hơn 720 và phải hiển thị đúng.

Tách total exposure, planned/actual study minutes và effective-hours estimate. Không cộng immersion hai lần hoặc coi 720 phút exposure là 720 phút guided learning hiệu quả.

Với ít thời gian hơn, giữ thứ tự prerequisite, review và assessment; chia một ngày nội dung ra nhiều ngày lịch nếu cần. Không nén tất cả hoạt động 90 phút vào slot ngắn bằng cách giữ nguyên KPI. Ngày bận dùng Normal/Busy/Emergency của planner; nghỉ hoặc giảm tải được phép.

## 6. Quy tắc học và đánh giá

Giữ các nguyên tắc nền của bootcamp: ngủ 7,5–9 giờ, không đổi giấc ngủ lấy giờ học; học từ theo chunk/collocation và câu; từ B1 ưu tiên định nghĩa tiếng Anh, dùng tiếng Việt khi cần làm rõ. Chu trình học là input → output → feedback → spaced review.


- Speaking xuất hiện từ đầu; hoạt động nói gồm chuẩn bị bằng keywords, thu lần 1, xem lỗi, thu lần 2 và Q&A.
- Listening gồm nghe chưa có transcript, ý chính, dictation ngắn, đối chiếu, shadowing và retell.
- Reading gồm đọc hiểu, phân tích, thu chunks, tóm tắt và giải thích miệng.
- Writing giữ chu trình draft → self-edit → feedback → rewrite → error log.
- KPI 20 active chunks/ngày là của mẫu đầy đủ; mỗi tuần thứ 4 giảm còn 10, nợ ôn cao hoặc ít thời gian thì giảm tiếp. Ngày 120 không thêm từ/ngữ pháp mới.
- Lỗi lặp ba lần được đưa vào hàng đợi ôn/error notebook. “Error-log reset” trong nguồn nghĩa là rà soát và chọn ưu tiên mới, không xóa lịch sử.
- Ngày thứ 7 của mỗi tuần nội dung ưu tiên test/review, giảm deep work còn khoảng 4–5 giờ ở mẫu đầy đủ. Tổng thời gian các phần rubric thực tế là 225–285 phút; phải cộng từ phần được chọn, không mặc định cộng thêm vào lịch ngày.

| Gate mẫu | Evidence tham khảo từ bootcamp |
|---|---|
| Ngày 14 — A1 | Nói giới thiệu 3 phút, hỏi đáp cơ bản, khoảng 70% bài A1 |
| Ngày 28 — A2 | Nói 5–7 phút, viết 120–150 từ, khoảng 75% bài A2 |
| Ngày 56 — B1 | Nói liên kết 10 phút, viết 180–220 từ, khoảng 70% bài B1 |
| Ngày 84 — B2 | Thảo luận 15 phút, essay 250 từ, khoảng 65–70% bài B2 |
| Ngày 112 | Mock trước giai đoạn sửa lỗi cuối; không tự xác nhận C1 |
| Ngày 120 | Benchmark bốn kỹ năng; so với Day 0 và xác định kỹ năng cần sửa |

Ngưỡng gate là tham khảo nội bộ. Weekly rubric giữ chỉ tiêu riêng: vocabulary 40/50; grammar 80%; listening khoảng 70% và hướng tới 80%; reading A1/A2 80%, B1 75%, B2 70%, C1 65–70% khi luyện. Không thay toàn bộ bằng một ngưỡng “70% đạt CEFR”. Speaking/writing lưu điểm từng chiều 0–5; tiêu chí nói/viết chưa có ngưỡng pass số hóa đầy đủ nên cần ghi nhận đánh giá, không tự suy ra pass từ tổng điểm.

Khi gate chưa đạt, đề xuất kéo dài/ôn lại phase; nếu gate B2 ngày 84 chưa đạt, dùng phương án kéo dài 4–8 tuần của bootcamp như một scenario. Local engine tính lại deadline/feasibility, hiển thị diff để người dùng áp dụng; không tự hạ target hoặc sửa lịch đã hoàn thành.

## 7. Bổ sung domain và mapping

Đây là yêu cầu schema bổ sung cho lần triển khai; phải version hóa và validate cùng module 03.

| Thành phần | Dữ liệu cần có |
|---|---|
| CurriculumTemplate | templateId, templateVersion, title, sourceFiles, nominalDays=120, targetLevel=C1 |
| CurriculumDay | curriculumDayId ổn định, sourceDay, phase/topic IDs, levelFocus, objectives, activities, checkpointRefs |
| ActivityTemplate | activityId, skill, intensity, suggestedMinutes, steps, expectedOutput, resourceRefs, prerequisites, sourceRef |
| Plan curriculum selection | templateId/version, điểm bắt đầu, quy tắc điều chỉnh, mapping nội dung → slot |
| SessionContent provenance | Nguồn local bootcamp hoặc AI/user-edited; sourceRef và phiên bản template |
| Assessment metadata | rubric/version, điểm từng kỹ năng, evidence/source/confidence, lần thử gate và kết quả |

`sourceDay` là vị trí giáo trình, không phải ngày tháng. Một CurriculumDay có thể ánh xạ nhiều ngày lịch; một slot có thể chứa nhiều hoạt động tương thích với tổng phút không vượt duration. `slotId` vẫn do engine cấp và ổn định trong phiên bản plan. Không dùng số ngày bootcamp thay slot ID.

Log bổ sung các số liệu từ progress template: phút nói thực tế, số từ viết, chunks mới, số thẻ đến hạn/đã ôn, điểm nghe/đọc và ghi chú. Hoạt động vừa nói vừa ôn từ có thể có nhiều chỉ số nhưng chỉ tính thời gian một lần.

## 8. Luồng sử dụng và AI bridge

1. Onboarding nhập level, skill profile, timezone, availability; chọn thực hiện/ghi nhận Day 0.
2. Chọn “C1 Bootcamp 120 ngày” hoặc kế hoạch tùy chỉnh; xem nội dung, cường độ và khả năng điều chỉnh.
3. Local planner tính required range, effective capacity, feasibility và scenarios như module 04.
4. Engine tạo phases/slots, ghép học liệu sẵn có theo level, prerequisite và thứ tự nguồn. Hiển thị ngày nội dung cùng ngày lịch để tránh nhầm.
5. Người dùng xem và áp dụng lịch; Today dùng được bằng nội dung local, không cần AI.
6. Nếu cần, tạo weekly-detail prompt với fixed slots và học liệu bootcamp liên quan. AI chỉ bổ sung nội dung hợp lệ; validate/hash/diff theo module 05.
7. Weekly review và gate tạo evidence; replan chỉ thay phần tương lai sau khi xem diff.

Prompt số 8 “Daily planner using this bootcamp” phải chuyển từ yêu cầu AI tạo agenda 12 giờ sang:

> Dựa trên phần giáo trình bootcamp và fixed slots được cung cấp, viết nội dung học phù hợp trình độ, điểm yếu và thời lượng từng slot. Giữ nguyên slotId, ngày giờ, duration, deadline và mọi planner facts. Tổng phút hoạt động không vượt slot. Trả JSON đúng schema của ứng dụng; không thêm giờ hoặc tự cấp kết quả assessment/XP.

Các prompt tutor còn lại dùng để hướng dẫn/feedback; đánh giá AI là đề xuất có provenance, không tự ghi đè assessment local. Prompt chỉ bao gồm dữ liệu người dùng chọn cung cấp.

## 9. Xung đột đã xử lý

| Khác biệt trong nguồn phụ | Quyết định tích hợp |
|---|---|
| Lịch cố định 120 ngày, 12 giờ | Template có sẵn; lịch thực tế và feasibility do engine tính |
| Bảng 12 giờ thực tế 12,5 giờ | Preset chuẩn hóa 720 phút trước sessionization như mục 5 |
| Bắt giữ exposure dù mệt | Áp dụng anti-burnout và Minimum Viable Day của spec chính |
| Day 0 yêu cầu giữ audio | Khuyến khích lưu bằng chứng nhưng chỉ persist khi người dùng chọn |
| Week 1 có chủ đề khác roadmap cùng số ngày | Roadmap giữ thứ tự; starter pack là kho bài chọn theo chủ đề/level |
| Tuần 14 ghi phase gate ở cột Writing nhưng ngày 98 là weekly review | Ngày 98 là weekly review; gate chính theo bảng mục 6, ngày 112 là mock |
| Cloud sync/account trong WEB_ROADMAP cũ | Ngoài phạm vi mặc định; backup/restore local theo spec chính |
| Tutor AI tự tạo ngày giờ | Bắt buộc fixed-slot contract |
| Khoảng ôn cố định trong bootcamp | Gợi ý fallback; không ghi đè thuật toán SRS đã chọn |
| JSX/localStorage trong app hiện có | Là hiện trạng được README mô tả; kiến trúc mục tiêu vẫn theo spec |

## 10. Thứ tự tích hợp khi triển khai

Giữ các phase A–L của module 14 và bổ sung. Các đề xuất tương thích từ web roadmap cũ đã được tiếp nhận: IndexedDB/audio có lựa chọn lưu, offline/PWA, SRS, lịch sử và so sánh bài viết, báo cáo tuần bằng dữ liệu thật, checkpoint có evidence. Trong quá trình cải tiến app hiện có, chuyển dần renderer ở `src/runtime/controller.js` sang component/hook React và giữ regression tests giao diện; đây là công việc chuyển đổi, không yêu cầu viết lại ngay toàn bộ app.

Các đầu việc tích hợp:

- Foundation: kiểm kê dữ liệu app cũ, chuẩn hóa curriculum schema và migration; backup trước khi chuyển dữ liệu từ `c1_bootcamp_state_v2`, không suy diễn dữ liệu thiếu.
- Planner Core/UX: template selector, Day 0, mapping 120 ngày, preset đã chuẩn hóa và preview lịch điều chỉnh.
- AI Bridge: truyền template provenance và fixed slots; thay prompt lập agenda cũ.
- Study Execution/Adaptive: nối protocol, rubric, chunks/errors, bản viết và evidence vào domain hiện có.
- PWA/Hardening: bundle học liệu gốc được phép, resource fallback, kiểm tra migration/backup và các acceptance dưới đây.

## 11. Acceptance bổ sung

1. Có đủ 120 sourceDay duy nhất, liên tục 1–120; Day 0 riêng và ngày 120 là benchmark.
2. Tổng preset bảng mẫu đúng 720 phút; lịch sau sessionization không overlap, không vượt availability, không tính thời gian nghỉ.
3. Người có ít giờ hơn vẫn dùng được curriculum; engine chia/dời nội dung và báo feasibility, không tự ép 12 giờ.
4. Week 1 chọn đúng chủ đề dù sourceDay giữa hai nguồn không khớp; mọi bài giữ sourceRef.
5. Ngày test thay thế tải học thường tương ứng, không cộng nguyên bài test lên lịch đầy.
6. Gate chưa đạt không tự nâng CEFR; replan giữ nguyên logs/completed slots và lịch sử lần thử.
7. Tắt AI vẫn tạo được lịch và dùng học liệu local; thiếu tài nguyên có trạng thái rõ ràng.
8. AI thay giờ/slot/deadline bị validator chặn; nội dung bootcamp không bypass validation.
9. Backup/restore giữ curriculum version, mapping, evidence và lịch sử; bản ghi âm chỉ lưu theo lựa chọn.
10. XP không thưởng trùng cho một completion và không yêu cầu đủ 12 giờ để duy trì thói quen.

## 12. Phạm vi kiểm chứng của lần tổng hợp

Bản này đối chiếu tài liệu local và kiểm tra cấu trúc/liên kết, không xác nhận tính năng ứng dụng đã hoàn thành, chất lượng chứng nhận CEFR hoặc tình trạng hiện tại của các website ngoài. Resource catalog phải được xác minh khi tích hợp; không tự điền `lastVerifiedAt` từ ngày biên soạn tài liệu.


---

<!-- SOURCE: AGENT_IMPLEMENTATION_BRIEF.md -->

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
