# 18 — Tổng hợp CEFR Planner và giáo trình Bootcamp 120 ngày

## 1. Vai trò và thứ tự ưu tiên

`cefr-learning-planner-spec` là đặc tả chính của sản phẩm. `c1-bootcamp-120-day` là giáo trình bổ sung, cung cấp một lộ trình có sẵn để người dùng bắt đầu học mà không cần đợi AI tạo nội dung.

Thứ tự áp dụng:

1. Invariant, kiến trúc, domain, planner và AI contract của bộ CEFR spec.
2. Quy tắc tích hợp trong tài liệu này đối với nội dung bootcamp.
3. Các file học liệu riêng của bootcamp. Bản ghép FULL cũ đã được loại bỏ vì trùng toàn bộ 13 file học liệu.

Tài liệu này bổ sung spec, chưa có nghĩa các tính năng đã được triển khai. Giữ nguyên phạm vi hoàn chỉnh: planner, AI bridge, học tập và SRS, adaptive replanning, gamification, chibi, avatar/sharing, PWA và P2P chat.

## 2. Sản phẩm sau khi tổng hợp

Ứng dụng là **Local-first CEFR Learning Planner**, có sẵn **mẫu giáo trình C1 Bootcamp 120 ngày**.

- Người dùng lập mục tiêu CEFR theo trình độ, deadline và thời gian thực tế.
- Có thể chọn giáo trình bootcamp hoặc kế hoạch tùy chỉnh.
- Bootcamp cung cấp thứ tự chủ đề, hoạt động, đầu ra và checkpoint; local engine quyết định ngày giờ và tính khả thi.
- AI tùy chọn bổ sung bài tập, phản hồi hoặc nội dung cho slot đã tạo.
- Mốc 120 ngày là lần đánh giá mục tiêu, không bảo đảm đạt C1 và không áp cho mọi người học.

## 3. Bản đồ học liệu bổ sung

Các đường dẫn dưới đây tính từ thư mục spec này.

| Học liệu nguồn | Dùng trong sản phẩm | Quy tắc tích hợp |
|---|---|---|
| [Day 0](../c1-bootcamp-120-day/00_Day0_Assessment.md) | Onboarding, Assessment, SkillState | Lưu baseline từng kỹ năng; tự đánh giá và AI chỉ là evidence có nguồn/confidence |
| [Lịch ngày](../c1-bootcamp-120-day/01_12H_Daily_Schedule.md) | Availability preset, activity templates | Chuẩn hóa tổng phút; không ép giờ cố định |
| [Roadmap 120 ngày](../c1-bootcamp-120-day/02_120_Day_Roadmap.md) | Curriculum, Roadmap, Calendar | Giữ đủ 120 đơn vị nội dung và 17 tuần; ngày mẫu khác ngày lịch thực tế |
| [Week 1 Starter Pack](../c1-bootcamp-120-day/03_Week1_Starter_Pack.md) | Bài đọc, script, câu hỏi, chunks, bài nói/viết | Học liệu gốc có sẵn; ghép theo mục tiêu/chủ đề, không chỉ theo số ngày |
| [Grammar](../c1-bootcamp-120-day/04_Grammar_Syllabus.md) | TopicMastery, checklist và bài ôn | Hoàn thành bài không tự đồng nghĩa mastery |
| [Vocabulary](../c1-bootcamp-120-day/05_Vocabulary_Collocation_System.md) | VocabularyItem, SRS | Học chunk + câu; khoảng ôn là gợi ý, không thay thuật toán SRS đang dùng |
| [Speaking](../c1-bootcamp-120-day/06_Speaking_Prompt_Bank.md) | SessionContent, bản ghi âm | Chọn đề theo level và thời lượng; lưu audio khi người dùng chọn |
| [Writing](../c1-bootcamp-120-day/07_Writing_Prompt_Bank.md) | Draft, feedback, rewrite, evidence | Giữ bài gốc và các phiên bản sửa |
| [Weekly rubric](../c1-bootcamp-120-day/08_Weekly_Test_Rubric.md) | Weekly Review, Assessment | Lưu từng tiêu chí; không quy đổi điểm nội bộ thành chứng nhận CEFR |
| [Resource Map](../c1-bootcamp-120-day/09_Resource_Map.md) | Resource catalog | Chuyển thành resource ID; giữ trạng thái xác minh thực tế |
| [Tutor prompts](../c1-bootcamp-120-day/10_ChatGPT_Tutor_Prompts.md) | Prompt templates | Sửa prompt lập lịch theo fixed-slot contract |
| [Progress log](../c1-bootcamp-120-day/11_Daily_Progress_Log.md) | StudyLog, Dashboard, Weekly Review | Tách giờ, đầu ra, điểm kỹ năng và ghi chú |
| [Pronunciation](../c1-bootcamp-120-day/12_Pronunciation_Plan.md) | Hoạt động phát âm trong speaking | 15 phút nằm trong block speaking, không cộng thêm |
| [Tailwind migration](../c1-bootcamp-120-day/TAILWIND_MIGRATION.md) | Tư liệu triển khai hiện có | Không thay thế kiến trúc mục tiêu trong spec |

