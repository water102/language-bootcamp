/**
 * English C1 Bootcamp — Core Curriculum & Metadata
 * Data is externalized to public/data/bootcamp_data.json and fetched asynchronously from public/.
 * This module exports a reactive proxy that seamlessly forwards all accesses to the loaded JSON data.
 */

import { getBootcampData } from './core/data/dataLoader.js';

export const BOOTCAMP_DATA = new Proxy({}, {
  get(target, prop) {
    const data = getBootcampData();
    if (data && data[prop] !== undefined) {
      return data[prop];
    }
    // Safe empty fallbacks during initial hydration
    if (['dailySchedule', 'grammarMatrix', 'flashcardDeck', 'roadmap', 'gates', 'aiPrompts', 'starterPack'].includes(prop)) {
      return [];
    }
    if (prop === 'writingPrompts') return { A1_A2: [], B1: [], B2: [], C1: [] };
    if (prop === 'protocols') return { fatigueRule: {}, listening: [], reading: [], speaking: [], writing: [] };
    if (prop === 'ipaSounds') return { vowels: [], diphthongs: [], consonants: [] };
    return target[prop];
  },
  has(target, prop) {
    const data = getBootcampData();
    if (data) return prop in data;
    return prop in target;
  },
  ownKeys(target) {
    const data = getBootcampData();
    if (data) return Reflect.ownKeys(data);
    return Reflect.ownKeys(target);
  },
  getOwnPropertyDescriptor(target, prop) {
    const data = getBootcampData();
    if (data && prop in data) {
      return { value: data[prop], writable: true, enumerable: true, configurable: true };
    }
    return undefined;
  }
});

export default BOOTCAMP_DATA;
