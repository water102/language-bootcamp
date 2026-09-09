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

