# CONTENT MASTER SPEC

## 1. Product principle

Content system là một lớp độc lập đứng giữa Planner và các nguồn học.

```text
Planner request
  -> Content Query
  -> Content Ranker
  -> Native / Embed / External candidate
  -> Lesson Renderer
  -> Study Log
  -> Mastery / Replan
```

Planner không hard-code URL hoặc provider.

## 2. Delivery priority

1. `native`: nội dung/exercise chạy hoàn toàn trên app.
2. `embed`: media/player từ provider nằm trong lesson của app.
3. `external`: mở trang gốc để học/làm bài.

Priority mặc định: `native > embed > external`, nhưng ranking có thể chọn external nếu quality/level match cao hơn nhiều.

## 3. Native content backbone

### 3.1 CEFR-J
Dùng làm lexical/grammar level backbone.
- Vocabulary Profile A1-B2.
- Grammar Profile.
- Octanove C1/C2 extension.

Không dùng CEFR-J như bằng chứng duy nhất rằng toàn bộ passage thuộc level X; nó là feature chính cho lexical/grammar profiling.

### 3.2 Open English WordNet
Dùng cho:
- definitions;
- POS;
- synsets;
- synonym/semantic relations;
- derivation/word family khi có;
- lexical exercise generation.

### 3.3 Tatoeba
Dùng cho:
- English sentence bank;
- English-Vietnamese pairs;
- sentence audio khi license cho reuse;
- dictation;
- translation;
- cloze;
- sentence reorder;
- contextual vocabulary;
- shadowing.

Audio có license rỗng MUST NOT được reuse ngoài Tatoeba.

### 3.4 VOA Learning English
Dùng cho lesson multimedia khi asset được VOA sản xuất độc quyền.
- transcript;
- MP3;
- video;
- vocabulary/context;
- comprehension;
- dictation;
- summary;
- speaking follow-up.

Importer phải reject/không mirror asset của AP/Reuters/AFP hoặc third-party rights holder.

### 3.5 Project Gutenberg + LibriVox
Dùng cho B1-C2 extensive reading/listening.
- Gutenberg: catalog/text.
- LibriVox: audiobook/catalog/API.
- jurisdiction check bắt buộc trước khi host tại quốc gia mục tiêu.

## 4. Embed sources

YouTube là embed source chính.
- chỉ dùng official iframe/player;
- không download/cache/tách audio;
- XP không thưởng chỉ vì xem video; thưởng cho task học của app sau khi xem.

## 5. External sources

Cambridge English và British Council LearnEnglish là external-first.
- lưu metadata và link;
- không copy/repackage exercise;
- user quay lại app và log completion/score/confidence.

Có thể thêm nguồn external khác khi Terms cho phép linking.

## 6. Content query contract

Planner gửi ít nhất:

```json
{
  "framework": "CEFR",
  "level": "B1",
  "skills": ["listening"],
  "durationMinutes": 30,
  "topics": ["technology"],
  "activityIntent": "practice",
  "excludeRecentlyUsedDays": 21,
  "offlinePreferred": false
}
```

Content Engine trả ordered candidates với explainable score.

## 7. Content item requirements

Mọi item phải có:
- stable id;
- source id;
- original URL;
- delivery mode;
- level/tag confidence;
- skills;
- content type;
- estimated duration;
- provenance;
- license snapshot;
- attribution instruction;
- host/embed/external permissions;
- last verified time.

## 8. Content lifecycle

```text
DISCOVERED
 -> LICENSE_CHECKED
 -> INGESTED
 -> NORMALIZED
 -> TAGGED
 -> QA_PENDING
 -> ACTIVE
 -> DEPRECATED / BLOCKED
```

Không đưa item chưa `LICENSE_CHECKED` vào native library.

## 9. Library UX

Filters:
- A1/A2/B1/B2/C1/C2;
- Listening/Speaking/Reading/Writing/Vocabulary/Grammar/Pronunciation;
- Native/Embed/External;
- duration;
- topic;
- provider;
- offline available;
- new/review.

## 10. Lesson composition

Native/embedded source nên được bọc bởi learning flow:

```text
Warm-up
 -> Input
 -> Guided practice
 -> Active recall
 -> Production
 -> Review
```

Ví dụ YouTube không chỉ là player: cần pre-vocabulary + questions + summary/retell.

## 11. Adaptive integration

Sau session lưu:
- actual minutes;
- score;
- confidence;
- difficulty;
- error tags;
- contentId;
- exerciseTemplateIds.

Content ranker giảm score cho content vừa dùng trừ khi planner đang yêu cầu review.

## 12. Offline

Metadata nhẹ có thể bundle cùng app. Corpus lớn chia thành optional packs:
- A1 Foundation;
- A2 Foundation;
- B1 Core;
- B2 Core;
- C1/C2 Advanced;
- EN-VI sentence pack;
- Audio pack.

IndexedDB/Cache Storage lưu pack; manifest có version/hash/license revision.

## 13. Non-negotiable invariants

- Không crawl chỉ vì nội dung xem miễn phí.
- Không host item nếu license không đủ rõ.
- Không để AI bịa URL/source/license.
- AI-generated exercise phải liên kết về source facts cụ thể.
- Source attribution phải truy ngược được đến item gốc.
- Third-party hosted media không được giả dạng native-owned media.
