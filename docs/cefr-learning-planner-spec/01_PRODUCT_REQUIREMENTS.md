# 01 — Product Requirements

## 1. Tầm nhìn sản phẩm

Ứng dụng giải quyết hai vấn đề:
1. người học không biết mục tiêu CEFR của mình có khả thi với thời gian thực tế hay không;
2. ngay cả khi có roadmap, họ thường không duy trì được việc học đủ lâu.

Sản phẩm kết hợp:
- planning khoa học;
- lịch học cụ thể;
- AI tạo curriculum;
- adaptive replanning;
- gamification;
- companion chibi;
- social sharing;
- study room P2P.

Không biến sản phẩm thành LMS nặng hoặc social network truyền thống.

## 2. Đối tượng người dùng

### 2.1 Người tự học
- biết sơ bộ level hiện tại;
- có deadline hoặc khoảng thời gian;
- muốn lịch cụ thể hàng ngày;
- có thể dùng ChatGPT/Claude/Gemini bên ngoài.

### 2.2 Người học cường độ cao
- muốn thử nhiều scenario;
- có thể học nhiều giờ/ngày;
- cần cảnh báo diminishing returns và burnout;
- muốn phân bổ theo thời gian rảnh thực tế.

### 2.3 Người học thiên về mục tiêu
- General English;
- Academic;
- Business;
- VSTEP-oriented;
- IELTS-oriented ở mức định hướng nội dung.
Core level model vẫn là CEFR trong phiên bản này.

## 3. Mục tiêu chức năng hoàn chỉnh

### 3.1 Onboarding/Profile
Người dùng có thể thiết lập:
- nickname;
- timezone;
- ngôn ngữ UI;
- avatar Avataaars;
- current CEFR;
- progress within current level;
- self-rated hoặc placement-based skill profile;
- preferred topics/domain;
- energy profile theo buổi;
- notification preference;
- chibi personality/style preference.

### 3.2 Goal setup
Người dùng chọn:
- current level;
- target level;
- target date hoặc duration;
- study days/week;
- total hours/day hoặc time ranges;
- priority/goal type;
- weak skills;
- intensity;
- preferred session length;
- recovery day;
- adherence expectation.

### 3.3 Planner
Ứng dụng hiển thị:
- required-hours range;
- expected required hours;
- scheduled hours;
- effective hours;
- coverage;
- feasibility class;
- projected level;
- recommended daily load;
- recommended deadline;
- scenario comparison;
- sensitivity/what-if view.

### 3.4 Schedule
Ứng dụng sinh:
- phases;
- weekly macro allocation;
- calendar days;
- fixed study slots;
- review slots;
- assessment slots;
- recovery/light slots;
- Minimum Viable Day plan.

### 3.5 AI Bridge
Ứng dụng:
- tạo Master Roadmap prompt;
- tạo weekly detail prompt;
- tạo repair prompt;
- tạo replan prompt;
- copy prompt;
- cho paste/file import AI JSON;
- validate;
- diff;
- partial import;
- lưu provenance và prompt history.

### 3.6 Learning execution
Today screen:
- daily brief;
- current priority;
- critical tasks;
- carry-over;
- minimum plan;
- session list;
- timer;
- wake lock;
- notes;
- completion rating.

### 3.7 Progress
Theo dõi:
- planned vs actual;
- adherence;
- effective hours;
- skill evidence;
- assessment score;
- bottlenecks;
- knowledge debt;
- error patterns;
- vocabulary review debt;
- weekly review.

### 3.8 Adaptive replanning
Khi người dùng:
- bỏ session;
- học ít hơn;
- học nhiều hơn;
- assessment thay đổi;
- skill yếu nổi lên;
- review debt cao;
engine phải có khả năng tạo lại phần còn lại mà không phá lịch đã hoàn thành.

### 3.9 Gamification
Có:
- XP;
- level;
- coin;
- bond;
- daily/weekly/milestone quests;
- achievements;
- cosmetics;
- share-card themes;
- soft streak;
- recovery quest;
- streak freeze;
- reward anti-cheat.

### 3.10 Chibi companion
Có:
- state machine;
- reminder;
- praise;
- milestone;
- comeback;
- worried/gentle alert;
- unlock cosmetics;
- optional TTS;
- user-selectable personality style.

### 3.11 Sharing
Có:
- copy current page link;
- copy shareable state link khi an toàn;
- copy caption;
- generate share image/card;
- Web Share khi khả dụng;
- open Facebook share flow;
- privacy selector.

### 3.12 P2P Study Room
Có:
- create room;
- join by room code;
- temporary discovery/signaling;
- P2P text messages;
- emoji reactions/basic emoji;
- presence;
- nickname/avatar exchange;
- local history;
- reconnect while room remains active;
- basic moderation controls ở phía local: mute/block/leave.

## 4. Các nguyên tắc UX

1. Planner không được “phán” người dùng thất bại; phải đưa lựa chọn điều chỉnh.
2. C1/C2 là level, không phải chứng chỉ cụ thể.
3. Feasibility luôn hiển thị uncertainty.
4. Không gây hiểu nhầm “500 giờ = B2 chắc chắn”.
5. AI-generated content phải có nhãn nguồn/provenance.
6. Những gì offline được phải dùng được offline.
7. Chibi và gamification có thể giảm/tắt nếu user thích giao diện nghiêm túc.
8. Chat là optional social module.
9. Không bắt user tạo account.
10. Backup phải nổi bật vì dữ liệu nằm local.

## 5. Non-goals

Không phải mục tiêu mặc định:
- cloud sync account;
- public social feed;
- public permanent chat history;
- backend chat archive;
- AI API tích hợp bằng khóa bí mật nằm client;
- voice/video call;
- large group chat hàng trăm người;
- full test certification;
- tuyên bố chính thức xác nhận CEFR;
- chống gian lận cấp thi cử.

