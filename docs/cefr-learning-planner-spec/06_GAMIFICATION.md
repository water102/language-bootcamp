# 06 — Gamification System

## 1. Mục tiêu

Gamification phải:
- tăng initiation;
- tăng consistency;
- reward review và quality;
- tạo long-term progression;
- không biến timer thành mục tiêu giả;
- không phạt nặng khi user nghỉ;
- gắn tự nhiên với chibi companion.

## 2. Core loop

Session
→ Completion/Evidence
→ Reward
→ Quest progress
→ XP/Coin/Bond
→ Chibi reaction
→ Unlock/Share
→ Next study action

## 3. Ba tầng loop

### Short loop: session
Reward:
- base XP;
- duration;
- completion;
- review;
- assessment;
- quality.

### Mid loop: day/week
Daily quests:
- hoàn thành số session;
- review;
- listening/speaking;
- minimum target.

Weekly quests:
- adherence;
- hours;
- assessment;
- speaking frequency;
- review debt threshold.

### Long loop
- CEFR phase;
- hours milestone;
- skill benchmark;
- consistency;
- mastery;
- achievements.

## 4. Currencies

Chỉ 3 hệ:
- **XP**: progression user level.
- **Coin**: cosmetic/unlock currency.
- **Bond**: relationship với chibi.

Không thêm nhiều currency nếu không có gameplay purpose.

## 5. XP model

XP không dựa hoàn toàn time.

Components:
- base session XP;
- completion multiplier;
- review bonus;
- assessment bonus;
- difficulty modifier;
- focus/quality capped bonus;
- anti-idle cap.

Không dùng confidence cao để thưởng quá nhiều vì user có thể tự chấm.

Assessment/evidence có trọng số cao hơn self-rating.

## 6. Coin

Coin dùng:
- outfit;
- accessory;
- background;
- sticker;
- share-card theme;
- optional companion cosmetics.

Không mua functionality cốt lõi.

## 7. Bond

Tăng khi:
- học đều;
- hoàn thành review;
- comeback;
- milestone;
- weekly review.

Bond không giảm mạnh khi user nghỉ.
Có thể decay rất nhẹ hoặc không decay.

Unlock:
- dialogue lines;
- expressions;
- outfits;
- celebration animations;
- companion themes.

## 8. Quest engine

Quest định nghĩa data-driven:
- trigger;
- condition;
- target;
- period;
- reward;
- repeatability;
- prerequisite.

Các quest phải lấy từ actual plan.
Ví dụ không giao speaking quest nếu tuần đó user disabled speaking vì lý do rõ.

## 9. Streak

Dùng soft streak:
- daily qualified day;
- grace/freeze;
- Minimum Viable Day;
- recovery quest.

Hiển thị rolling consistency quan trọng hơn streak tuyệt đối.

## 10. Minimum Viable Day gaming

Emergency plan hoàn thành:
- giữ consistency;
- nhận reduced XP;
- không nhận full daily quest chest.

Tránh incentive học 20 phút thay vì normal 4h chỉ để farm.

## 11. Anti-cheat / anti-idle

Không cần anti-cheat cấp game online, nhưng reward engine nên:
- cap XP theo planned session;
- session cần explicit complete;
- timer background quá lâu có thể giảm quality bonus;
- không cấp full XP cho duplicate import/log;
- assessment reward theo recorded evidence;
- local user vẫn có thể sửa dữ liệu; chấp nhận vì app không phải competitive economy.

## 12. Achievement categories

- First Step;
- Hours;
- Consistency;
- Review;
- Skill;
- Assessment;
- Phase;
- Comeback;
- Social;
- Companion Bond.

Achievements có:
- hidden/visible;
- tier;
- reward;
- share-card style.

## 13. Level progression

XP curve nên:
- nhanh giai đoạn đầu;
- tăng dần;
- không quá grind.

User level là game progression, không phải CEFR.

Luôn đặt nhãn khác rõ:
- Player Level 18;
- English CEFR B1.

## 14. Burnout guard integration

Nếu workload risk cao:
- quest không ép exceed;
- chibi đề xuất light/recovery;
- reward recovery behavior hợp lý;
- không có mechanic “mất tất cả nếu nghỉ”.

## 15. Share integration

Achievement event có thể mở:
- share card;
- copy caption;
- chibi celebration quote;
- current cosmetic snapshot.

## 16. Balance config

Toàn bộ:
- XP values;
- thresholds;
- streak grace;
- coin cost;
- bond reward;
- quest frequency
phải nằm trong config versioned, không hard-code ở UI.

