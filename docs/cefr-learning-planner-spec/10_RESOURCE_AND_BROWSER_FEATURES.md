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

