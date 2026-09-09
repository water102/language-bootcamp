import test from 'node:test';
import assert from 'node:assert/strict';
import { AdaptiveEngine, SKILL_WEIGHTS_DEFAULT } from '../../src/core/learning/adaptiveEngine.js';

test('AdaptiveEngine - calculateReviewDebt calculates due ratio correctly', () => {
  const cards = [
    { id: '1', nextReviewDate: '2026-09-01' },
    { id: '2', nextReviewDate: '2026-09-02' },
    { id: '3', nextReviewDate: '2026-09-15' },
    { id: '4', nextReviewDate: '2026-09-20' }
  ];

  const debt = AdaptiveEngine.calculateReviewDebt(cards, '2026-09-09');
  assert.equal(debt.totalCards, 4);
  assert.equal(debt.dueCards, 2);
  assert.equal(debt.debtRatio, 0.5);
  assert.equal(debt.status, 'OVERWHELMED');
});

test('AdaptiveEngine - detectBottlenecks flags skills with low scores or high error rates', () => {
  const logs = [
    { skill: 'speaking', score: 55, errors: 4, durationMinutes: 60 },
    { skill: 'speaking', score: 60, errors: 5, durationMinutes: 60 },
    { skill: 'reading', score: 85, errors: 1, durationMinutes: 60 }
  ];

  const analysis = AdaptiveEngine.detectBottlenecks(logs);
  const speaking = analysis.find(s => s.skill === 'speaking');
  const reading = analysis.find(s => s.skill === 'reading');

  assert.equal(speaking.isBottleneck, true);
  assert.equal(reading.isBottleneck, false);
});

test('AdaptiveEngine - recalibrateSkillAllocation increases bottleneck skill weight', () => {
  const bottlenecks = [
    { skill: 'speaking', isBottleneck: true },
    { skill: 'writing', isBottleneck: false },
    { skill: 'reading', isBottleneck: false },
    { skill: 'listening', isBottleneck: false },
    { skill: 'pronunciation', isBottleneck: false }
  ];

  const original = { ...SKILL_WEIGHTS_DEFAULT };
  const recalibrated = AdaptiveEngine.recalibrateSkillAllocation(original, bottlenecks);

  assert.ok(recalibrated.speaking > original.speaking);
  const sum = Object.values(recalibrated).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1.0) < 0.05); // Sums closely to 1.0
});
