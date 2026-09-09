/**
 * Deterministic Schedule Generator
 * Spec reference:
 * - docs/cefr-learning-planner-spec/04_PLANNER_ENGINE.md
 * - docs/cefr-learning-planner-spec/18_BOOTCAMP_CURRICULUM_INTEGRATION.md
 */

import { createId, createScheduleSlot } from '../domain/types.js';
import { MVD_MODE, SLOT_CLASS } from '../domain/constants.js';
import { Sessionizer } from './sessionizer.js';

export class Scheduler {
  /**
   * Generates schedule slots from a LearningGoal
   * @param {Object} params
   * @param {string} params.planId
   * @param {string} params.goalId
   * @param {string} params.startDate 'YYYY-MM-DD'
   * @param {string} params.targetDate 'YYYY-MM-DD'
   * @param {number} [params.dailyHours=2]
   * @param {number} [params.daysPerWeek=6]
   * @param {Array<string>} [params.weakSkills]
   * @param {number} [params.nominalCurriculumDays=120]
   * @returns {Object}
   */
  static generatePlanSchedule({
    planId = createId('plan'),
    goalId,
    startDate,
    targetDate,
    dailyHours = 2,
    daysPerWeek = 6,
    weakSkills = ['speaking', 'writing'],
    nominalCurriculumDays = 120
  }) {
    const start = new Date(startDate || new Date().toISOString().split('T')[0]);
    const end = new Date(targetDate || new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0]);

    const dailyMinutes = Math.round((Number(dailyHours) || 2) * 60);
    const slots = [];
    const daysMap = [];

    let currentDate = new Date(start);
    let currentSourceDay = 1;
    let dayIndex = 0;

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday...

      // Check if this day is a study day or a scheduled rest day
      // For example, if daysPerWeek is 6, Sunday (0) can be rest/recovery
      const isRestDay = (daysPerWeek < 7 && dayOfWeek === 0) || (daysPerWeek <= 5 && dayOfWeek === 6);

      if (isRestDay) {
        // Optional light review or full rest
        daysMap.push({
          date: dateStr,
          isRestDay: true,
          sourceDay: null,
          slotsCount: 0
        });
      } else {
        // Active study day
        const sourceDay = Math.min(nominalCurriculumDays, currentSourceDay);
        const isWeeklyReviewDay = sourceDay % 7 === 0;

        // Generate day's session slots
        let daySlotsConfig = [];
        if (isWeeklyReviewDay) {
          // Weekly test & review replaces standard load rather than being added on top (spec 18.6)
          daySlotsConfig = [
            { startTime: '09:00', endTime: '10:30', durationMinutes: 90, slotClass: SLOT_CLASS.DEEP, skill: 'assessment', title: `Weekly Test & Rubric Checkpoint (Week ${Math.floor(sourceDay / 7)})` },
            { startTime: '11:00', endTime: '12:00', durationMinutes: 60, slotClass: SLOT_CLASS.NORMAL, skill: 'review', title: 'Rà soát lỗi sai & Lập kế hoạch tuần mới' },
            { startTime: '14:00', endTime: '15:00', durationMinutes: 60, slotClass: SLOT_CLASS.NORMAL, skill: 'speaking', title: 'Speaking Q&A và ghi nhận bằng chứng' }
          ];
        } else {
          daySlotsConfig = Sessionizer.sessionize(dailyMinutes, '08:00', weakSkills);
        }

        const daySlots = daySlotsConfig.map((cfg, sIdx) => {
          // Identify MVD tiers:
          // Slot 0 or primary review is kept for EMERGENCY; top 2 slots for BUSY; all for NORMAL
          let mvdTier = MVD_MODE.NORMAL;
          if (sIdx === 0) {
            mvdTier = MVD_MODE.EMERGENCY;
          } else if (sIdx === 1) {
            mvdTier = MVD_MODE.BUSY;
          }

          return createScheduleSlot({
            planId,
            date: dateStr,
            startTime: cfg.startTime,
            endTime: cfg.endTime,
            durationMinutes: cfg.durationMinutes,
            slotClass: cfg.slotClass,
            assignedSkill: cfg.skill,
            sourceDay,
            mvdTier,
            notes: cfg.title || ''
          });
        });

        slots.push(...daySlots);
        daysMap.push({
          date: dateStr,
          isRestDay: false,
          sourceDay,
          slotsCount: daySlots.length
        });

        currentSourceDay++;
      }

      // Next calendar day
      currentDate.setDate(currentDate.getDate() + 1);
      dayIndex++;
    }

    // Define major curriculum phases (A1, A2, B1, B2, C1 transition)
    const phases = [
      { phaseId: 'phase_1', title: 'Giai đoạn 1: Nền tảng & Củng cố (A1 - A2)', startSourceDay: 1, endSourceDay: 28 },
      { phaseId: 'phase_2', title: 'Giai đoạn 2: Phát triển & Liên kết ý (A2 - B1)', startSourceDay: 29, endSourceDay: 56 },
      { phaseId: 'phase_3', title: 'Giai đoạn 3: Tranh biện & Paraphrase (B1 - B2)', startSourceDay: 57, endSourceDay: 84 },
      { phaseId: 'phase_4', title: 'Giai đoạn 4: Độ chính xác & Mock Test (B2 - C1)', startSourceDay: 85, endSourceDay: 112 },
      { phaseId: 'phase_5', title: 'Giai đoạn 5: Sửa điểm yếu & Benchmark C1', startSourceDay: 113, endSourceDay: 120 }
    ];

    const totalPlannedMinutes = slots.reduce((sum, s) => sum + s.durationMinutes, 0);

    return {
      planId,
      goalId,
      startDate,
      targetDate,
      phases,
      slots,
      daysMap,
      totalStudyDays: daysMap.filter(d => !d.isRestDay).length,
      totalRestDays: daysMap.filter(d => d.isRestDay).length,
      totalSlotsCount: slots.length,
      totalPlannedMinutes,
      totalPlannedHours: Math.round((totalPlannedMinutes / 60) * 10) / 10
    };
  }
}
