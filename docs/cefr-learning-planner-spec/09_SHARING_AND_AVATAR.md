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

