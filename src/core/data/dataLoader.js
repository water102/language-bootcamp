/**
 * Isomorphic Data Loader & Fetch Client
 * Fetches curriculum data from public/data/*.json in browser,
 * with Node.js filesystem fallback for test environments.
 */

let cachedBootcampData = null;
let cachedGrammarLessons = null;
let cachedLearningContentPack = null;
let preloadPromise = null;

const isBrowser = typeof window !== 'undefined';

function getPublicUrl(fileName) {
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
    ? import.meta.env.BASE_URL
    : '/language-bootcamp/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}data/${fileName}`;
}

async function fetchJson(fileName) {
  if (isBrowser) {
    const url = getPublicUrl(fileName);
    const response = await fetch(url);
    if (!response.ok) {
      // Fallback try root /data/
      const fallbackUrl = `/data/${fileName}`;
      const fbResponse = await fetch(fallbackUrl);
      if (!fbResponse.ok) {
        throw new Error(`Failed to fetch ${fileName} from ${url} or ${fallbackUrl} (status: ${response.status})`);
      }
      return await fbResponse.json();
    }
    return await response.json();
  } else {
    // Node.js test environment: read from public/data via fs
    const fsMod = await import(/* @vite-ignore */ 'node:fs');
    const pathMod = await import(/* @vite-ignore */ 'node:path');
    const localPath = pathMod.resolve(process.cwd(), 'public/data', fileName);
    if (!fsMod.existsSync(localPath)) {
      throw new Error(`Local file not found: ${localPath}`);
    }
    const content = fsMod.readFileSync(localPath, 'utf-8');
    return JSON.parse(content);
  }
}

export async function loadBootcampData() {
  if (cachedBootcampData) return cachedBootcampData;
  cachedBootcampData = await fetchJson('bootcamp_data.json');
  return cachedBootcampData;
}

export async function loadGrammarLessons() {
  if (cachedGrammarLessons) return cachedGrammarLessons;
  cachedGrammarLessons = await fetchJson('grammar_lessons.json');
  return cachedGrammarLessons;
}

export async function loadLearningContentPack() {
  if (cachedLearningContentPack) return cachedLearningContentPack;
  cachedLearningContentPack = await fetchJson('learning_content_pack.json');
  return cachedLearningContentPack;
}

export async function preloadAllData() {
  if (preloadPromise) return preloadPromise;
  preloadPromise = Promise.all([
    loadBootcampData(),
    loadGrammarLessons(),
    loadLearningContentPack()
  ]).then(([bootcamp, grammar, pack]) => {
    cachedBootcampData = bootcamp;
    cachedGrammarLessons = grammar;
    cachedLearningContentPack = pack;
    return { bootcamp, grammar, pack };
  });
  return preloadPromise;
}

export function getBootcampData() {
  return cachedBootcampData;
}

export function getGrammarLessons() {
  return cachedGrammarLessons;
}

export function getLearningContentPack() {
  return cachedLearningContentPack;
}

// In Node.js environment (e.g. running tests), pre-populate immediately from local fs
if (!isBrowser) {
  try {
    const { readFileSync, existsSync } = await import(/* @vite-ignore */ 'node:fs');
    const { resolve } = await import(/* @vite-ignore */ 'node:path');
    const bPath = resolve('public/data/bootcamp_data.json');
    if (existsSync(bPath)) {
      cachedBootcampData = JSON.parse(readFileSync(bPath, 'utf-8'));
    }
    const gPath = resolve('public/data/grammar_lessons.json');
    if (existsSync(gPath)) {
      cachedGrammarLessons = JSON.parse(readFileSync(gPath, 'utf-8'));
    }
    const lPath = resolve('public/data/learning_content_pack.json');
    if (existsSync(lPath)) {
      cachedLearningContentPack = JSON.parse(readFileSync(lPath, 'utf-8'));
    }
  } catch (err) {
    // Non-fatal
  }
}
