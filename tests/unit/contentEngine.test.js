import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ContentEngine } from '../../src/core/content/contentEngine.js';

test('ContentEngine - filters external resources by level and skill', () => {
  const allResources = ContentEngine.getResources();
  assert.ok(allResources.length >= 8, 'Expected at least 8 curated resources');

  const b1Resources = ContentEngine.getResources({ level: 'B1' });
  assert.ok(b1Resources.length > 0, 'Should find resources for B1');
  assert.ok(b1Resources.every(r => r.levels.includes('B1')), 'Every returned item must include B1');

  const listeningResources = ContentEngine.getResources({ skill: 'listening' });
  assert.ok(listeningResources.length > 0);
  assert.ok(listeningResources.every(r => r.skills.includes('listening')));
});

test('ContentEngine - Sentence Scramble generator and checker', () => {
  const scramble = ContentEngine.generateSentenceScramble('A1');
  assert.ok(scramble, 'Should generate scramble item');
  assert.ok(scramble.sentenceId, 'Must have sentenceId');
  assert.ok(Array.isArray(scramble.cleanTokens), 'Must have cleanTokens array');
  assert.ok(Array.isArray(scramble.scrambledTokens), 'Must have scrambledTokens array');

  // Correct check
  const correctCheck = ContentEngine.checkSentenceScramble(scramble.cleanTokens, scramble.cleanTokens);
  assert.equal(correctCheck.isCorrect, true);
  assert.equal(correctCheck.score, 100);

  // Wrong check
  const wrongTokens = [...scramble.cleanTokens].reverse();
  if (scramble.cleanTokens.length > 1) {
    const wrongCheck = ContentEngine.checkSentenceScramble(scramble.cleanTokens, wrongTokens);
    assert.equal(wrongCheck.isCorrect, false);
    assert.equal(wrongCheck.score, 0);
  }
});

test('ContentEngine - Dictation accuracy evaluation', () => {
  const groundTruth = "I drink coffee every morning before work.";
  const perfectInput = "I drink coffee every morning before work.";
  const evalPerfect = ContentEngine.evaluateDictation(groundTruth, perfectInput);
  assert.equal(evalPerfect.accuracy, 100);
  assert.equal(evalPerfect.isPerfect, true);

  const partialInput = "I drink tea every morning before work.";
  const evalPartial = ContentEngine.evaluateDictation(groundTruth, partialInput);
  assert.ok(evalPartial.accuracy < 100 && evalPartial.accuracy > 50);
  assert.equal(evalPartial.isPerfect, false);
});

test('ContentEngine - VOA Stories and Extensive Readers retrieval', () => {
  const voa = ContentEngine.getVoaStories();
  assert.ok(voa.length >= 4, 'Expected at least 4 VOA stories across CEFR levels');
  assert.ok(voa.some(s => s.level === 'A2'));
  assert.ok(voa.some(s => s.level === 'C1'));

  const readers = ContentEngine.getExtensiveReaders();
  assert.ok(readers.length >= 4, 'Expected at least 4 classic readers');
  assert.ok(readers.some(r => r.source.includes('Gutenberg')));
});
