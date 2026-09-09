# 07 — Chibi Anime Study Companion

## 1. Vai trò

Chibi là:
- visual companion;
- reminder;
- reward presenter;
- progress narrator;
- recovery coach.

Không phải chatbot AI bắt buộc.

## 2. Personality

Default:
- dễ thương;
- năng lượng tích cực;
- hơi tinh nghịch;
- không infantilize user;
- không guilt/shame;
- không toxic streak pressure.

Có thể cho user chọn preset:
- Friendly;
- Gentle Coach;
- Energetic;
- Light Tsundere;
- Serious Exam.

## 3. State machine

Core states:
- IDLE
- GREET
- REMIND
- FOCUS
- PRAISE
- CELEBRATE
- WORRIED
- RECOVERY
- COMEBACK
- SLEEPY
- PROUD

State transition dựa event + cooldown + priority.

Ví dụ:
- SESSION_DUE → REMIND;
- SESSION_COMPLETED → PRAISE;
- MILESTONE → CELEBRATE;
- HIGH_REVIEW_DEBT → WORRIED;
- RETURN_AFTER_GAP → COMEBACK;
- RECOVERY_DAY → RECOVERY.

## 4. Dialogue system

Dialogue không hard-code trong component.
Mỗi line có:
- id;
- personality tags;
- state;
- time-of-day;
- prerequisites;
- bond range;
- cooldown;
- text;
- optional voice key.

Không lặp line quá thường xuyên.

## 5. Reminder policy

Nhắc:
- upcoming session;
- overdue critical review;
- daily brief;
- weekly review;
- assessment.

Không spam.
Có:
- quiet hours;
- snooze;
- disable;
- notification permission.
Nếu notification không có, reminder hiện in-app.

## 6. Cosmetics

Unlock:
- outfit;
- accessory;
- background;
- expression pack;
- animation;
- sticker;
- share-card frame.

Cosmetics không ảnh hưởng learning algorithm.

## 7. Bond integration

Bond level unlock:
- dialogue;
- pose;
- outfit;
- special weekly review;
- celebration.

Không tạo romantic coercion.
Companion vẫn là motivational mascot.

## 8. Rendering technology

Ưu tiên architecture:
- renderer adapter;
- sprite/WebP/PNG base;
- CSS animation;
- optional Rive/Lottie.

Không khóa state machine vào animation engine.

Về sau có thể thay Live2D mà không sửa gamification logic.

## 9. Audio

Modes:
- Off;
- SFX only;
- Browser TTS;
- custom voice assets nếu có quyền.

Không phát âm thanh đột ngột nếu user chưa opt-in.

## 10. Performance

- lazy-load cosmetic assets;
- preload current outfit;
- respect reduced-motion;
- mobile memory budget;
- fallback static image.

## 11. Accessibility

- text bubble luôn có;
- aria label cho state quan trọng;
- disable animation;
- reduce motion;
- no critical info chỉ qua màu/animation.

