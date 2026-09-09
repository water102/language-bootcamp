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

