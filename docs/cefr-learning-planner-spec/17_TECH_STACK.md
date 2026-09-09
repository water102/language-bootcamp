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

