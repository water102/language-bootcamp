# Phân tích và chuyển CSS sang Tailwind

## Đã chuyển

| Nhóm | Cách triển khai | Lý do |
|---|---|---|
| Flex/grid, vị trí, kích thước, spacing | Utility trực tiếp trong JSX/template; `@apply` cho selector dùng chung | Giữ cấu trúc DOM và class mà runtime đang sử dụng. |
| Typography, màu chữ, căn lề | `font-display`, `font-study`, `font-code`, `text-muted`, `text-brand-light`, giá trị kích thước chính xác | Cùng token và cùng giá trị computed như trước. |
| Background/border tĩnh cục bộ | Arbitrary utility trong JSX/template | Bỏ inline style mà vẫn giữ chính xác màu alpha và shorthand. |
| CSS component dùng lại | 1.516 khai báo trong 394 rule chuyển sang `@apply` | Tránh lặp class dài giữa DOM do React và runtime tạo. |
| Inline style tĩnh | 227 block JSX/template đã chuyển sang class; các gán padding/cursor tĩnh trong runtime cũng chuyển | Không còn thuộc tính `style=` tĩnh trong các trang, component và HTML template của runtime. |

Kích thước dùng `px` chính xác thay vì thay máy móc bằng scale `rem`: root hiện tại là **15px**, vì vậy `gap-3` theo scale mặc định không bằng `12px`. Font size dùng `text-[13px]` thay vì `text-sm` để không tự đổi line-height.

## Giữ trong CSS có chủ đích

Tailwind arbitrary values có thể biểu diễn hầu hết CSS. Những phần dưới được giữ vì viết CSS rõ và dễ bảo trì hơn:

- Gradient nhiều lớp, conic/radial gradient, shadow nhiều lớp, backdrop blur và scrollbar.
- Keyframe, animation, transition nhiều thuộc tính và transform của flashcard/sidebar.
- Selector trạng thái và media query đã có (`collapsed`, `open`, `active`, `flipped`, CEFR). Giữ breakpoint gốc thay vì đổi sang breakpoint mặc định Tailwind.
- Width, tọa độ, vòng tiến độ và trạng thái hiển thị do timer/media thay đổi lúc chạy vẫn dùng `element.style`; đây là giá trị động.

Selector IPA từng phụ thuộc `div[style*="grid"]` đã đổi sang `.pronunciation-reference-grid`, nên responsive tiếp tục hoạt động khi không còn inline style.

## Preflight và cascade

`src/tailwind.css` là stylesheet duy nhất được import từ `main.jsx`:

1. `@import "tailwindcss"` bật đầy đủ Preflight.
2. `tokens.css` trong lớp `theme` giữ bảng màu, font, radius, kích thước layout.
3. `base.css` trong lớp `base` khai báo rõ heading, marker danh sách, typography form, căn SVG/media, placeholder và progress từng dựa vào mặc định trình duyệt.
4. `style.css` trong lớp `components` giữ component/state/effect, dùng `@apply` cho thuộc tính đơn giản.
5. Lớp `utilities` thắng component thường; chẳng hạn `glass-card p-[7px]` thực sự ghi đè padding của card.

Không dùng `all: revert`, không bỏ Preflight và không để toàn bộ CSS cũ ngoài cascade layer. `!important` gốc ở các trạng thái đặc thù vẫn được giữ.

## Kiểm chứng

- `npm run build` kiểm tra Tailwind biên dịch tất cả `@apply` và utility.
- `npm test` kiểm tra điều hướng, dữ liệu, timer, SRS, modal và backup.
- `tests/tailwind-parity.spec.js` so sánh hình học cùng 15 thuộc tính computed của các phần tử được lấy mẫu trên **12 trang + dialog IPA**, tại **1440px và 390px**, với baseline chụp từ bản React trước khi bật Preflight.
- Baseline dùng thời gian cố định, tắt animation và đợi font tải xong; không tự cập nhật baseline khi test thất bại.
- Các script `convert-tailwind.mjs` và `convert-inline-tailwind.mjs` là công cụ chuyển đổi một lần, không phải build step. Không chạy lại trên mã đã chỉnh sửa.

Tham khảo: [Tailwind Preflight](https://tailwindcss.com/docs/preflight), [Tailwind directives](https://tailwindcss.com/docs/functions-and-directives).
