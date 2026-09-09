# 04 — Planner Engine

## 1. Mục tiêu

Planner biến:
- current level;
- target;
- thời gian;
- availability;
- skill profile;
thành:
- required-hours estimate;
- feasibility;
- scenarios;
- phases;
- fixed study slots;
- weekly allocation;
- progress projection.

## 2. CEFR hours baseline

Dùng baseline cumulative guided-learning hours tham khảo từ Cambridge:
- A0: 0
- A1: 90–100
- A2: 180–200
- B1: 350–400
- B2: 500–600
- C1: 700–800
- C2: 1000–1200

Không coi đây là guarantee.
Trong engine nên lưu:
- min;
- midpoint;
- max;
- source metadata/version.

Expected midpoint:
- A1 95
- A2 190
- B1 375
- B2 550
- C1 750
- C2 1100

## 3. Current-position model

`progressWithinLevel` được định nghĩa là:
- 0 = vừa đạt level hiện tại;
- 1 = gần đạt level kế tiếp.

Current estimated cumulative hours:
- lấy midpoint level hiện tại;
- interpolate tới midpoint level kế tiếp;
- clamp 0..1.

Nếu có placement/assessment evidence đủ mạnh, có thể dùng evidence model để chỉnh current estimate, nhưng phải giữ trace nguồn.

## 4. Required-hours range

Không hiển thị một số duy nhất.

Tạo 3 estimate:
- optimistic;
- expected;
- conservative.

Expected = target midpoint - estimated current midpoint.

Optimistic/Conservative dùng min/max và/hoặc uncertainty factor.

UI phải nói rõ:
- “planning estimate”;
- không phải chứng nhận proficiency.

## 5. Availability model

Hỗ trợ hai input mode:

### Daily-total mode
- hours/day;
- days/week;
- optional preferred days.

### Time-range mode
Mỗi weekday có nhiều range:
- 06:00–08:00;
- 12:00–13:00;
- 20:00–22:00.

Time-range mode là nguồn tốt hơn cho scheduler.

## 6. Sessionization

Config:
- preferred session length;
- minimum session;
- break;
- max deep block.

Tạo 3 class:
- DEEP: 45–90m;
- NORMAL: 25–50m;
- LIGHT: 5–25m.

Không nhất thiết chia range cứng 50/10. Scheduler chọn theo activity class và energy profile.

## 7. Effective-hours model

Scheduled hour không bằng effective hour.

Cấu hình diminishing-return mặc định nên là calibration config, không hard-code khoa học chính thức.

Một baseline có thể bắt đầu:
- ≤1h/day: 1.00
- 1–2h: 0.95
- 2–4h: 0.90
- 4–6h: 0.82
- 6–8h: 0.72
- 8–10h: 0.62
- >10h: 0.55

Sau đó:
effective = scheduled × cognitiveEfficiency × adherenceFactor.

Hiển thị scheduled và effective riêng.

## 8. Adherence

Default ban đầu: khoảng 0.85 nếu user không chọn.

Sau khi có dữ liệu:
- rolling adherence 14/28 ngày;
- điều chỉnh forecast bằng actual adherence;
- không tự hạ target nếu user chưa đồng ý.

## 9. Feasibility

Coverage = effective available / required expected.

Baseline classification:
- >=1.30 Comfortable
- 1.05–1.30 Realistic
- 0.90–1.05 Aggressive
- 0.70–0.90 Very Aggressive
- <0.70 Unlikely

Các threshold phải config được.

UI luôn cung cấp ít nhất 3 hướng:
- giữ deadline, tăng giờ;
- giữ giờ, đổi deadline;
- giữ cả hai, giảm target/projected outcome.

## 10. Scenario optimizer

Engine thử grid khả thi:
- hours/day;
- days/week;
- session patterns;
- optional weekend boost;
- deadline shifts.

Mỗi scenario tính:
- effective hours;
- feasibility;
- intensity penalty;
- sustainability score;
- required adjustment.