## 4. Lộ trình nền được giữ lại

| Ngày nội dung mẫu | Trọng tâm | Đầu ra/checkpoint |
|---|---|---|
| 0 | Placement và baseline | Listening, reading, bài nói, bài viết, phát âm, hồ sơ lỗi |
| 1–14 | A1 nền tảng | Giới thiệu bản thân, câu hỏi cơ bản; gate A1 |
| 15–28 | A1 → A2 | Kể chuyện, kế hoạch, trải nghiệm; gate A2 |
| 29–56 | A2 → B1 | Văn bản liên kết, thảo luận, giải thích quan điểm; gate B1 |
| 57–84 | B1 → B2 | Lập luận, paraphrase, sắc thái và Use of English; gate B2 |
| 85–112 | B2 → C1 | Register, lexical precision, discourse, timed output; mock ngày 112 |
| 113–119 | Mock và sửa điểm yếu | Bài thi thử, sửa lỗi cá nhân, luyện lại kỹ năng yếu |
| 120 | Benchmark bốn kỹ năng | So sánh baseline; chọn bước tiếp theo |

Bảng chi tiết 120 ngày trong roadmap nguồn là nội dung chuẩn; không yêu cầu AI viết lại toàn bộ lịch. Listening/reading nhiều ngày mới chỉ mô tả loại học liệu cần chọn, chưa phải 120 bộ bài tập hoàn chỉnh. Khi chưa có tài nguyên phù hợp, hiển thị yêu cầu chọn học liệu hoặc dùng bài local tương thích; không giả vờ có bài kiểm tra/đáp án đã xác minh.

Điểm vào theo Day 0 là gợi ý: Pre-A1/A1 bắt đầu ngày 1; A2 có thể nén ngày 1–21 trong 10–14 ngày; B1 có thể bắt đầu phần ngày 36 sau routine phát âm/output tuần 1; B2 có thể dùng ngày 85–120. Engine vẫn phải xem kỹ năng yếu, prerequisite và evidence trước khi đề xuất bỏ/nén phần nền tảng.

## 5. Lịch ngày đã chuẩn hóa

Nguồn có tám block 90 phút và một block 30 phút: **750 phút = 12,5 giờ**, dù tên gọi là 12 giờ. Quyết định tích hợp: mẫu 12 giờ giảm immersion từ 90 xuống 60 phút; các protocol chính vẫn giữ nguyên. Đây là điều chỉnh của bản tích hợp, không sửa âm thầm học liệu nguồn.

| Khung giờ tham khảo | Hoạt động | Phút | Cường độ nguồn |
|---|---|---:|---|
| 07:00–08:30 | Grammar + sentence production | 90 | Deep |
| 09:00–10:30 | Intensive listening | 90 | Deep |
| 10:45–12:15 | Vocabulary/collocations/SRS | 90 | Deep |
| 13:15–14:45 | Reading | 90 | Medium |
| 15:00–16:30 | Speaking + pronunciation | 90 | Deep |
| 16:45–18:15 | Writing: draft → correction → rewrite | 90 | Deep |
| 19:15–20:45 | Extensive listening/conversation | 90 | Medium |
| 21:00–22:00 | Immersion | 60 | Light |
| 22:00–22:30 | SRS + error log | 30 | Light |
| **Tổng** | **Không gồm nghỉ/ăn** | **720** | **450 phút Deep** |

