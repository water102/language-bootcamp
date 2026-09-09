/**
 * LocalStorage Adapter for Small Settings, UI preferences & Schema Version
 * Spec reference: docs/cefr-learning-planner-spec/03_DOMAIN_AND_STORAGE.md
 */

import { STORAGE_SCHEMA_VERSION, CURRENT_STORAGE_KEY } from '../domain/constants.js';

export class LocalStorageAdapter {
  constructor(storageKey = CURRENT_STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  /**
   * Safe read of state from localStorage
   * @returns {any}
   */
  read() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[LocalStorageAdapter] Read failed for key "${this.storageKey}":`, e);
      return null;
    }
  }

  /**
   * Safe write to localStorage
   * @param {any} data
   * @returns {boolean}
   */
  write(data) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const payload = {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        data
      };
      window.localStorage.setItem(this.storageKey, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error(`[LocalStorageAdapter] Write failed for key "${this.storageKey}":`, e);
      return false;
    }
  }

  /**
   * Get item by property
   */
  get(prop, defaultValue = null) {
    const state = this.read();
    if (!state || !state.data) return defaultValue;
    return state.data[prop] !== undefined ? state.data[prop] : defaultValue;
  }

  /**
   * Set specific property
   */
  set(prop, value) {
    const existing = this.read();
    const data = existing && existing.data ? { ...existing.data } : {};
    data[prop] = value;
    return this.write(data);
  }

  /**
   * Remove key
   */
  remove() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.storageKey);
      }
    } catch (e) {
      console.warn(`[LocalStorageAdapter] Remove failed:`, e);
    }
  }
}

export const localStore = new LocalStorageAdapter();
