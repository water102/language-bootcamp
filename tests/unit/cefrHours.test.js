import test from 'node:test';
import assert from 'node:assert/strict';
import { CefrHoursEngine } from '../../src/core/planner/cefrHours.js';

test('CEFR Hours Engine - Cambridge baseline calculations', () => {
  // A0 position
  assert.equal(CefrHoursEngine.getCurrentEstimatedHours('A0', 0), 0);
  // A2 midpoint is 190, B1 midpoint is 375. At progress 0.5 -> 190 + 0.5*(375-190) = 282.5 -> 283
  const a2Mid = CefrHoursEngine.getCurrentEstimatedHours('A2', 0.5);
  assert.equal(a2Mid, 283);

  // At progress 1.0 -> should reach next level midpoint
  const a2Full = CefrHoursEngine.getCurrentEstimatedHours('A2', 1.0);
  assert.equal(a2Full, 375);
});

test('CEFR Hours Engine - Required hours range for A2 to C1', () => {
  // A2 (progress 0) has 190 midpoint. C1 midpoint is 750.
  // Expected = 750 - 190 = 560
  const result = CefrHoursEngine.calculateRequiredHours('A2', 0.0, 'C1');
  assert.equal(result.expected, 560);
  assert.equal(result.optimistic, Math.round(560 * 0.85)); // 476
  assert.equal(result.conservative, Math.round(560 * 1.20)); // 672
  assert.equal(result.targetMidpoint, 750);
});

test('CEFR Hours Engine - Target level already reached or lower', () => {
  const result = CefrHoursEngine.calculateRequiredHours('C1', 0.2, 'B2');
  assert.equal(result.expected, 0);
  assert.equal(result.optimistic, 0);
  assert.equal(result.conservative, 0);
});
