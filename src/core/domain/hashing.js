/**
 * Canonical Hashing & Peer Identity Engine
 * Spec reference: docs/cefr-learning-planner-spec/03_DOMAIN_AND_STORAGE.md (section 6)
 */

/**
 * Deterministic canonical JSON stringification (keys sorted recursively)
 * @param {any} obj
 * @returns {string}
 */
export function canonicalStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalStringify(item)).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => {
    return JSON.stringify(key) + ':' + canonicalStringify(obj[key]);
  });

  return '{' + pairs.join(',') + '}';
}

/**
 * Calculates a SHA-256 hex hash from canonical data
 * @param {any} data
 * @returns {Promise<string>} 64-char hex hash
 */
export async function calculateCanonicalHash(data) {
  const canonical = canonicalStringify(data);

  // In browser or Node.js environment
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(canonical);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simple hash for older environments (djb2 + length)
  let hash = 5381;
  for (let i = 0; i < canonical.length; i++) {
    hash = ((hash << 5) + hash) + canonical.charCodeAt(i);
    hash = hash & hash;
  }
  return 'legacy_hash_' + Math.abs(hash).toString(16);
}

/**
 * Generates an anonymous, self-declared local Peer ID
 * @returns {string}
 */
export function createPeerId() {
  const rand = Array.from(
    typeof crypto !== 'undefined' && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint8Array(8))
      : [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]
  ).map(b => b.toString(16).padStart(2, '0')).join('');

  return `peer_${Date.now().toString(36)}_${rand}`;
}
