import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAiWritingResponse } from '../../src/core/ai/writingResponseParser.js';

test('Writing AI Parser - successfully extracts outline, model essay and key assets from formatted response', () => {
  const sampleAiResponse = `### PART 1: DETAILED OUTLINE
- Topic Breakdown: Academic analysis of artificial intelligence
- Introduction: Hook, background and thesis
- Body 1: Economic impacts
- Body 2: Ethical considerations
- Conclusion: Summary and call to action

### PART 2: MODEL ESSAY
Artificial intelligence has indisputably permeated contemporary society, catalyzing profound shifts across numerous sectors. While skeptics highlight prospective employment displacement, the net ramifications overwhelmingly skew towards unprecedented productivity gains and cognitive augmentation.

### BONUS: KEY LEARNING ASSETS
- Catalyzing profound shifts: Thúc đẩy sự chuyển biến sâu sắc
- Cognitive augmentation: Mở rộng khả năng nhận thức
- Inversion: Seldom has a technological paradigm evolved so rapidly.`;

  const parsed = parseAiWritingResponse(sampleAiResponse);

  assert.ok(parsed.outline.includes('DETAILED OUTLINE'));
  assert.ok(parsed.outline.includes('Body 1: Economic impacts'));
  assert.ok(parsed.modelEssay.includes('Artificial intelligence has indisputably'));
  assert.ok(!parsed.modelEssay.includes('BONUS: KEY LEARNING'));
  assert.ok(parsed.keyAssets.includes('Catalyzing profound shifts'));
  assert.ok(parsed.keyAssets.includes('Inversion: Seldom'));
});

test('Writing AI Parser - fallback to raw text when no standard headings exist', () => {
  const plainEssay = 'This is a single unformatted C1 essay generated directly without headings.';
  const parsed = parseAiWritingResponse(plainEssay);

  assert.equal(parsed.outline, '');
  assert.equal(parsed.modelEssay, plainEssay);
  assert.equal(parsed.raw, plainEssay);
});
