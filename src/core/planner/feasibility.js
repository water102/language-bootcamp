/**
 * Feasibility Evaluation & Cognitive Efficiency Engine
 * Spec reference: docs/cefr-learning-planner-spec/04_PLANNER_ENGINE.md (sections 7, 8, 9)
 */

import { FEASIBILITY_STATUS } from '../domain/constants.js';

export class FeasibilityEngine {
  /**
   * Cognitive efficiency diminishing returns curve for daily hours
   * @param {number} dailyHours
   * @returns {number}
   */
  static getCognitiveEfficiency(dailyHours) {
    const h = Number(dailyHours) || 0;
    if (h <= 0) return 1.00;
    if (h <= 1.0) return 1.00;
    if (h <= 2.0) return 0.95;
    if (h <= 4.0) return 0.90;
    if (h <= 6.0) return 0.82;
    if (h <= 8.0) return 0.72;
    if (h <= 10.0) return 0.62;
    return 0.55;
  }

  /**
   * Calculate effective study hours per day
   * @param {number} scheduledDailyHours
   * @param {number} adherenceFactor (e.g. 0.85)
   * @returns {number}
   */
  static calculateEffectiveDailyHours(scheduledDailyHours, adherenceFactor = 0.85) {
    const efficiency = this.getCognitiveEfficiency(scheduledDailyHours);
    return Math.round(scheduledDailyHours * efficiency * adherenceFactor * 100) / 100;
  }

  /**
   * Evaluate feasibility of bridging required hours within time and availability
   * @param {Object} params
   * @param {number} params.requiredExpectedHours
   * @param {string} params.startDate ISO date string 'YYYY-MM-DD'
   * @param {string} params.targetDate ISO date string 'YYYY-MM-DD'
   * @param {number} [params.dailyHours=2]
   * @param {number} [params.daysPerWeek=6]
   * @param {number} [params.adherenceFactor=0.85]
   * @returns {Object}
   */
  static evaluate({
    requiredExpectedHours,
    startDate,
    targetDate,
    dailyHours = 2,
    daysPerWeek = 6,
    adherenceFactor = 0.85
  }) {
    const start = new Date(startDate || new Date().toISOString().split('T')[0]);
    const end = new Date(targetDate || new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0]);

    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const totalWeeks = diffDays / 7;
    const totalStudyDays = Math.round(totalWeeks * Math.min(7, Math.max(1, daysPerWeek)));

    const effectiveDailyHours = this.calculateEffectiveDailyHours(dailyHours, adherenceFactor);
    const scheduledTotalHours = totalStudyDays * dailyHours;
    const effectiveTotalHours = Math.round(totalStudyDays * effectiveDailyHours);

    // If required is 0 (already reached or exceeded level)
    if (requiredExpectedHours <= 0) {
      return {
        status: FEASIBILITY_STATUS.COMFORTABLE,
        coverageRatio: 9.99,
        diffDays,
        totalStudyDays,
        scheduledTotalHours,
        effectiveTotalHours,
        requiredExpectedHours,
        recommendations: ['Mục tiêu hiện tại đã đạt hoặc hoàn thành. Bạn có thể đặt mục tiêu CEFR cao hơn.']
      };
    }

    const coverageRatio = Math.round((effectiveTotalHours / requiredExpectedHours) * 100) / 100;

    let status = FEASIBILITY_STATUS.UNLIKELY;
    if (coverageRatio >= 1.30) {
      status = FEASIBILITY_STATUS.COMFORTABLE;
    } else if (coverageRatio >= 1.05) {
      status = FEASIBILITY_STATUS.REALISTIC;
    } else if (coverageRatio >= 0.90) {
      status = FEASIBILITY_STATUS.AGGRESSIVE;
    } else if (coverageRatio >= 0.70) {
      status = FEASIBILITY_STATUS.VERY_AGGRESSIVE;
    } else {
      status = FEASIBILITY_STATUS.UNLIKELY;
    }

    // Suggestions when coverage is tight or unlikely
    const recommendations = [];
    if (coverageRatio < 1.05) {
      const neededEffectivePerDay = Math.round((requiredExpectedHours / totalStudyDays) * 100) / 100;
      recommendations.push(
        `Để đạt mục tiêu đúng hạn, cần ~${neededEffectivePerDay} giờ hiệu quả/ngày (tăng thêm khoảng ${Math.max(0.5, Math.round((neededEffectivePerDay - effectiveDailyHours) * 10) / 10)}h/ngày).`
      );

      const daysNeededAtCurrentPace = Math.round(requiredExpectedHours / Math.max(0.1, effectiveDailyHours));
      const extendedWeeks = Math.ceil((daysNeededAtCurrentPace / Math.max(1, daysPerWeek)));
      recommendations.push(
        `Hoặc nếu giữ nguyên thời lượng học ${dailyHours}h/ngày, nên kéo dài deadline thêm khoảng ${Math.max(1, extendedWeeks - Math.round(totalWeeks))} tuần.`
      );
    } else {
      recommendations.push(
        'Kế hoạch có tính khả thi tốt. Duy trì tính nhất quán và nghỉ ngơi hợp lý để đạt hiệu quả cao nhất.'
      );
    }

    return {
      status,
      coverageRatio,
      diffDays,
      totalStudyDays,
      scheduledTotalHours,
      effectiveTotalHours,
      requiredExpectedHours,
      recommendations
    };
  }
}
