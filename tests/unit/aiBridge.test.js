import test from 'node:test';
import assert from 'node:assert/strict';
import { PromptBuilder } from '../../src/core/ai/promptBuilder.js';
import { AiResponseValidator } from '../../src/core/ai/validator.js';
import { DiffEngine } from '../../src/core/ai/diffEngine.js';
import { AI_CONTRACT_VERSION } from '../../src/core/ai/aiContractConstants.js';

test('AI Bridge - PromptBuilder includes invariant constraints and inputHash', () => {
  const prompt = PromptBuilder.buildWeeklyDetailPrompt({
    weekNumber: 2,
    planId: 'plan_123',
    inputHash: 'hash_abc_123',
    currentLevel: 'A2',
    targetLevel: 'C1',
    slots: [
      { slotId: 'slot_1', date: '2026-03-02', startTime: '08:00', endTime: '09:30', durationMinutes: 90, assignedSkill: 'grammar' }
    ]
  });

  assert.ok(prompt.includes('hash_abc_123'));
  assert.ok(prompt.includes('plan_123'));
  assert.ok(prompt.includes('KHÔNG ĐƯỢC thay đổi slotId'));
  assert.ok(prompt.includes('KHÔNG ĐƯỢC vượt quá durationMinutes'));
});

test('AI Bridge - Validator passes on valid JSON matching fixed slots and hash', () => {
  const validPayload = {
    schemaVersion: AI_CONTRACT_VERSION,
    planId: 'plan_123',
    inputHash: 'hash_abc_123',
    weekNumber: 2,
    sessions: [
      {
        slotId: 'slot_1',
        title: 'Mastering Present Perfect vs Past Simple',
        objectives: ['Phân biệt mốc thời gian xác định và bất định'],
        activities: [
          { name: 'Khởi động', durationMinutes: 30, instructions: 'Đọc ví dụ' },
          { name: 'Luyện tập', durationMinutes: 60, instructions: 'Viết câu' }
        ]
      }
    ]
  };

  const result = AiResponseValidator.validate(validPayload, {
    expectedInputHash: 'hash_abc_123',
    expectedPlanId: 'plan_123',
    validSlotIds: new Set(['slot_1']),
    maxDurationsBySlot: { slot_1: 90 }
  });

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.validCount, 1);
});

test('AI Bridge - Validator rejects duration overflow and unknown slotId', () => {
  const invalidPayload = {
    schemaVersion: AI_CONTRACT_VERSION,
    planId: 'plan_123',
    inputHash: 'hash_abc_123',
    sessions: [
      {
        slotId: 'unknown_slot_xyz',
        title: 'Unknown slot test',
        objectives: ['test'],
        activities: [{ name: 'Over', durationMinutes: 120, instructions: '' }]
      }
    ]
  };

  const result = AiResponseValidator.validate(invalidPayload, {
    expectedInputHash: 'hash_abc_123',
    expectedPlanId: 'plan_123',
    validSlotIds: new Set(['slot_1']),
    maxDurationsBySlot: { slot_1: 90 }
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('không tồn tại')));
  assert.equal(result.invalidCount, 1);
});

test('AI Bridge - DiffEngine accurately detects added and updated sessions', () => {
  const existing = [
    { slotId: 'slot_1', title: 'Old Title', activities: [{ name: 'A', durationMinutes: 30 }] }
  ];

  const incoming = [
    { slotId: 'slot_1', title: 'New Improved Title', activities: [{ name: 'A', durationMinutes: 30 }] },
    { slotId: 'slot_2', title: 'Brand New Session', activities: [{ name: 'B', durationMinutes: 45 }] }
  ];

  const diff = DiffEngine.computeDiff(existing, incoming);
  assert.equal(diff.updated.length, 1);
  assert.equal(diff.added.length, 1);
  assert.equal(diff.totalChanges, 2);
});
