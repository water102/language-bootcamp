/**
 * C1 Bootcamp 120-Day Curriculum Template & Mapping
 * Spec reference: docs/cefr-learning-planner-spec/18_BOOTCAMP_CURRICULUM_INTEGRATION.md (sections 3, 4, 7, 10)
 */

import { BOOTCAMP_DATA } from '../../data.js';

export const BOOTCAMP_CURRICULUM_TEMPLATE = {
  templateId: 'bootcamp_c1_120',
  templateVersion: '1.0.0',
  title: 'C1 Bootcamp — 120 Days / 12 Hours Master System',
  nominalDays: 120,
  targetLevel: 'C1',
  sourceRef: 'docs/c1-bootcamp-120-day/02_120_Day_Roadmap.md',

  /**
   * Day 0 Baseline Assessment Spec
   */
  day0Baseline: {
    dayId: 'curriculum_day_0',
    title: 'Day 0: Comprehensive Diagnostic & Baseline Placement',
    focus: 'Xác định xuất phát điểm thực tế cho 4 kỹ năng + Phát âm + Ngữ pháp',
    tasks: [
      { skill: 'listening', duration: '45 min', description: 'Bài nghe Cambridge Diagnostic (A2-C1)' },
      { skill: 'reading', duration: '60 min', description: 'Đọc hiểu học thuật & trắc nghiệm từ vựng' },
      { skill: 'writing', duration: '45 min', description: 'Viết bài luận 200–250 từ thể hiện quan điểm' },
      { skill: 'speaking', duration: '15 min', description: 'Thu âm 3–5 phút tự giới thiệu & lập luận theo chủ đề' },
      { skill: 'pronunciation', duration: '15 min', description: 'Kiểm tra 44 âm IPA và hiện tượng nối âm / ngữ điệu' }
    ]
  },

  /**
   * Gates definition
   */
  gates: BOOTCAMP_DATA.gates || [],

  /**
   * Retrieve a specific nominal curriculum day (1 to 120)
   * @param {number} sourceDay
   * @returns {Object|null}
   */
  getDay(sourceDay) {
    const dayNum = Number(sourceDay);
    if (dayNum === 0) return this.day0Baseline;
    const item = BOOTCAMP_DATA.roadmap.find(d => d.day === dayNum);
    if (!item) return null;

    return {
      curriculumDayId: `curriculum_day_${dayNum}`,
      sourceDay: dayNum,
      week: item.week,
      levelFocus: item.level,
      grammarTopic: item.grammar,
      vocabularyTopic: item.vocab,
      speakingPrompt: item.speaking,
      writingPrompt: item.writing,
      kpi: item.kpi,
      isWeeklyTest: !!item.isWeeklyTest,
      isGate: !!item.isGate
    };
  },

  /**
   * Get all 120 curriculum days
   * @returns {Array<Object>}
   */
  getAllDays() {
    return BOOTCAMP_DATA.roadmap.map(item => ({
      curriculumDayId: `curriculum_day_${item.day}`,
      sourceDay: item.day,
      week: item.week,
      levelFocus: item.level,
      grammarTopic: item.grammar,
      vocabularyTopic: item.vocab,
      speakingPrompt: item.speaking,
      writingPrompt: item.writing,
      kpi: item.kpi,
      isWeeklyTest: !!item.isWeeklyTest,
      isGate: !!item.isGate
    }));
  }
};