Đây là mẫu cường độ cao do người dùng chủ động chọn, không phải mặc định cho toàn ứng dụng. Khung giờ có thể đổi để phù hợp sinh hoạt và giấc ngủ; không chỉ tối ưu tổng giờ.

Block học liệu không đồng nhất với `ScheduleSlot`: Medium ánh xạ sang NORMAL, Light sang LIGHT; scheduler chia block theo giới hạn phiên ở module 04, chèn nghỉ và chỉ giữ số phút vừa availability. Nếu cần nghỉ trong range, giảm phút học hoặc đề xuất range khác; không tính nghỉ thành giờ học. Số phút thực tế sau sessionization có thể thấp hơn 720 và phải hiển thị đúng.

Tách total exposure, planned/actual study minutes và effective-hours estimate. Không cộng immersion hai lần hoặc coi 720 phút exposure là 720 phút guided learning hiệu quả.

Với ít thời gian hơn, giữ thứ tự prerequisite, review và assessment; chia một ngày nội dung ra nhiều ngày lịch nếu cần. Không nén tất cả hoạt động 90 phút vào slot ngắn bằng cách giữ nguyên KPI. Ngày bận dùng Normal/Busy/Emergency của planner; nghỉ hoặc giảm tải được phép.

## 6. Quy tắc học và đánh giá

Giữ các nguyên tắc nền của bootcamp: ngủ 7,5–9 giờ, không đổi giấc ngủ lấy giờ học; học từ theo chunk/collocation và câu; từ B1 ưu tiên định nghĩa tiếng Anh, dùng tiếng Việt khi cần làm rõ. Chu trình học là input → output → feedback → spaced review.


- Speaking xuất hiện từ đầu; hoạt động nói gồm chuẩn bị bằng keywords, thu lần 1, xem lỗi, thu lần 2 và Q&A.
- Listening gồm nghe chưa có transcript, ý chính, dictation ngắn, đối chiếu, shadowing và retell.
- Reading gồm đọc hiểu, phân tích, thu chunks, tóm tắt và giải thích miệng.
- Writing giữ chu trình draft → self-edit → feedback → rewrite → error log.
- KPI 20 active chunks/ngày là của mẫu đầy đủ; mỗi tuần thứ 4 giảm còn 10, nợ ôn cao hoặc ít thời gian thì giảm tiếp. Ngày 120 không thêm từ/ngữ pháp mới.
- Lỗi lặp ba lần được đưa vào hàng đợi ôn/error notebook. “Error-log reset” trong nguồn nghĩa là rà soát và chọn ưu tiên mới, không xóa lịch sử.
- Ngày thứ 7 của mỗi tuần nội dung ưu tiên test/review, giảm deep work còn khoảng 4–5 giờ ở mẫu đầy đủ. Tổng thời gian các phần rubric thực tế là 225–285 phút; phải cộng từ phần được chọn, không mặc định cộng thêm vào lịch ngày.

| Gate mẫu | Evidence tham khảo từ bootcamp |
|---|---|
| Ngày 14 — A1 | Nói giới thiệu 3 phút, hỏi đáp cơ bản, khoảng 70% bài A1 |
| Ngày 28 — A2 | Nói 5–7 phút, viết 120–150 từ, khoảng 75% bài A2 |
| Ngày 56 — B1 | Nói liên kết 10 phút, viết 180–220 từ, khoảng 70% bài B1 |
| Ngày 84 — B2 | Thảo luận 15 phút, essay 250 từ, khoảng 65–70% bài B2 |
| Ngày 112 | Mock trước giai đoạn sửa lỗi cuối; không tự xác nhận C1 |
| Ngày 120 | Benchmark bốn kỹ năng; so với Day 0 và xác định kỹ năng cần sửa |

Ngưỡng gate là tham khảo nội bộ. Weekly rubric giữ chỉ tiêu riêng: vocabulary 40/50; grammar 80%; listening khoảng 70% và hướng tới 80%; reading A1/A2 80%, B1 75%, B2 70%, C1 65–70% khi luyện. Không thay toàn bộ bằng một ngưỡng “70% đạt CEFR”. Speaking/writing lưu điểm từng chiều 0–5; tiêu chí nói/viết chưa có ngưỡng pass số hóa đầy đủ nên cần ghi nhận đánh giá, không tự suy ra pass từ tổng điểm.

