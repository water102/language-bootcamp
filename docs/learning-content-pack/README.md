# Learning Content Expansion Pack

Tài liệu đặc tả để mở rộng CEFR Learning Planner thành nền tảng học có nội dung thực tế.

## Mục tiêu

- Ưu tiên nội dung học trực tiếp trên ứng dụng (`native`).
- Nếu không thể host hợp pháp: dùng `embed`.
- Nếu không thể embed: dùng `external` và deep-link về nguồn gốc.
- Luôn lưu provenance/license ở cấp source và item.
- Không coi “free access” là “free to crawl/redistribute”.
- Planner phải có thể query content theo CEFR + skill + topic + duration và nhận tài nguyên tốt nhất.

## File chính

- `docs/CONTENT_MASTER_SPEC.md` — đặc tả tổng thể.
- `docs/SOURCE_AND_LICENSE_MATRIX.md` — ma trận nguồn/license.
- `docs/INGESTION_PIPELINE.md` — ingestion/normalization/indexing.
- `docs/CONTENT_RANKING_AND_CEFR.md` — ranking và gắn level.
- `docs/EXERCISE_GENERATION.md` — thuật toán sinh bài tập.
- `docs/INTEGRATION_MODES.md` — native/embed/external.
- `docs/DATA_ACQUISITION.md` — endpoint/file/feed cụ thể.
- `docs/QA_AND_MODERATION.md` — QA, dedupe, unsafe content.
- `catalog/source_registry.json` — registry machine-readable.
- `catalog/download_manifest.json` — file/feed để agent fetch.
- `catalog/external_resources.json` — nguồn embed/deep-link.
- `catalog/exercise_templates.json` — template ngân hàng bài tập.
- `schemas/*.json` — contract dữ liệu.

## Về raw data

Package này không đóng cứng corpus lớn. Các dataset động/lớn được trỏ bằng URL chính thức trong `download_manifest.json` để agent tải ở build/ingestion time. Điều này tránh snapshot nhanh lỗi thời và giữ được metadata license mới nhất.
