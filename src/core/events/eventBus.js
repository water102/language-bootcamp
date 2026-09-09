/**
 * In-Memory EventBus for Internal Domain Events
 * Spec reference: docs/cefr-learning-planner-spec/02_SYSTEM_ARCHITECTURE.md section 7
 */

import { DOMAIN_EVENTS } from '../domain/constants.js';

class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();
    /** @type {Array<{ event: string, payload: any, timestamp: string }>} */
    this.eventHistory = [];
    this.maxHistory = 100;
  }

  /**
   * Subscribe to a domain event
   * @param {string} eventName
   * @param {Function} callback
   * @returns {() => void} Unsubscribe function
   */
  subscribe(eventName, callback) {
    if (typeof callback !== 'function') {
      throw new Error(`EventBus listener for "${eventName}" must be a function`);
    }
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);

    return () => {
      const subs = this.listeners.get(eventName);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) this.listeners.delete(eventName);
      }
    };
  }

  /**
   * Publish a domain event
   * @param {string} eventName
   * @param {any} [payload]
   */
  publish(eventName, payload = {}) {
    const entry = {
      event: eventName,
      payload,
      timestamp: new Date().toISOString()
    };

    this.eventHistory.push(entry);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    const subs = this.listeners.get(eventName);
    if (subs && subs.size > 0) {
      // Execute handlers safely
      subs.forEach(handler => {
        try {
          handler(payload, entry);
        } catch (error) {
          console.error(`[EventBus] Error handling event "${eventName}":`, error);
        }
      });
    }

    // Also support wildcard / catch-all listeners
    const allSubs = this.listeners.get('*');
    if (allSubs && allSubs.size > 0) {
      allSubs.forEach(handler => {
        try {
          handler(eventName, payload, entry);
        } catch (error) {
          console.error(`[EventBus] Error in wildcard listener for "${eventName}":`, error);
        }
      });
    }
  }

  /**
   * Clear all subscribers and history (useful for test resets)
   */
  reset() {
    this.listeners.clear();
    this.eventHistory = [];
  }

  /**
   * Get recent event history
   */
  getHistory() {
    return [...this.eventHistory];
  }
}

export const eventBus = new EventBus();
export { DOMAIN_EVENTS };