Khi gate chưa đạt, đề xuất kéo dài/ôn lại phase; nếu gate B2 ngày 84 chưa đạt, dùng phương án kéo dài 4–8 tuần của bootcamp như một scenario. Local engine tính lại deadline/feasibility, hiển thị diff để người dùng áp dụng; không tự hạ target hoặc sửa lịch đã hoàn thành.

## 7. Bổ sung domain và mapping

Đây là yêu cầu schema bổ sung cho lần triển khai; phải version hóa và validate cùng module 03.

| Thành phần | Dữ liệu cần có |
|---|---|
| CurriculumTemplate | templateId, templateVersion, title, sourceFiles, nominalDays=120, targetLevel=C1 |
| CurriculumDay | curriculumDayId ổn định, sourceDay, phase/topic IDs, levelFocus, objectives, activities, checkpointRefs |
| ActivityTemplate | activityId, skill, intensity, suggestedMinutes, steps, expectedOutput, resourceRefs, prerequisites, sourceRef |
| Plan curriculum selection | templateId/version, điểm bắt đầu, quy tắc điều chỉnh, mapping nội dung → slot |
| SessionContent provenance | Nguồn local bootcamp hoặc AI/user-edited; sourceRef và phiên bản template |
| Assessment metadata | rubric/version, điểm từng kỹ năng, evidence/source/confidence, lần thử gate và kết quả |

`sourceDay` là vị trí giáo trình, không phải ngày tháng. Một CurriculumDay có thể ánh xạ nhiều ngày lịch; một slot có thể chứa nhiều hoạt động tương thích với tổng phút không vượt duration. `slotId` vẫn do engine cấp và ổn định trong phiên bản plan. Không dùng số ngày bootcamp thay slot ID.

Log bổ sung các số liệu từ progress template: phút nói thực tế, số từ viết, chunks mới, số thẻ đến hạn/đã ôn, điểm nghe/đọc và ghi chú. Hoạt động vừa nói vừa ôn từ có thể có nhiều chỉ số nhưng chỉ tính thời gian một lần.

## 8. Luồng sử dụng và AI bridge

1. Onboarding nhập level, skill profile, timezone, availability; chọn thực hiện/ghi nhận Day 0.
2. Chọn “C1 Bootcamp 120 ngày” hoặc kế hoạch tùy chỉnh; xem nội dung, cường độ và khả năng điều chỉnh.
3. Local planner tính required range, effective capacity, feasibility và scenarios như module 04.
4. Engine tạo phases/slots, ghép học liệu sẵn có theo level, prerequisite và thứ tự nguồn. Hiển thị ngày nội dung cùng ngày lịch để tránh nhầm.
5. Người dùng xem và áp dụng lịch; Today dùng được bằng nội dung local, không cần AI.
6. Nếu cần, tạo weekly-detail prompt với fixed slots và học liệu bootcamp liên quan. AI chỉ bổ sung nội dung hợp lệ; validate/hash/diff theo module 05.
7. Weekly review và gate tạo evidence; replan chỉ thay phần tương lai sau khi xem diff.

Prompt số 8 “Daily planner using this bootcamp” phải chuyển từ yêu cầu AI tạo agenda 12 giờ sang:

> Dựa trên phần giáo trình bootcamp và fixed slots được cung cấp, viết nội dung học phù hợp trình độ, điểm yếu và thời lượng từng slot. Giữ nguyên slotId, ngày giờ, duration, deadline và mọi planner facts. Tổng phút hoạt động không vượt slot. Trả JSON đúng schema của ứng dụng; không thêm giờ hoặc tự cấp kết quả assessment/XP.

Các prompt tutor còn lại dùng để hướng dẫn/feedback; đánh giá AI là đề xuất có provenance, không tự ghi đè assessment local. Prompt chỉ bao gồm dữ liệu người dùng chọn cung cấp.

## 9. Xung đột đã xử lý

