/**
 * Sessionizer: Slices available daily study time into structured slots
 * Spec reference:
 * - docs/cefr-learning-planner-spec/04_PLANNER_ENGINE.md (section 6)
 * - docs/cefr-learning-planner-spec/18_BOOTCAMP_CURRICULUM_INTEGRATION.md (section 5)
 */

import { SLOT_CLASS } from '../domain/constants.js';

export class Sessionizer {
  /**
   * Standardized 12-hour C1 Bootcamp Daily Schedule Preset (720 min total study)
   */
  static getBootcampStandardPreset() {
    return [
      { startTime: '07:00', endTime: '08:30', durationMinutes: 90, slotClass: SLOT_CLASS.DEEP, skill: 'grammar', title: 'Ngữ pháp chuyên sâu & Viết câu chuẩn' },
      { startTime: '09:00', endTime: '10:30', durationMinutes: 90, slotClass: SLOT_CLASS.DEEP, skill: 'listening', title: 'Nghe chuyên sâu (Intensive Listening & Shadowing)' },
      { startTime: '10:45', endTime: '12:15', durationMinutes: 90, slotClass: SLOT_CLASS.DEEP, skill: 'vocabulary', title: 'Từ vựng Collocations & Hệ thống SRS' },
      { startTime: '13:15', endTime: '14:45', durationMinutes: 90, slotClass: SLOT_CLASS.NORMAL, skill: 'reading', title: 'Đọc hiểu học thuật & Trích xuất chunks' },
      { startTime: '15:00', endTime: '16:30', durationMinutes: 90, slotClass: SLOT_CLASS.DEEP, skill: 'speaking', title: 'Luyện nói phản xạ + 15p phát âm IPA' },
      { startTime: '16:45', endTime: '18:15', durationMinutes: 90, slotClass: SLOT_CLASS.DEEP, skill: 'writing', title: 'Writing Studio: Draft -> Sửa lỗi -> Rewrite' },
      { startTime: '19:15', endTime: '20:45', durationMinutes: 90, slotClass: SLOT_CLASS.NORMAL, skill: 'listening', title: 'Nghe mở rộng (Podcast / Diễn thuyết TED)' },
      { startTime: '21:00', endTime: '22:00', durationMinutes: 60, slotClass: SLOT_CLASS.LIGHT, skill: 'immersion', title: 'Tắm ngôn ngữ tự nhiên (Phim/Đọc tự do)' },
      { startTime: '22:00', endTime: '22:30', durationMinutes: 30, slotClass: SLOT_CLASS.LIGHT, skill: 'review', title: 'Ôn tập SRS thẻ đến hạn & Sổ lỗi vàng' }
    ];
  }

  /**
   * Standardized 8-hour B1 -> C1 Daily Schedule Preset (480 min total study)
   * Scheduled Breaks: 11:00 -> 13:45 (Lunch & Rest) and 16:00 -> 20:00 (Dinner & Rest)
   */
  static getB1toC1EightHourPreset() {
    return [
      { id: 1, startTime: '07:00', endTime: '08:30', durationMinutes: 90, slotClass: SLOT_CLASS.DEEP, skill: 'grammar', title: 'Ngữ pháp C1 chuyên sâu & Cấu trúc câu học thuật' },
      { id: 2, startTime: '08:45', endTime: '10:15', durationMinutes: 90, slotClass: SLOT_CLASS.DEEP, skill: 'listening', title: 'Intensive Listening & Shadowing' },
      { id: 3, startTime: '10:20', endTime: '11:00', durationMinutes: 40, slotClass: SLOT_CLASS.NORMAL, skill: 'vocabulary', title: 'Từ vựng Collocations & Hệ thống SRS' },
      // Nghỉ trưa & phục hồi não bộ: 11:00 -> 13:45
      { id: 4, startTime: '13:45', endTime: '14:50', durationMinutes: 65, slotClass: SLOT_CLASS.NORMAL, skill: 'reading', title: 'Reading Comprehension & Phân tích văn bản C1' },
      { id: 5, startTime: '14:55', endTime: '16:00', durationMinutes: 65, slotClass: SLOT_CLASS.DEEP, skill: 'speaking', title: 'Luyện nói phản xạ Take 1 & 2 + 15p Phát âm IPA' },
      // Nghỉ chiều, ăn tối & thư giãn: 16:00 -> 20:00
      { id: 6, startTime: '20:00', endTime: '21:20', durationMinutes: 80, slotClass: SLOT_CLASS.DEEP, skill: 'writing', title: 'Writing Studio: PEEL Paragraph & Rewrite Rule' },
      { id: 7, startTime: '21:30', endTime: '22:20', durationMinutes: 50, slotClass: SLOT_CLASS.LIGHT, skill: 'review', title: 'Ôn tập SRS thẻ đến hạn & Sổ Lỗi Vàng' }
    ];
  }