Ranking objective:
1. tôn trọng constraint user;
2. đạt coverage mục tiêu;
3. minimize workload change;
4. minimize burnout risk;
5. giữ recovery day nếu có.

## 11. Skill allocation

Baseline weights theo goal type.
Sau đó điều chỉnh bởi:
- weak skill;
- assessment evidence;
- bottleneck;
- review debt;
- target exam orientation;
- recent progress.

Không để skill nào quan trọng về 0 trong thời gian dài.
Speaking và writing phải xuất hiện hàng tuần nếu target >= B1, trừ khi user chủ động tắt.

## 12. Bottleneck detection

Bottleneck score có thể dựa:
- CEFR/evidence gap;
- low assessment trend;
- low confidence;
- high error frequency;
- low mastery;
- missed sessions.

Primary bottleneck là skill có weighted deficit lớn nhất.

Planner tăng allocation có giới hạn để tránh over-correct.

## 13. Review debt

Mỗi vocab/error/topic có due state.
Knowledge debt:
- overdue review count hoặc weighted overdue score.

Nếu debt vượt threshold:
- giảm new material;
- tăng review slot;
- không thay assessment bắt buộc.

## 14. Minimum Viable Day

Mỗi ngày có 3 plan:
- Normal;
- Busy;
- Emergency.

Busy/Emergency giữ:
- review quan trọng;
- 1 core exposure;
- continuity.

Không award full XP như normal day.

## 15. Carry-over

Missed task phân loại:
- CRITICAL: assessment/milestone prerequisite → reschedule;
- REVIEW: merge vào review queue;
- CORE: reschedule nếu capacity;
- OPTIONAL/EXPOSURE: có thể drop;
- SOCIAL: không ảnh hưởng core.

Không cộng toàn bộ missed minutes vào ngày kế tiếp.

## 16. Phase generation

Phases dựa vào:
- CEFR boundaries;
- deadline;
- required effective hours;
- assessment checkpoints.

Ví dụ A2→C1:
- A2 consolidation/B1 transition;
- B1 development/B2 transition;
- B2 advanced/C1 transition;
- final consolidation/assessment.

Phase date local engine quyết định.

AI được điền learning goals và exit criteria nhưng không đổi date nếu date locked.

## 17. Assessment schedule

Local scheduler đặt:
- mini checkpoint mỗi 1–2 tuần tùy intensity;
- phase assessment;
- full checkpoint định kỳ.

Hours progress và proficiency evidence tách riêng.

## 18. Projection

Projected level không chỉ dựa hours sau khi đã có evidence.

Trước khi có evidence:
- hour-based projection với confidence thấp.

Sau khi có assessments:
- blend hours forecast + skill evidence.
- hiển thị confidence.

## 19. Adaptive replanning

Trigger:
- adherence lệch ngưỡng;
- >N missed sessions;
- assessment score change;
- bottleneck shift;
- review debt;
- availability changed;
- target changed.

Replanner:
1. khóa past/completed slots;
2. giữ immutable history;
3. lấy remaining required work;
4. recalibrate effective capacity;
5. regenerate future allocation;
6. preserve critical assessments nếu có;
7. tạo diff;
8. user apply;
9. nếu dùng AI curriculum, tạo replan prompt chỉ cho future slots.

## 20. Energy-aware scheduling

User tự chấm energy theo time segment.
Scheduler ưu tiên:
- high energy: writing, grammar, intensive listening;
- medium: reading, speaking;
- low: SRS, pronunciation, light exposure.

Đây là heuristic, user được override.

## 21. Giáo trình Bootcamp có sẵn

Áp dụng [module 18](18_BOOTCAMP_CURRICULUM_INTEGRATION.md) cho mẫu C1 Bootcamp: giữ thứ tự nội dung 120 ngày, tính lại lịch theo availability/evidence và phân biệt ngày nội dung với ngày lịch. Preset 12 giờ được chuẩn hóa tại module 18; mọi slot vẫn tuân thủ sessionization và feasibility của engine.
