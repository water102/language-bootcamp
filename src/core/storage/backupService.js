/**
 * Full Backup & Restore Service
 * Spec reference: docs/cefr-learning-planner-spec/03_DOMAIN_AND_STORAGE.md (section 7)
 */

import { STORAGE_SCHEMA_VERSION } from '../domain/constants.js';
import { localStore } from './localStorageAdapter.js';
import { indexedDb, STORES } from './indexedDbAdapter.js';
import { calculateCanonicalHash } from '../domain/hashing.js';

export class BackupService {
  /**
   * Generates a full or partial backup object
   * @param {Object} options
   * @param {'ALL'|'STUDY_ONLY'} [options.scope='ALL']
   * @param {boolean} [options.includeChat=false]
   * @returns {Promise<Object>}
   */
  static async createBackup({ scope = 'ALL', includeChat = false } = {}) {
    const localData = localStore.read() || {};

    const backup = {
      app: 'CEFR Learning Planner',
      appVersion: '1.0.0',
      schemaVersion: STORAGE_SCHEMA_VERSION,
      scope,
      exportedAt: new Date().toISOString(),
      profile: localData.data?.profile || null,
      activeGoal: localData.data?.activeGoal || null,
      gamification: localData.data?.gamification || null,
      stores: {}
    };

    // Export study logs and vocabulary
    backup.stores.studyLogs = await indexedDb.getAll(STORES.STUDY_LOGS);
    backup.stores.vocabulary = await indexedDb.getAll(STORES.VOCABULARY);
    backup.stores.errorNotebook = await indexedDb.getAll(STORES.ERROR_NOTEBOOK);
    backup.stores.assessments = await indexedDb.getAll(STORES.ASSESSMENTS);

    if (scope === 'ALL') {
      backup.stores.plans = await indexedDb.getAll(STORES.PLANS);
      backup.stores.scheduleSlots = await indexedDb.getAll(STORES.SCHEDULE_SLOTS);
    }

    if (includeChat) {
      backup.stores.chatMessages = await indexedDb.getAll(STORES.CHAT_MESSAGES);
    }

    // Calculate content hash for integrity verification
    backup.contentHash = await calculateCanonicalHash(backup.stores);

    return backup;
  }

  /**
   * Downloads backup as a JSON file
   * @param {Object} backupData
   * @param {string} [filename]
   */
  static triggerDownload(backupData, filename) {
    if (typeof window === 'undefined') return;

    const datePart = new Date().toISOString().replace(/[:.]/g, '-');
    const name = filename || `cefr_learning_planner_backup_${datePart}.json`;

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Validates a backup payload before restoring
   * @param {any} backup
   * @returns {{ valid: boolean, errors: string[], summary: Object }}
   */
  static validateBackup(backup) {
    const errors = [];
    if (!backup || typeof backup !== 'object') {
      return { valid: false, errors: ['File sao lưu không đúng định dạng JSON hợp lệ'], summary: {} };
    }

    if (!backup.schemaVersion) {
      errors.push('Thiếu thông tin schemaVersion trong bản sao lưu');
    } else if (backup.schemaVersion > STORAGE_SCHEMA_VERSION) {
      errors.push(`Phiên bản sao lưu (${backup.schemaVersion}) mới hơn ứng dụng hiện tại (${STORAGE_SCHEMA_VERSION}).`);
    }

    if (!backup.stores || typeof backup.stores !== 'object') {
      errors.push('Thiếu dữ liệu stores trong bản sao lưu');
    }

    const summary = {
      profile: backup.profile?.nickname || 'Không có tên',
      exportedAt: backup.exportedAt || 'Không rõ ngày',
      studyLogsCount: backup.stores?.studyLogs?.length || 0,
      vocabularyCount: backup.stores?.vocabulary?.length || 0,
      errorsCount: backup.stores?.errorNotebook?.length || 0,
      plansCount: backup.stores?.plans?.length || 0
    };

    return {
      valid: errors.length === 0,
      errors,
      summary
    };
  }

  /**
   * Restores data from a validated backup
   * @param {Object} backup
   * @param {'REPLACE'|'MERGE'} [policy='REPLACE']
   */
  static async restoreBackup(backup, policy = 'REPLACE') {
    const validation = this.validateBackup(backup);
    if (!validation.valid) {
      throw new Error(`Dữ liệu không hợp lệ: ${validation.errors.join(', ')}`);
    }

    // 1. Restore localStore settings and profile
    if (backup.profile) {
      localStore.set('profile', backup.profile);
    }
    if (backup.activeGoal) {
      localStore.set('activeGoal', backup.activeGoal);
    }
    if (backup.gamification) {
      localStore.set('gamification', backup.gamification);
    }

    // 2. Restore stores into IndexedDB
    const stores = backup.stores || {};

    for (const [storeName, items] of Object.entries(stores)) {
      if (!Array.isArray(items)) continue;

      if (policy === 'REPLACE') {
        // Clear old records in this store
        const existing = await indexedDb.getAll(storeName);
        for (const item of existing) {
          const keyField = storeName === STORES.PLANS ? 'planId'
            : storeName === STORES.SCHEDULE_SLOTS ? 'slotId'
            : storeName === STORES.STUDY_LOGS ? 'logId'
            : storeName === STORES.VOCABULARY ? 'itemId'
            : storeName === STORES.ERROR_NOTEBOOK ? 'errorId'
            : storeName === STORES.ASSESSMENTS ? 'assessmentId'
            : 'id';
          if (item[keyField]) {
            await indexedDb.delete(storeName, item[keyField]);
          }
        }
      }

      // Put new items
      for (const item of items) {
        await indexedDb.put(storeName, item);
      }
    }

    return {
      success: true,
      policy,
      summary: validation.summary
    };
  }

  /**
   * Clears a specific store data without affecting other modules
   * @param {string} storeName
   */
  static async clearStore(storeName) {
    const items = await indexedDb.getAll(storeName);
    const keyField = storeName === STORES.PLANS ? 'planId'
      : storeName === STORES.SCHEDULE_SLOTS ? 'slotId'
      : storeName === STORES.STUDY_LOGS ? 'logId'
      : storeName === STORES.VOCABULARY ? 'itemId'
      : storeName === STORES.ERROR_NOTEBOOK ? 'errorId'
      : storeName === STORES.ASSESSMENTS ? 'assessmentId'
      : 'id';

    for (const item of items) {
      if (item[keyField]) {
        await indexedDb.delete(storeName, item[keyField]);
      }
    }
    return true;
  }
}
