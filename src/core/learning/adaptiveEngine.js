/**
 * Adaptive Learning Engine
 * Spec reference: docs/cefr-learning-planner-spec/04_PLANNER_ENGINE.md (sections 18, 19, 20)
 * Phase F - Adaptive Learning
 */

export const SKILL_WEIGHTS_DEFAULT = {
  listening: 0.20,
  reading: 0.20,
  speaking: 0.25,
  writing: 0.20,
  pronunciation: 0.15
};

export class AdaptiveEngine {
  /**
   * Calculate Review Debt based on SRS cards and due dates
   * @param {Array<{id: string, box: number, nextReviewDate: string}>} flashcards
   * @param {string} [asOfDate] ISO date string
   * @returns {{ totalCards: number, dueCards: number, debtRatio: number, status: 'HEALTHY' | 'MODERATE' | 'OVERWHELMED' }}
   */
  static calculateReviewDebt(flashcards = [], asOfDate = new Date().toISOString().split('T')[0]) {
    if (!flashcards.length) {
      return { totalCards: 0, dueCards: 0, debtRatio: 0, status: 'HEALTHY' };
    }

    const dueCards = flashcards.filter(c => {
      if (!c.nextReviewDate) return true;
      return c.nextReviewDate <= asOfDate;
    }).length;

    const debtRatio = dueCards / flashcards.length;

    let status = 'HEALTHY';
    if (debtRatio > 0.40) status = 'OVERWHELMED';
    else if (debtRatio > 0.15) status = 'MODERATE';

    return {
      totalCards: flashcards.length,
      dueCards,
      debtRatio: Math.round(debtRatio * 100) / 100,
      status
    };
  }

  /**
   * Detect skill bottlenecks from session logs, error counts, and assessment ratings
   * @param {Array<{skill: string, score: number, durationMinutes: number, errors?: number}>} studyLogs
   * @returns {Array<{skill: string, avgScore: number, errorRate: number, isBottleneck: boolean, recommendation: string}>}
   */
  static detectBottlenecks(studyLogs = []) {
    const skills = ['listening', 'reading', 'speaking', 'writing', 'pronunciation'];
    const skillStats = {};

    skills.forEach(skill => {
      skillStats[skill] = { count: 0, totalScore: 0, errors: 0, duration: 0 };
    });

    studyLogs.forEach(log => {
      const s = log.skill?.toLowerCase();
      if (skillStats[s]) {
        skillStats[s].count++;
        skillStats[s].totalScore += (log.score || 70);
        skillStats[s].errors += (log.errors || 0);
        skillStats[s].duration += (log.durationMinutes || 0);
      }
    });

    return skills.map(skill => {
      const stats = skillStats[skill];
      const avgScore = stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 75;
      const errorRate = stats.count > 0 ? Math.round((stats.errors / stats.count) * 10) / 10 : 0;
      const isBottleneck = avgScore < 65 || errorRate > 3;

      let recommendation = 'Duy trì tiến độ học tập bình thường.';
      if (isBottleneck) {
        if (skill === 'speaking' || skill === 'pronunciation') {
          recommendation = 'Ưu tiên ghi âm Take 1 & 2 và luyện phát âm Shadowing 15 phút mỗi ngày.';
        } else if (skill === 'writing') {
          recommendation = 'Luyện viết 1 đoạn PEEL ngắn và áp dụng Sổ Lỗi Vàng trước khi viết bài dài.';
        } else {
          recommendation = 'Tăng cường flashcards theo cụm (lexical chunks) và nghe chủ động.';
        }
      }

      return {
        skill,
        avgScore,
        errorRate,
        isBottleneck,
        recommendation
      };
    });
  }

  /**
   * Adaptively adjust skill weights based on identified bottlenecks
   * @param {Record<string, number>} currentWeights
   * @param {Array<{skill: string, isBottleneck: boolean}>} bottlenecks
   * @returns {Record<string, number>} normalized adjusted weights summing to 1.0
   */
  static recalibrateSkillAllocation(currentWeights = SKILL_WEIGHTS_DEFAULT, bottlenecks = []) {
    const adjusted = { ...currentWeights };
    const bottleneckSkills = bottlenecks.filter(b => b.isBottleneck).map(b => b.skill);

    if (!bottleneckSkills.length) return adjusted;

    // Boost bottleneck skills by +0.05 each
    let totalBoost = 0;
    bottleneckSkills.forEach(skill => {
      if (adjusted[skill] !== undefined) {
        adjusted[skill] += 0.05;
        totalBoost += 0.05;
      }
    });

    // Reduce non-bottleneck skills proportionally
    const nonBottlenecks = Object.keys(adjusted).filter(k => !bottleneckSkills.includes(k));
    const reductionPerSkill = totalBoost / nonBottlenecks.length;

    nonBottlenecks.forEach(skill => {
      adjusted[skill] = Math.max(0.10, Math.round((adjusted[skill] - reductionPerSkill) * 100) / 100);
    });

    // Re-normalize sum to 1.0
    const sum = Object.values(adjusted).reduce((a, b) => a + b, 0);
    Object.keys(adjusted).forEach(k => {
      adjusted[k] = Math.round((adjusted[k] / sum) * 100) / 100;
    });

    return adjusted;
  }

  /**
   * Generate an adaptive replanning proposal
   * Invariant: Past completed slots remain immutable; only future slots are recalculated
   * @param {Object} plan
   * @param {string} currentDayId
   * @param {Array} studyLogs
   * @returns {{ replanNeeded: boolean, reason: string, suggestedWeights: Record<string, number> }}
   */
  static evaluateReplan(plan, currentDayId, studyLogs = []) {
    const bottlenecks = this.detectBottlenecks(studyLogs);
    const hasBottlenecks = bottlenecks.some(b => b.isBottleneck);

    if (hasBottlenecks) {
      const bottleneckNames = bottlenecks.filter(b => b.isBottleneck).map(b => b.skill).join(', ');
      const newWeights = this.recalibrateSkillAllocation(plan?.skillWeights, bottlenecks);
      return {
        replanNeeded: true,
        reason: `Phát hiện kỹ năng cần củng cố (${bottleneckNames}). Đề xuất tăng tỷ trọng thời gian cho các kỹ năng này trong các ngày tiếp theo.`,
        suggestedWeights: newWeights,
        bottlenecks
      };
    }

    return {
      replanNeeded: false,
      reason: 'Tiến độ học tập và các kỹ năng đang phát triển cân bằng.',
      suggestedWeights: plan?.skillWeights || SKILL_WEIGHTS_DEFAULT,
      bottlenecks
    };
  }
}
