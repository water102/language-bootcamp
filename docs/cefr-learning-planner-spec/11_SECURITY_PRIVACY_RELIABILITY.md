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

