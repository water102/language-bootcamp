/**
 * CEFR Cambridge Guided Learning Hours & Position Engine
 * Spec reference: docs/cefr-learning-planner-spec/04_PLANNER_ENGINE.md (sections 2, 3, 4)
 */

import { CEFR_LEVELS, CEFR_HOURS_BASELINE } from '../domain/constants.js';

export class CefrHoursEngine {
  /**
   * Get the level index in CEFR_LEVELS
   * @param {string} level
   * @returns {number}
   */
  static getLevelIndex(level) {
    const idx = CEFR_LEVELS.indexOf(level);
    return idx !== -1 ? idx : 0;
  }

  /**
   * Calculate estimated current cumulative hours
   * @param {string} currentLevel e.g. 'A2'
   * @param {number} progressWithinLevel 0.0 to 1.0
   * @returns {number}
   */
  static getCurrentEstimatedHours(currentLevel = 'A0', progressWithinLevel = 0.0) {
    const levelIdx = this.getLevelIndex(currentLevel);
    const clampedProgress = Math.max(0, Math.min(1, Number(progressWithinLevel) || 0));

    const currentBaseline = CEFR_HOURS_BASELINE[currentLevel] || CEFR_HOURS_BASELINE.A0;
    const currentMid = currentBaseline.midpoint;

    if (levelIdx >= CEFR_LEVELS.length - 1) {
      return currentMid;
    }

    const nextLevel = CEFR_LEVELS[levelIdx + 1];
    const nextMid = CEFR_HOURS_BASELINE[nextLevel].midpoint;

    return Math.round(currentMid + clampedProgress * (nextMid - currentMid));
  }

  /**
   * Calculate required hours range to bridge current level to target level
   * @param {string} currentLevel
   * @param {number} progressWithinLevel
   * @param {string} targetLevel
   * @returns {{ optimistic: number, expected: number, conservative: number, currentEstimatedHours: number, targetMidpoint: number }}
   */
  static calculateRequiredHours(currentLevel = 'A2', progressWithinLevel = 0.0, targetLevel = 'C1') {
    const currentIdx = this.getLevelIndex(currentLevel);
    const targetIdx = this.getLevelIndex(targetLevel);

    if (targetIdx <= currentIdx) {
      return {
        optimistic: 0,
        expected: 0,
        conservative: 0,
        currentEstimatedHours: this.getCurrentEstimatedHours(currentLevel, progressWithinLevel),
        targetMidpoint: CEFR_HOURS_BASELINE[targetLevel]?.midpoint || 0
      };
    }

    const currentHours = this.getCurrentEstimatedHours(currentLevel, progressWithinLevel);
    const targetBaseline = CEFR_HOURS_BASELINE[targetLevel] || CEFR_HOURS_BASELINE.C1;

    // Expected required hours
    const expected = Math.max(0, targetBaseline.midpoint - currentHours);

    // Optimistic: assuming high aptitude, strong native foundation or accelerated learning (-15%)
    const optimistic = Math.max(0, Math.round(expected * 0.85));

    // Conservative: accounting for review debt, pronunciation hurdles, complex grammar (+20%)
    const conservative = Math.max(0, Math.round(expected * 1.20));

    return {
      optimistic,
      expected,
      conservative,
      currentEstimatedHours: currentHours,
      targetMidpoint: targetBaseline.midpoint
    };
  }
}