  /**
   * Slices total daily minutes into structured slots respecting session limits
   * @param {number} totalMinutes Total study minutes available per day
   * @param {string} [startOfDay='08:00'] Default start time 'HH:mm'
   * @param {Array<string>} [prioritySkills] e.g. ['speaking', 'writing']
   * @returns {Array<{ startTime: string, endTime: string, durationMinutes: number, slotClass: string, skill: string }>}
   */
  static sessionize(totalMinutes = 120, startOfDay = '08:00', prioritySkills = ['speaking', 'writing']) {
    const minutes = Math.max(15, Number(totalMinutes) || 120);

    // If 12 hours (720 min), return the standardized Bootcamp preset
    if (minutes >= 720) {
      return this.getBootcampStandardPreset();
    }

    const slots = [];
    let remainingMinutes = minutes;
    let [currentHour, currentMin] = startOfDay.split(':').map(Number);

    const formatTime = (h, m) => {
      const hh = String(Math.floor(h) % 24).padStart(2, '0');
      const mm = String(Math.floor(m) % 60).padStart(2, '0');
      return `${hh}:${mm}`;
    };

    const addMinutesToTime = (h, m, add) => {
      const total = h * 60 + m + add;
      return [Math.floor(total / 60), total % 60];
    };

    // Define skill pool with priority given to weak skills
    const coreSkills = ['grammar', 'vocabulary', 'listening', 'reading', 'speaking', 'writing', 'review'];
    const orderedSkills = [
      ...prioritySkills.filter(s => coreSkills.includes(s)),
      ...coreSkills.filter(s => !prioritySkills.includes(s))
    ];
    let skillIndex = 0;

    while (remainingMinutes > 0) {
      let slotDuration = 0;
      let slotClass = SLOT_CLASS.NORMAL;

      if (remainingMinutes >= 75) {
        slotDuration = Math.min(90, Math.floor(remainingMinutes / 2) >= 60 ? 60 : 75);
        slotClass = SLOT_CLASS.DEEP;
      } else if (remainingMinutes >= 45) {
        slotDuration = remainingMinutes >= 50 ? 50 : 45;
        slotClass = SLOT_CLASS.NORMAL;
      } else if (remainingMinutes >= 25) {
        slotDuration = 25;
        slotClass = SLOT_CLASS.NORMAL;
      } else {
        slotDuration = remainingMinutes;
        slotClass = SLOT_CLASS.LIGHT;
      }

      const assignedSkill = orderedSkills[skillIndex % orderedSkills.length];
      skillIndex++;

      const startFormatted = formatTime(currentHour, currentMin);
      const [endHour, endMin] = addMinutesToTime(currentHour, currentMin, slotDuration);
      const endFormatted = formatTime(endHour, endMin);

      slots.push({
        startTime: startFormatted,
        endTime: endFormatted,
        durationMinutes: slotDuration,
        slotClass,
        skill: assignedSkill
      });

      remainingMinutes -= slotDuration;

      // 10-15 minute break between slots if more time remains
      if (remainingMinutes > 0) {
        const breakDuration = slotClass === SLOT_CLASS.DEEP ? 15 : 10;
        const [nextH, nextM] = addMinutesToTime(endHour, endMin, breakDuration);
        currentHour = nextH;
        currentMin = nextM;
      }
    }

    return slots;
  }
}
