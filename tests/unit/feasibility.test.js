import test from 'node:test';
import assert from 'node:assert/strict';
import { FeasibilityEngine } from '../../src/core/planner/feasibility.js';
import { FEASIBILITY_STATUS } from '../../src/core/domain/constants.js';

test('Feasibility Engine - Cognitive efficiency diminishing returns', () => {
  assert.equal(FeasibilityEngine.getCognitiveEfficiency(1), 1.00);
  assert.equal(FeasibilityEngine.getCognitiveEfficiency(2), 0.95);
  assert.equal(FeasibilityEngine.getCognitiveEfficiency(4), 0.90);
  assert.equal(FeasibilityEngine.getCognitiveEfficiency(6), 0.82);
  assert.equal(FeasibilityEngine.getCognitiveEfficiency(8), 0.72);
  assert.equal(FeasibilityEngine.getCognitiveEfficiency(10), 0.62);
  assert.equal(FeasibilityEngine.getCognitiveEfficiency(12), 0.55);
});

test('Feasibility Engine - Comfortable plan evaluation', () => {
  // 120 days, 4h/day, 6 days/week, required 200h -> should be comfortable
  const result = FeasibilityEngine.evaluate({
    requiredExpectedHours: 200,
    startDate: '2026-01-01',
    targetDate: '2026-05-01',
    dailyHours: 4,
    daysPerWeek: 6,
    adherenceFactor: 0.85
  });

  assert.equal(result.status, FEASIBILITY_STATUS.COMFORTABLE);
  assert.ok(result.coverageRatio >= 1.30);
  assert.ok(result.recommendations.length > 0);
});

test('Feasibility Engine - Tight / Unlikely evaluation generates recommendations', () => {
  // 60 days, 1h/day, required 500h -> unlikely
  const result = FeasibilityEngine.evaluate({
    requiredExpectedHours: 500,
    startDate: '2026-01-01',
    targetDate: '2026-03-01',
    dailyHours: 1,
    daysPerWeek: 5,
    adherenceFactor: 0.85
  });

  assert.equal(result.status, FEASIBILITY_STATUS.UNLIKELY);
  assert.ok(result.coverageRatio < 0.70);
  assert.ok(result.recommendations.length >= 2);
});
