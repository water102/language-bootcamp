import test from 'node:test';
import assert from 'node:assert/strict';
import { Sessionizer } from '../../src/core/planner/sessionizer.js';
import { SLOT_CLASS } from '../../src/core/domain/constants.js';

test('Sessionizer - Standardized Bootcamp 12h preset has exactly 720 study minutes', () => {
  const preset = Sessionizer.getBootcampStandardPreset();
  assert.equal(preset.length, 9);

  const totalStudyMinutes = preset.reduce((sum, s) => sum + s.durationMinutes, 0);
  assert.equal(totalStudyMinutes, 720); // 12 hours exactly

  // Ensure no slot exceeds 90 minutes
  preset.forEach(slot => {
    assert.ok(slot.durationMinutes <= 90);
    assert.ok(slot.durationMinutes >= 30);
  });
});

test('Sessionizer - Custom 120 minutes slices into structured slots with breaks', () => {
  const slots = Sessionizer.sessionize(120, '08:00', ['speaking', 'writing']);
  assert.ok(slots.length >= 2);

  const totalMinutes = slots.reduce((sum, s) => sum + s.durationMinutes, 0);
  assert.equal(totalMinutes, 120);

  // First slot should start at 08:00
  assert.equal(slots[0].startTime, '08:00');

  // Verify slots have assigned skills
  slots.forEach(slot => {
    assert.ok(slot.skill);
    assert.ok(slot.startTime && slot.endTime);
    assert.ok(slot.slotClass);
  });
});

test('Sessionizer - B1 to C1 8h preset has exactly 480 study minutes and respects break intervals', () => {
  const preset = Sessionizer.getB1toC1EightHourPreset();
  const totalStudyMinutes = preset.reduce((sum, s) => sum + s.durationMinutes, 0);
  assert.equal(totalStudyMinutes, 480); // 8 hours exactly

  // Check break 1: ends at 11:00, next starts at 13:45
  const morningLast = preset[2];
  const afternoonFirst = preset[3];
  assert.equal(morningLast.endTime, '11:00');
  assert.equal(afternoonFirst.startTime, '13:45');

  // Check break 2: ends at 16:00, next starts at 20:00
  const afternoonLast = preset[4];
  const eveningFirst = preset[5];
  assert.equal(afternoonLast.endTime, '16:00');
  assert.equal(eveningFirst.startTime, '20:00');
});
