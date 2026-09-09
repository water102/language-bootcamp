# CEFR Learning Planner — có sẵn giáo trình C1 Bootcamp 120 ngày

## Tài liệu chính và giáo trình bổ sung

- **Đặc tả chính:** [CEFR Learning Planner](docs/cefr-learning-planner-spec/00_README.md), hoặc [MASTER_SPEC](docs/cefr-learning-planner-spec/MASTER_SPEC.md) để đọc toàn bộ.
- **Bản tổng hợp và quy tắc tích hợp:** [CEFR + Bootcamp 120 ngày](docs/cefr-learning-planner-spec/18_BOOTCAMP_CURRICULUM_INTEGRATION.md).
- **Giáo trình phụ:** [Roadmap từng ngày](docs/c1-bootcamp-120-day/02_120_Day_Roadmap.md), dùng làm template nội dung cho planner.

CEFR spec quyết định kiến trúc, tính khả thi và lịch thực tế. Bootcamp bổ sung bài học, routine, đề luyện và rubric; 120 ngày không phải cam kết đạt C1. Phần chạy website mô tả ứng dụng hiện có, không có nghĩa toàn bộ spec đã được triển khai.

## Chạy website React

Yêu cầu Node.js 22.12+ (hoặc 20.19+).

```sh
npm ci
npm run dev
```

Mở http://localhost:8080. Chạy bản production: `npm run build`, rồi `npm run preview`.
Windows: mở `start_lan_server.bat` để build và phục vụ bản React qua LAN, cổng 8080.
`python serve.py` cũng phục vụ thư mục `dist` sau khi build.

- Stack: Vite, React/React DOM, React Router, Tailwind CSS, shadcn/ui Button, Redux Toolkit/React Redux, Day.js, react-time-ago/javascript-time-ago, Chart.js/react-chartjs-2.
- Tailwind Preflight đã bật. Design tokens gốc ở `src/tokens.css`; quy tắc tương thích reset ở `src/base.css`; các component dùng utility/`@apply` trong lớp `components` để utility có thể ghi đè. Chi tiết: [phân tích CSS và Tailwind](docs/c1-bootcamp-120-day/TAILWIND_MIGRATION.md).
- 12 trang JSX trong `src/pages`; các công cụ DOM/media cũ được giữ trong `src/runtime/controller.js`, khởi tạo một lần trong React. Đây là ranh giới tương thích rõ ràng; chưa viết lại toàn bộ tool renderer thành React hooks.
- Redux quản lý snapshot dữ liệu và lưu localStorage bằng khóa cũ `c1_bootcamp_state_v2`. Runtime gửi snapshot khi thao tác; component React đọc qua selector.
- React Router dùng hash (`/#/writing`) để tải lại và chia sẻ link trên máy chủ tĩnh. Các panel luôn mounted để timer và ghi âm tiếp tục khi đổi trang.
- Dashboard có nút mở biểu đồ tiến độ và thời gian lưu tương đối tiếng Việt.
- Dữ liệu cũ tự được đọc nếu dùng đúng origin cũ (protocol, hostname, port). Nếu đổi địa chỉ, xuất JSON từ trang cũ rồi nhập tại “Sổ Lỗi Vàng & Backup”.
- Mã nguồn website React nằm hoàn toàn trong `src/`.
- `npm test` chạy kiểm tra trình duyệt bằng Playwright với Microsoft Edge (điều hướng, persistence, timer, flashcard SRS, backup, và style parity). Ghi âm thực tế, quyền microphone và giọng đọc cần kiểm tra trên thiết bị sử dụng.

Thứ tự phát triển theo [Implementation Sequence](docs/cefr-learning-planner-spec/14_IMPLEMENTATION_SEQUENCE.md); quy tắc dùng giáo trình có sẵn nằm trong [module 18](docs/cefr-learning-planner-spec/18_BOOTCAMP_CURRICULUM_INTEGRATION.md).
# language-bootcamp