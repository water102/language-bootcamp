# INGESTION PIPELINE

## 1. Pipeline

```text
Source Registry
 -> Fetch
 -> Raw Snapshot
 -> License Gate
 -> Parse
 -> Normalize
 -> Dedupe
 -> Language QA
 -> CEFR Tagging
 -> Skill/Topic Tagging
 -> Exercise Eligibility
 -> Quality Score
 -> Publish Pack/Index
```

## 2. Raw snapshot

Mỗi ingestion run lưu manifest, không nhất thiết commit raw corpus:
- source version/date;
- fetch URL;
- sha256;
- byte size;
- parser version;
- license URL/hash;
- importedAt.

## 3. License Gate

Trả một trong:
- `HOST_ALLOWED`;
- `EMBED_ONLY`;
- `LINK_ONLY`;
- `BLOCKED`;
- `MANUAL_REVIEW`.

Gate chạy trước text/media extraction dùng cho native UI.

## 4. Normalization

Chuẩn hóa:
- UTF-8/NFC;
- ISO language codes;
- whitespace;
- apostrophe/quote normalization nhưng giữ original text;
- source ids;
- URL canonicalization;
- POS mapping;
- CEFR enum A1-C2;
- duration seconds/minutes.

Luôn giữ `raw/original` và `normalized` riêng.

## 5. Dedupe

Fingerprint:
- normalized lowercase text;
- punctuation-stripped secondary fingerprint;
- source+externalId unique key.

Không merge hai item nếu attribution/license khác nhau; có thể group thành equivalent-content cluster.

## 6. Tatoeba ingestion

Recommended minimal EN/VN data:
1. English sentences.
2. Vietnamese sentences.
3. English-Vietnamese link file.
4. English sentence audio metadata.

Join theo sentence id. Chỉ tạo native audio record khi audio license field hợp lệ cho reuse.

## 7. CEFR-J ingestion

Normalize headword variants thành:
- canonical form;
- aliases;
- POS;
- level;
- topic/domain columns.

Không tự collapse hai POS khác nhau của cùng headword.

## 8. WordNet ingestion

Prefer official JSON export. Index:
- lemma;
- POS;
- synset;
- definition;
- examples;
- relations.

Map CEFR bằng `(lemma, POS)` từ CEFR-J khi có; fallback lemma-only với confidence thấp hơn.

## 9. VOA ingestion

Mọi page/item phải qua rights filter.
- content owned exclusively by VOA => eligible;
- agency/third-party marker => external-only/exclude corresponding media.

Không suy diễn ownership chỉ từ việc item nằm trên domain VOA.

## 10. Gutenberg/LibriVox

Không scrape Gutenberg main website. Dùng catalog/feed/mirror/robot endpoints.

Ghép text-audio chỉ khi xác định cùng edition/translation đủ tin cậy; nếu không thì chỉ associate ở book-level, không sentence-level.

## 11. Publish

Output chia shard theo level/type:

```text
/content/index.json
/content/a1/vocabulary-001.json.gz
/content/a1/sentences-001.json.gz
/content/b1/listening-meta-001.json.gz
```

Browser không tải toàn bộ corpus khi khởi động.