| Khác biệt trong nguồn phụ | Quyết định tích hợp |
|---|---|
| Lịch cố định 120 ngày, 12 giờ | Template có sẵn; lịch thực tế và feasibility do engine tính |
| Bảng 12 giờ thực tế 12,5 giờ | Preset chuẩn hóa 720 phút trước sessionization như mục 5 |
| Bắt giữ exposure dù mệt | Áp dụng anti-burnout và Minimum Viable Day của spec chính |
| Day 0 yêu cầu giữ audio | Khuyến khích lưu bằng chứng nhưng chỉ persist khi người dùng chọn |
| Week 1 có chủ đề khác roadmap cùng số ngày | Roadmap giữ thứ tự; starter pack là kho bài chọn theo chủ đề/level |
| Tuần 14 ghi phase gate ở cột Writing nhưng ngày 98 là weekly review | Ngày 98 là weekly review; gate chính theo bảng mục 6, ngày 112 là mock |
| Cloud sync/account trong WEB_ROADMAP cũ | Ngoài phạm vi mặc định; backup/restore local theo spec chính |
| Tutor AI tự tạo ngày giờ | Bắt buộc fixed-slot contract |
| Khoảng ôn cố định trong bootcamp | Gợi ý fallback; không ghi đè thuật toán SRS đã chọn |
| JSX/localStorage trong app hiện có | Là hiện trạng được README mô tả; kiến trúc mục tiêu vẫn theo spec |

## 10. Thứ tự tích hợp khi triển khai

Giữ các phase A–L của module 14 và bổ sung. Các đề xuất tương thích từ web roadmap cũ đã được tiếp nhận: IndexedDB/audio có lựa chọn lưu, offline/PWA, SRS, lịch sử và so sánh bài viết, báo cáo tuần bằng dữ liệu thật, checkpoint có evidence. Trong quá trình cải tiến app hiện có, chuyển dần renderer ở `src/runtime/controller.js` sang component/hook React và giữ regression tests giao diện; đây là công việc chuyển đổi, không yêu cầu viết lại ngay toàn bộ app.

Các đầu việc tích hợp:

- Foundation: kiểm kê dữ liệu app cũ, chuẩn hóa curriculum schema và migration; backup trước khi chuyển dữ liệu từ `c1_bootcamp_state_v2`, không suy diễn dữ liệu thiếu.
- Planner Core/UX: template selector, Day 0, mapping 120 ngày, preset đã chuẩn hóa và preview lịch điều chỉnh.
- AI Bridge: truyền template provenance và fixed slots; thay prompt lập agenda cũ.
- Study Execution/Adaptive: nối protocol, rubric, chunks/errors, bản viết và evidence vào domain hiện có.
- PWA/Hardening: bundle học liệu gốc được phép, resource fallback, kiểm tra migration/backup và các acceptance dưới đây.

## 11. Acceptance bổ sung

1. Có đủ 120 sourceDay duy nhất, liên tục 1–120; Day 0 riêng và ngày 120 là benchmark.
2. Tổng preset bảng mẫu đúng 720 phút; lịch sau sessionization không overlap, không vượt availability, không tính thời gian nghỉ.
3. Người có ít giờ hơn vẫn dùng được curriculum; engine chia/dời nội dung và báo feasibility, không tự ép 12 giờ.
4. Week 1 chọn đúng chủ đề dù sourceDay giữa hai nguồn không khớp; mọi bài giữ sourceRef.
5. Ngày test thay thế tải học thường tương ứng, không cộng nguyên bài test lên lịch đầy.
6. Gate chưa đạt không tự nâng CEFR; replan giữ nguyên logs/completed slots và lịch sử lần thử.
7. Tắt AI vẫn tạo được lịch và dùng học liệu local; thiếu tài nguyên có trạng thái rõ ràng.
8. AI thay giờ/slot/deadline bị validator chặn; nội dung bootcamp không bypass validation.
9. Backup/restore giữ curriculum version, mapping, evidence và lịch sử; bản ghi âm chỉ lưu theo lựa chọn.
10. XP không thưởng trùng cho một completion và không yêu cầu đủ 12 giờ để duy trì thói quen.

## 12. Phạm vi kiểm chứng của lần tổng hợp

Bản này đối chiếu tài liệu local và kiểm tra cấu trúc/liên kết, không xác nhận tính năng ứng dụng đã hoàn thành, chất lượng chứng nhận CEFR hoặc tình trạng hiện tại của các website ngoài. Resource catalog phải được xác minh khi tích hợp; không tự điền `lastVerifiedAt` từ ngày biên soạn tài liệu.
