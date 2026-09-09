# 12 — UX Flows and Application States

## 1. Navigation

Primary:
- Dashboard
- Planner
- Roadmap/Calendar
- Today
- Progress
- AI Planner
- Social
- Profile/Companion
- Settings

Mobile bottom nav có thể rút gọn, phần còn lại menu.

## 2. First-run flow

1. Welcome.
2. Nickname/avatar random.
3. Current CEFR.
4. Target.
5. Duration/deadline.
6. Availability.
7. Weak skills.
8. Goal type/topics.
9. Calculate.
10. Feasibility/scenarios.
11. Confirm plan.
12. Optional generate AI master prompt.
13. Today ready.

Không ép notification/chat/AI permission ngay.

## 3. Planner flow

Input panel
→ live calculation
→ scenario cards
→ risk/sustainability
→ choose plan
→ generate fixed slots
→ save.

Nếu target unrealistic:
- show adjusted choices;
- vẫn cho user giữ aggressive target.

## 4. AI flow

AI Planner page:
- Master Roadmap status;
- weekly plan coverage;
- prompt generation queue;
- Copy Prompt;
- provider quick links;
- paste response;
- validate;
- errors;
- diff;
- import;
- repair.

Không để user phải hiểu schema.

## 5. Dashboard

Hiển thị:
- target countdown;
- study progress;
- proficiency evidence;
- today summary;
- bottleneck;
- review debt;
- chibi;
- game progress;
- next milestone.

## 6. Today

Daily brief:
- normal/busy/emergency toggle;
- planned minutes;
- priority;
- carry-over;
- critical review;
- sessions.

Session card:
- type;
- duration;
- skill;
- resource;
- reward preview optional.

## 7. Session mode

- chibi compact;
- task;
- timer;
- progress steps;
- resource button;
- notes;
- pause/finish;
- wake lock;
- fullscreen/focus.

Finish:
- actual minutes;
- difficulty;
- confidence;
- focus;
- errors/vocab capture;
- XP/reward;
- chibi praise;
- next action.

## 8. Weekly review

- planned vs actual;
- adherence;
- assessment trend;
- skill delta;
- bottleneck;
- review debt;
- XP/quests;
- recommended changes;
- Generate Replan Prompt nếu cần;
- share card.

## 9. Gamification UI

Không che core.
Có:
- level/XP mini bar;
- quest drawer;
- achievements;
- reward inventory;
- companion cosmetics.

Có “Minimal UI” setting để ẩn game/chibi.

## 10. Companion page

- chibi full view;
- bond;
- outfit;
- personality;
- dialogue history optional;
- notification voice;
- cosmetics.

## 11. Social flow

### Create
Social
→ Create Room
→ topic/room name optional
→ room code
→ copy invite
→ waiting
→ peer joins
→ connected.

### Join
Enter code
→ signaling
→ connecting
→ room.

Room:
- peer list;
- messages;
- emoji;
- typing optional;
- mute/block;
- leave.

## 12. Chat states

- signaling unavailable;
- room not found/expired;
- peer waiting;
- negotiating;
- connected;
- reconnecting;
- TURN needed/unreachable;
- peer left;
- room empty.

## 13. Sharing flow

Achievement/weekly review
→ Share
→ choose card
→ privacy fields
→ preview
→ Web Share / Download / Copy Caption / Copy Link / Facebook.

## 14. Empty states

- no plan;
- no AI curriculum;
- no resources;
- no logs;
- no vocab;
- no errors;
- no achievements;
- no chat rooms.

Mỗi empty state có next action rõ.

## 15. Error states

Error message phải:
- nói ảnh hưởng;
- nói dữ liệu có mất không;
- có retry/fallback;
- không show stack trace mặc định.

