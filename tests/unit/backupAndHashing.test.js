import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalStringify, calculateCanonicalHash, createPeerId } from '../../src/core/domain/hashing.js';
import { BackupService } from '../../src/core/storage/backupService.js';

test('Hashing - Canonical JSON sorting produces deterministic output', async () => {
  const objA = { z: 1, a: 2, m: { y: 'test', b: 'nested' } };
  const objB = { a: 2, m: { b: 'nested', y: 'test' }, z: 1 };

  // Exact same canonical string
  assert.equal(canonicalStringify(objA), canonicalStringify(objB));

  const hashA = await calculateCanonicalHash(objA);
  const hashB = await calculateCanonicalHash(objB);
  assert.equal(hashA, hashB);
  assert.equal(hashA.length, 64); // SHA-256 hex length
});

test('Hashing - Peer ID generation is random and unique', () => {
  const peer1 = createPeerId();
  const peer2 = createPeerId();

  assert.ok(peer1.startsWith('peer_'));
  assert.notEqual(peer1, peer2);
});

test('BackupService - Schema validation detects invalid or missing version', () => {
  const invalidBackup = { someRandomData: 123 };
  const val1 = BackupService.validateBackup(invalidBackup);
  assert.equal(val1.valid, false);
  assert.ok(val1.errors.length > 0);

  const validBackup = {
    schemaVersion: 1,
    appVersion: '1.0.0',
    profile: { nickname: 'Nguyen' },
    stores: {
      studyLogs: [{ logId: 'log_1', plannedMinutes: 60 }]
    }
  };
  const val2 = BackupService.validateBackup(validBackup);
  assert.equal(val2.valid, true);
  assert.equal(val2.summary.profile, 'Nguyen');
  assert.equal(val2.summary.studyLogsCount, 1);
});
