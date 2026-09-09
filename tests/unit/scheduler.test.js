import test from 'node:test';
import assert from 'node:assert/strict';
import { Scheduler } from '../../src/core/planner/scheduler.js';
import { MVD_MODE } from '../../src/core/domain/constants.js';

test('Scheduler - Generates calendar schedule mapped to curriculum sourceDays', () => {
  const plan = Scheduler.generatePlanSchedule({
    planId: 'test_plan_1',
    goalId: 'test_goal_1',
    startDate: '2026-03-01',
    targetDate: '2026-03-14', // 14 calendar days
    dailyHours: 2,
    daysPerWeek: 6,
    nominalCurriculumDays: 120
  });

  assert.equal(plan.planId, 'test_plan_1');
  assert.ok(plan.slots.length > 0);
  assert.equal(plan.phases.length, 5);

  // Check that slots contain calendar dates and sourceDays
  const firstSlot = plan.slots[0];
  assert.ok(firstSlot.date.startsWith('2026-03'));
  assert.equal(firstSlot.sourceDay, 1);
  assert.ok([MVD_MODE.NORMAL, MVD_MODE.BUSY, MVD_MODE.EMERGENCY].includes(firstSlot.mvdTier));

  // Check that rest days are marked in daysMap
  const restDays = plan.daysMap.filter(d => d.isRestDay);
  assert.ok(restDays.length >= 1);
});

test('Scheduler - Weekly review replaces standard load on Day 7', () => {
  const plan = Scheduler.generatePlanSchedule({
    planId: 'test_plan_2',
    goalId: 'test_goal_2',
    startDate: '2026-03-01',
    targetDate: '2026-03-10',
    dailyHours: 2,
    daysPerWeek: 7, // no rest days
    nominalCurriculumDays: 120
  });

  const day7Slots = plan.slots.filter(s => s.sourceDay === 7);
  assert.ok(day7Slots.length > 0);
  // Weekly test slot should be present
  const hasAssessment = day7Slots.some(s => s.assignedSkill === 'assessment' || s.assignedSkill === 'review');
  assert.ok(hasAssessment);
});
