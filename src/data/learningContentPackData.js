/**
 * Learning Content Pack Data Module
 * Data is externalized to public/data/learning_content_pack.json and fetched asynchronously from public/.
 */

import { getLearningContentPack } from '../core/data/dataLoader.js';

function getPack() {
  return getLearningContentPack() || {
    SOURCES: [],
    EXTERNAL_RESOURCES: [],
    TATOEBA_SENTENCES: [],
    VOA_STORIES: [],
    EXTENSIVE_READERS: [],
    CEFR_VOCAB_QUIZ: [],
    LICENSE_MATRIX: []
  };
}

function createArrayProxy(key) {
  return new Proxy([], {
    get(target, prop) {
      const list = getPack()[key] || [];
      if (prop === Symbol.iterator) {
        return list[Symbol.iterator].bind(list);
      }
      const val = list[prop];
      return typeof val === 'function' ? val.bind(list) : val;
    },
    has(target, prop) {
      const list = getPack()[key] || [];
      return prop in list;
    },
    ownKeys(target) {
      const list = getPack()[key] || [];
      return Reflect.ownKeys(list);
    },
    getOwnPropertyDescriptor(target, prop) {
      const list = getPack()[key] || [];
      if (prop in list) {
        return { value: list[prop], writable: true, enumerable: true, configurable: true };
      }
      return undefined;
    }
  });
}

export const SOURCES = createArrayProxy('SOURCES');
export const SOURCES_REGISTRY = SOURCES;
export const EXTERNAL_RESOURCES = createArrayProxy('EXTERNAL_RESOURCES');
export const TATOEBA_SENTENCES = createArrayProxy('TATOEBA_SENTENCES');
export const VOA_STORIES = createArrayProxy('VOA_STORIES');
export const EXTENSIVE_READERS = createArrayProxy('EXTENSIVE_READERS');
export const CEFR_VOCAB_QUIZ = createArrayProxy('CEFR_VOCAB_QUIZ');
export const LICENSE_MATRIX = createArrayProxy('LICENSE_MATRIX');
