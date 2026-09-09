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

