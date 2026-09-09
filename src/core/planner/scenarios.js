/**
 * Scenario Optimizer: Generates Balanced, Intensive, and Sustainable scenarios
 * Spec reference: docs/cefr-learning-planner-spec/04_PLANNER_ENGINE.md (section 10)
 */

import { SCENARIO_TYPES } from '../domain/constants.js';
import { FeasibilityEngine } from './feasibility.js';

export class ScenarioOptimizer {
  /**
   * Generates 3 viable study scenarios for a goal
   * @param {Object} params
   * @param {number} params.requiredExpectedHours
   * @param {string} params.startDate
   * @param {string} params.targetDate
   * @param {number} [params.baseDailyHours=2]
   * @returns {Record<string, any>}
   */
  static generateScenarios({
    requiredExpectedHours,
    startDate,
    targetDate,
    baseDailyHours = 2
  }) {
    // 1. Balanced Scenario
    const balancedDaily = Math.max(1.5, Number(baseDailyHours) || 2);
    const balancedEval = FeasibilityEngine.evaluate({
      requiredExpectedHours,
      startDate,
      targetDate,
      dailyHours: balancedDaily,
      daysPerWeek: 6,
      adherenceFactor: 0.85
    });

    const balanced = {
      type: SCENARIO_TYPES.BALANCED,
      title: 'Cân bằng (Balanced)',
      description: 'Tiến độ tiêu chuẩn, giữ 1 ngày xả hơi mỗi tuần, kết hợp học sâu và ôn tập bền bỉ.',
      dailyHours: balancedDaily,
      daysPerWeek: 6,
      targetDate,
      adherenceTarget: 0.85,
      burnoutRisk: 'THẤP',
      evaluation: balancedEval
    };

    // 2. Intensive Scenario (Bootcamp style)
    const intensiveDaily = Math.min(12, Math.max(4, Math.round(balancedDaily * 2)));
    const intensiveEval = FeasibilityEngine.evaluate({
      requiredExpectedHours,
      startDate,
      targetDate,
      dailyHours: intensiveDaily,
      daysPerWeek: 6.5,
      adherenceFactor: 0.90
    });

    const intensive = {
      type: SCENARIO_TYPES.INTENSIVE,
      title: 'Cường độ cao (Intensive Bootcamp)',
      description: 'Luyện tập dồn dập (4–12h/ngày) theo mô hình trại huấn luyện, tập trung tối đa để bứt phá nhanh.',
      dailyHours: intensiveDaily,
      daysPerWeek: 6.5,
      targetDate,
      adherenceTarget: 0.90,
      burnoutRisk: 'TRUNG BÌNH - CAO',
      evaluation: intensiveEval
    };

    // 3. Sustainable Scenario
    const sustainableDaily = Math.max(1, Math.round(balancedDaily * 0.7 * 10) / 10);
    // Might require a shifted deadline if coverage is too low
    const start = new Date(startDate);
    const end = new Date(targetDate);
    const totalDays = Math.max(30, Math.round((end.getTime() - start.getTime()) / 86400000));
    const shiftedDays = Math.round(totalDays * 1.4);
    const sustainableTargetDate = new Date(start.getTime() + shiftedDays * 86400000).toISOString().split('T')[0];

    const sustainableEval = FeasibilityEngine.evaluate({
      requiredExpectedHours,
      startDate,
      targetDate: sustainableTargetDate,
      dailyHours: sustainableDaily,
      daysPerWeek: 5,
      adherenceFactor: 0.92
    });

    const sustainable = {
      type: SCENARIO_TYPES.SUSTAINABLE,
      title: 'Bền bỉ (Sustainable Habit)',
      description: 'Thời lượng học gọn (1–1.5h/ngày, 5 ngày/tuần), kéo dài hạn chót để học nhẹ nhàng không áp lực.',
      dailyHours: sustainableDaily,
      daysPerWeek: 5,
      targetDate: sustainableTargetDate,
      adherenceTarget: 0.92,
      burnoutRisk: 'RẤT THẤP',
      evaluation: sustainableEval
    };

    return {
      [SCENARIO_TYPES.BALANCED]: balanced,
      [SCENARIO_TYPES.INTENSIVE]: intensive,
      [SCENARIO_TYPES.SUSTAINABLE]: sustainable
    };
  }
}
