/**
 * IndexedDB Repository Adapter for Heavy Domain Entities & History
 * Spec reference: docs/cefr-learning-planner-spec/03_DOMAIN_AND_STORAGE.md
 */

import { INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../domain/constants.js';

export const STORES = /** @type {const} */ ({
  PLANS: 'plans',
  SCHEDULE_SLOTS: 'scheduleSlots',
  STUDY_LOGS: 'studyLogs',
  ASSESSMENTS: 'assessments',
  VOCABULARY: 'vocabulary',
  ERROR_NOTEBOOK: 'errorNotebook',
  CHAT_MESSAGES: 'chatMessages',
  AUDIO_RECORDINGS: 'audioRecordings',
  AI_HISTORY: 'aiHistory',
  BACKUPS: 'backups'
});

export class IndexedDbAdapter {
  constructor(dbName = INDEXED_DB_NAME, version = INDEXED_DB_VERSION) {
    this.dbName = dbName;
    this.version = version;
    /** @type {IDBDatabase|null} */
    this.db = null;
    this._initPromise = null;
  }

  /**
   * Initialize or open the IndexedDB database
   * @returns {Promise<IDBDatabase|null>}
   */
  async getDb() {
    if (this.db) return this.db;
    if (this._initPromise) return this._initPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[IndexedDbAdapter] indexedDB is not available in current environment');
      return null;
    }

    this._initPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = request.result;

        // Plans store
        if (!db.objectStoreNames.contains(STORES.PLANS)) {
          db.createObjectStore(STORES.PLANS, { keyPath: 'planId' });
        }

        // ScheduleSlots store
        if (!db.objectStoreNames.contains(STORES.SCHEDULE_SLOTS)) {
          const store = db.createObjectStore(STORES.SCHEDULE_SLOTS, { keyPath: 'slotId' });
          store.createIndex('by_planId', 'planId', { unique: false });
          store.createIndex('by_date', 'date', { unique: false });
          store.createIndex('by_status', 'status', { unique: false });
        }

        // StudyLogs store
        if (!db.objectStoreNames.contains(STORES.STUDY_LOGS)) {
          const store = db.createObjectStore(STORES.STUDY_LOGS, { keyPath: 'logId' });
          store.createIndex('by_slotId', 'slotId', { unique: false });
          store.createIndex('by_planId', 'planId', { unique: false });
          store.createIndex('by_timestamp', 'timestamp', { unique: false });
        }

        // Assessments store
        if (!db.objectStoreNames.contains(STORES.ASSESSMENTS)) {
          const store = db.createObjectStore(STORES.ASSESSMENTS, { keyPath: 'assessmentId' });
          store.createIndex('by_planId', 'planId', { unique: false });
          store.createIndex('by_type', 'type', { unique: false });
        }

        // Vocabulary store
        if (!db.objectStoreNames.contains(STORES.VOCABULARY)) {
          const store = db.createObjectStore(STORES.VOCABULARY, { keyPath: 'itemId' });
          store.createIndex('by_nextReviewAt', 'nextReviewAt', { unique: false });
        }

        // ErrorNotebook store
        if (!db.objectStoreNames.contains(STORES.ERROR_NOTEBOOK)) {
          const store = db.createObjectStore(STORES.ERROR_NOTEBOOK, { keyPath: 'errorId' });
          store.createIndex('by_count', 'count', { unique: false });
          store.createIndex('by_status', 'status', { unique: false });
        }

        // ChatMessages store
        if (!db.objectStoreNames.contains(STORES.CHAT_MESSAGES)) {
          const store = db.createObjectStore(STORES.CHAT_MESSAGES, { keyPath: 'messageId' });
          store.createIndex('by_roomId', 'roomId', { unique: false });
          store.createIndex('by_sentAt', 'sentAt', { unique: false });
        }

        // AudioRecordings store (opt-in)
        if (!db.objectStoreNames.contains(STORES.AUDIO_RECORDINGS)) {
          db.createObjectStore(STORES.AUDIO_RECORDINGS, { keyPath: 'audioId' });
        }

        // AI History store
        if (!db.objectStoreNames.contains(STORES.AI_HISTORY)) {
          db.createObjectStore(STORES.AI_HISTORY, { keyPath: 'exchangeId' });
        }

        // Backups store
        if (!db.objectStoreNames.contains(STORES.BACKUPS)) {
          db.createObjectStore(STORES.BACKUPS, { keyPath: 'backupId' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        console.error('[IndexedDbAdapter] Database open failed:', request.error);
        reject(request.error);
      };
    });

    return this._initPromise;
  }

  /**
   * Put item into store
   */
  async put(storeName, item) {
    const db = await this.getDb();
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get item by key
   */
  async get(storeName, key) {
    const db = await this.getDb();
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all items from store
   */
  async getAll(storeName, count) {
    const db = await this.getDb();
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = count ? store.getAll(null, count) : store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete item by key
   */
  async delete(storeName, key) {
    const db = await this.getDb();
    if (!db) return false;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Query store by index
   */
  async queryByIndex(storeName, indexName, queryValue) {
    const db = await this.getDb();
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(queryValue);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDb = new IndexedDbAdapter();
