/**
 * Anime Chibi Companion State Machine & Dialogue Engine
 * Spec reference: docs/cefr-learning-planner-spec/07_CHIBI_COMPANION.md
 * Invariant: Never use shame or guilt to force study. Always encouraging & supportive.
 */

export const CHIBI_EMOTIONS = /** @type {const} */ ({
  HAPPY: 'HAPPY',
  STUDYING: 'STUDYING',
  CHEERING: 'CHEERING',
  PROUD: 'PROUD',
  SLEEPY: 'SLEEPY',
  RESTING: 'RESTING'
});

export const CHIBI_DIALOGUES = {
  WELCOME: [
    "Xin chào! Hôm nay chúng ta cùng chinh phục thêm một ngày mục tiêu C1 nhé!",
    "Chào bạn! Hãy khởi động nhẹ nhàng với một bài phát âm hoặc từ vựng nào!"
  ],
  SESSION_COMPLETED: [
    "Tuyệt vời quá! Bạn vừa hoàn thành thêm một phiên học xuất sắc! 🎉",
    "Não bộ của bạn vừa nạp thêm những cụm từ rất giá trị đấy!",
    "Một bước tiến vững chắc nữa trên con đường đạt chuẩn CEFR C1!"
  ],
  PLAN_CREATED: [
    "Oa, kế hoạch chi tiết đã sẵn sàng! Mình sẽ đồng hành cùng bạn từng ngày!",
    "Lộ trình đã định, mục tiêu đã rõ ràng. Cùng cố gắng nào!"
  ],
  REST_REMINDER: [
    "Học tập chăm chỉ là tốt, nhưng bạn nhớ uống nước và chớp mắt thư giãn nhé! 💧",
    "Giấc ngủ 7.5–9 tiếng là chìa khóa để não biến trí nhớ ngắn hạn thành dài hạn!"
  ],
  LEVEL_UP: [
    "CHÚC MỪNG BẠN LÊN CẤP MỚI! 🌟 Cấp độ kiến thức của bạn ngày càng vững vàng!",
    "Level Up! Bạn đang tiến rất gần đến sự tự tin giao tiếp chuẩn học thuật!"
  ]
};

export class ChibiStateMachine {
  constructor() {
    this.emotion = CHIBI_EMOTIONS.HAPPY;
    this.currentDialogue = CHIBI_DIALOGUES.WELCOME[0];
  }

  setEmotion(emotion, customText = null) {
    this.emotion = emotion;
    if (customText) {
      this.currentDialogue = customText;
    } else {
      const list = CHIBI_DIALOGUES[emotion] || CHIBI_DIALOGUES.WELCOME;
      this.currentDialogue = list[Math.floor(Math.random() * list.length)];
    }
  }

  onEvent(eventName, payload) {
    if (eventName === 'SESSION_COMPLETED') {
      this.setEmotion(CHIBI_EMOTIONS.CHEERING, CHIBI_DIALOGUES.SESSION_COMPLETED[0]);
    } else if (eventName === 'PLAN_CREATED') {
      this.setEmotion(CHIBI_EMOTIONS.PROUD, CHIBI_DIALOGUES.PLAN_CREATED[0]);
    } else if (payload?.leveledUp) {
      this.setEmotion(CHIBI_EMOTIONS.PROUD, CHIBI_DIALOGUES.LEVEL_UP[0]);
    }
  }
}
